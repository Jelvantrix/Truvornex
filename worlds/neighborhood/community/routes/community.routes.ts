/**
 * Community World API Routes
 * All routes under /api/community
 */

import { Router, Request, Response } from 'express';
import { pool } from '../../_core/neighborhood.schema';
import { CommunityEvents } from '../../_core/neighborhood.events';
import { getEventBus } from '../../_core/neighborhood.events';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * GET /api/community/posts
 * Get feed posts
 */
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { zone_id, neighborhood_id, scope, type, limit = '20', offset = '0' } = req.query;

    let query = `
      SELECT cp.*, u.full_name AS author_name, u.avatar_url AS author_avatar,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = cp.id) AS reaction_count,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = cp.id) AS comment_count
      FROM community_posts cp
      LEFT JOIN users u ON u.id = cp.author_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND cp.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (neighborhood_id) {
      query += ` AND cp.neighborhood_id = $${paramIndex++}`;
      params.push(neighborhood_id);
    }

    if (scope) {
      query += ` AND cp.visibility_scope = $${paramIndex++}`;
      params.push(scope);
    }

    if (type) {
      query += ` AND cp.type = $${paramIndex++}`;
      params.push(type);
    }

    query += ` ORDER BY cp.is_pinned DESC, cp.created_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /community/posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/community/posts/:id
 * Get single post with comments
 */
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT cp.*, u.full_name AS author_name, u.avatar_url AS author_avatar
      FROM community_posts cp
      LEFT JOIN users u ON u.id = cp.author_id
      WHERE cp.id = $1
      `,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get reactions
    const { rows: reactions } = await pool.query(
      `SELECT reaction_type, COUNT(*) as count FROM post_reactions WHERE post_id = $1 GROUP BY reaction_type`,
      [req.params.id]
    );

    // Get comments
    const { rows: comments } = await pool.query(
      `
      SELECT pc.*, u.full_name AS author_name, u.avatar_url AS author_avatar
      FROM post_comments pc
      LEFT JOIN users u ON u.id = pc.author_id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
      `,
      [req.params.id]
    );

    res.json({ data: { ...rows[0], reactions: Object.fromEntries(reactions.map(r => [r.reaction_type, r.count])), comments } });
  } catch (err) {
    console.error('GET /community/posts/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

/**
 * POST /api/community/posts
 * Create a new post
 */
router.post('/posts', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, neighborhood_id, type, title, body, image_url, tags, visibility_scope } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Body required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO community_posts
        (zone_id, neighborhood_id, type, title, body, author_name, author_email, author_id, image_url, tags, visibility_scope)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        zone_id || null,
        neighborhood_id || null,
        type || 'post',
        title || null,
        body,
        req.session.user.full_name || req.session.user.email,
        req.session.user.email,
        req.session.user.id,
        image_url || null,
        tags || [],
        visibility_scope || 'zone'
      ]
    );

    const post = rows[0];

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('community', 'post.created', {
      postId: post.id,
      zoneId: post.zone_id,
      authorId: post.author_id,
      type: post.type,
      visibilityScope: post.visibility_scope,
    });

    res.json({ data: post });
  } catch (err) {
    console.error('POST /community/posts error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * POST /api/community/posts/:id/react
 * React to a post
 */
router.post('/posts/:id/react', requireAuth, async (req: Request, res: Response) => {
  const { reaction_type } = req.body;
  const allowed = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];

  if (!allowed.includes(reaction_type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  try {
    await pool.query(
      `
      INSERT INTO post_reactions (post_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, user_id, reaction_type) DO NOTHING
      `,
      [req.params.id, req.session.user.id, reaction_type]
    );

    // Update post reaction count
    await pool.query(
      `
      UPDATE community_posts SET reactions = jsonb_set(
        COALESCE(reactions, '{}'),
        '{' || $1 || '}',
        COALESCE((reactions->$1)::int, 0) + 1
      ) WHERE id = $2
      `,
      [reaction_type, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('POST /community/posts/:id/react error:', err);
    res.status(500).json({ error: 'Failed to react' });
  }
});

/**
 * POST /api/community/posts/:id/comment
 * Comment on a post
 */
router.post('/posts/:id/comment', requireAuth, async (req: Request, res: Response) => {
  const { body, parent_comment_id } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Comment body required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO post_comments (post_id, author_email, author_name, author_id, body, parent_comment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        req.params.id,
        req.session.user.email,
        req.session.user.full_name || req.session.user.email,
        req.session.user.id,
        body,
        parent_comment_id || null
      ]
    );

    // Update reply count
    await pool.query(
      `UPDATE community_posts SET reply_count = COALESCE(reply_count, 0) + 1 WHERE id = $1`,
      [req.params.id]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /community/posts/:id/comment error:', err);
    res.status(500).json({ error: 'Failed to comment' });
  }
});

/**
 * GET /api/community/polls
 * Get polls
 */
router.get('/polls', async (req: Request, res: Response) => {
  try {
    const { zone_id, neighborhood_id, scope, status } = req.query;

    let query = `
      SELECT np.*, u.full_name AS created_by_name
      FROM neighborhood_polls np
      LEFT JOIN users u ON u.id = np.created_by
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND np.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (neighborhood_id) {
      query += ` AND np.neighborhood_id = $${paramIndex++}`;
      params.push(neighborhood_id);
    }

    if (scope) {
      query += ` AND np.visibility_scope = $${paramIndex++}`;
      params.push(scope);
    }

    if (status === 'open') {
      query += ` AND np.is_closed = false AND (np.expires_at IS NULL OR np.expires_at > NOW())`;
    } else if (status === 'closed') {
      query += ` AND (np.is_closed = true OR np.expires_at <= NOW())`;
    }

    query += ` ORDER BY np.created_at DESC LIMIT 20`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /community/polls error:', err);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

/**
 * POST /api/community/polls
 * Create a new poll
 */
router.post('/polls', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, neighborhood_id, question, options, expires_at, visibility_scope } = req.body;

  if (!question || !options?.length) {
    return res.status(400).json({ error: 'Question and options required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO neighborhood_polls
        (zone_id, neighborhood_id, question, options, created_by, expires_at, visibility_scope)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        zone_id || null,
        neighborhood_id || null,
        question,
        JSON.stringify(options.map((o: any, i: number) => ({ text: o, index: i }))),
        req.session.user.id,
        expires_at || null,
        visibility_scope || 'zone'
      ]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /community/polls error:', err);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

/**
 * POST /api/community/polls/:id/vote
 * Vote on a poll
 */
router.post('/polls/:id/vote', requireAuth, async (req: Request, res: Response) => {
  const { option_index } = req.body;

  if (typeof option_index !== 'number') {
    return res.status(400).json({ error: 'option_index required' });
  }

  try {
    const { rows: pollRows } = await pool.query(
      `SELECT * FROM neighborhood_polls WHERE id = $1`,
      [req.params.id]
    );

    if (!pollRows[0]) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = pollRows[0];

    if (poll.is_closed || (poll.expires_at && new Date(poll.expires_at) < new Date())) {
      return res.status(400).json({ error: 'Poll closed' });
    }

    // Check if already voted
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [poll.id, req.session.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Record vote
    await pool.query(
      `INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3)`,
      [poll.id, req.session.user.id, option_index]
    );

    // Update poll results
    const options = poll.options as any[];
    if (options[option_index]) {
      options[option_index].votes = (options[option_index].votes || 0) + 1;
    }
    await pool.query(
      `UPDATE neighborhood_polls SET options = $1, total_votes = COALESCE(total_votes, 0) + 1 WHERE id = $2`,
      [JSON.stringify(options), poll.id]
    );

    // Emit event if poll just closed
    const totalVotes = (await pool.query(`SELECT COUNT(*) FROM poll_votes WHERE poll_id = $1`, [poll.id])).rows[0].count;
    if (totalVotes >= (options.length * 2)) { // arbitrary threshold
      const eventBus = getEventBus();
      eventBus.publish('community', 'poll.closed', {
        postId: poll.id,
        zoneId: poll.zone_id,
        authorId: poll.created_by,
        type: 'poll',
        visibilityScope: poll.visibility_scope,
      });
    }

    res.json({ success: true, results: options });
  } catch (err) {
    console.error('POST /community/polls/:id/vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

/**
 * GET /api/community/events
 * Get events
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { zone_id, neighborhood_id, scope, upcoming = 'true' } = req.query;

    let query = `
      SELECT e.*, u.full_name AS organizer_name, u.avatar_url AS organizer_avatar
      FROM events e
      LEFT JOIN users u ON u.id = e.organizer_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND e.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (neighborhood_id) {
      query += ` AND e.neighborhood_id = $${paramIndex++}`;
      params.push(neighborhood_id);
    }

    if (scope) {
      query += ` AND e.visibility_scope = $${paramIndex++}`;
      params.push(scope);
    }

    if (upcoming === 'true') {
      query += ` AND (e.date IS NULL OR e.date >= CURRENT_DATE)`;
    }

    query += ` ORDER BY e.date ASC NULLS LAST LIMIT 30`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /community/events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * POST /api/community/events
 * Create a new event
 */
router.post('/events', requireAuth, async (req: Request, res: Response) => {
  const {
    zone_id, neighborhood_id, title, description, category, venue_name, venue_type,
    address, date, start_time, end_time, ticket_price, is_free, total_tickets,
    bundle_services, cover_image_url, visibility_scope, capacity, tags
  } = req.body;

  if (!title || !date || !venue_name) {
    return res.status(400).json({ error: 'Title, date, and venue required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO events
        (zone_id, neighborhood_id, title, description, category, venue_name, venue_type,
         address, date, start_time, end_time, organizer_name, organizer_id,
         ticket_price, is_free, total_tickets, bundle_services, cover_image_url,
         visibility_scope, capacity, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
      `,
      [
        zone_id || null, neighborhood_id || null, title, description || null, category || 'community',
        venue_name, venue_type || null, address || null, date, start_time || null, end_time || null,
        req.session.user.full_name || req.session.user.email, req.session.user.id,
        is_free ? 0 : (ticket_price || 0), is_free !== false, total_tickets || 100,
        JSON.stringify(bundle_services || []), cover_image_url || null,
        visibility_scope || 'zone', capacity || null, tags || []
      ]
    );

    const event = rows[0];

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('community', 'event.published', {
      postId: event.id,
      zoneId: event.zone_id,
      authorId: event.organizer_id,
      type: 'event',
      visibilityScope: event.visibility_scope,
    });

    res.json({ data: event });
  } catch (err) {
    console.error('POST /community/events error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * POST /api/community/event-tickets
 * Get ticket for event
 */
router.post('/event-tickets', requireAuth, async (req: Request, res: Response) => {
  const { event_id, quantity = 1 } = req.body;

  try {
    const { rows: eventRows } = await pool.query(`SELECT * FROM events WHERE id = $1`, [event_id]);

    if (!eventRows[0]) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];

    if (event.tickets_sold + quantity > event.total_tickets) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    const crypto = await import('crypto');
    const ticketCode = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const { rows } = await pool.query(
      `
      INSERT INTO event_tickets (event_id, event_title, buyer_email, buyer_name, buyer_id, quantity, unit_price, total_amount, ticket_code, qr_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        event.id, event.title, req.session.user.email,
        req.session.user.full_name || req.session.user.email, req.session.user.id,
        quantity, event.ticket_price || 0, (event.ticket_price || 0) * quantity,
        ticketCode, `qr-${ticketCode}`
      ]
    );

    // Update tickets sold
    await pool.query(
      `UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2`,
      [quantity, event.id]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /community/event-tickets error:', err);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

/**
 * GET /api/community/announcements
 * Get active announcements
 */
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const { zone_id, neighborhood_id } = req.query;

    let query = `
      SELECT ca.*, u.full_name AS author_name
      FROM community_announcements ca
      LEFT JOIN users u ON u.id = ca.author_id
      WHERE (ca.starts_at IS NULL OR ca.starts_at <= NOW())
        AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND ca.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (neighborhood_id) {
      query += ` AND ca.neighborhood_id = $${paramIndex++}`;
      params.push(neighborhood_id);
    }

    query += ` ORDER BY ca.priority DESC, ca.created_at DESC LIMIT 10`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /community/announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;