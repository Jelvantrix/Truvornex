/**
 * Group Buy World API Routes
 * All routes under /api/group-buy
 */

import { Router, Request, Response } from 'express';
import { pool } from '../../_core/neighborhood.schema';
import { GroupBuyEvents } from '../../_core/neighborhood.events';
import { getEventBus } from '../../_core/neighborhood.events';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * GET /api/group-buys
 * Get all open group buys
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { zone_id, status } = req.query;

    let query = `
      SELECT gb.*, u.full_name AS initiator_name, u.avatar_url AS initiator_avatar
      FROM group_buys gb
      LEFT JOIN users u ON u.id = gb.initiator_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND gb.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (status) {
      query += ` AND gb.status = $${paramIndex++}`;
      params.push(status);
    } else {
      query += ` AND gb.status IN ('open','locked')`;
    }

    query += ` ORDER BY gb.created_at DESC LIMIT 50`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /group-buys error:', err);
    res.status(500).json({ error: 'Failed to fetch group buys' });
  }
});

/**
 * GET /api/group-buys/:id
 * Get single group buy with participants
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT gb.*, u.full_name AS initiator_name, u.avatar_url AS initiator_avatar
      FROM group_buys gb
      LEFT JOIN users u ON u.id = gb.initiator_id
      WHERE gb.id = $1
      `,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Group buy not found' });
    }

    // Get participants
    const { rows: participants } = await pool.query(
      `
      SELECT gbp.*, u.full_name, u.avatar_url
      FROM group_buy_participants gbp
      JOIN users u ON u.id = gbp.user_id
      WHERE gbp.group_buy_id = $1
      ORDER BY gbp.joined_at ASC
      `,
      [req.params.id]
    );

    res.json({ data: { ...rows[0], participants } });
  } catch (err) {
    console.error('GET /group-buys/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch group buy' });
  }
});

/**
 * POST /api/group-buys
 * Create a new group buy
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, service_category, description, target_participants, discount_percent, max_discount_percent, expires_at } = req.body;

  if (!service_category) {
    return res.status(400).json({ error: 'Service category required' });
  }

  try {
    const expiresAt = expires_at ? new Date(expires_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { rows } = await pool.query(
      `
      INSERT INTO group_buys
        (zone_id, service_category, description, initiator_id, target_participants, discount_percent, max_discount_percent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        zone_id || null,
        service_category,
        description || null,
        req.session.user.id,
        target_participants || 5,
        discount_percent || 15,
        max_discount_percent || 35,
        expiresAt
      ]
    );

    const groupBuy = rows[0];

    // Add initiator as participant
    await pool.query(
      `INSERT INTO group_buy_participants (group_buy_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [groupBuy.id, req.session.user.id]
    );

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('group-buy', 'deal.created', {
      dealId: groupBuy.id,
      zoneId: groupBuy.zone_id,
      serviceCategory: groupBuy.service_category,
      initiatorId: groupBuy.initiator_id,
      targetParticipants: groupBuy.target_participants,
      currentParticipants: 1,
      discountPercent: groupBuy.discount_percent,
    });

    res.json({ data: groupBuy });
  } catch (err) {
    console.error('POST /group-buys error:', err);
    res.status(500).json({ error: 'Failed to create group buy' });
  }
});

/**
 * POST /api/group-buys/:id/join
 * Join a group buy
 */
router.post('/:id/join', requireAuth, async (req: Request, res: Response) => {
  const { commitment_level, notes } = req.body;

  try {
    const { rows: buyRows } = await pool.query(
      `SELECT * FROM group_buys WHERE id = $1`,
      [req.params.id]
    );

    if (!buyRows[0]) {
      return res.status(404).json({ error: 'Group buy not found' });
    }

    const buy = buyRows[0];

    if (buy.status !== 'open' && buy.status !== 'locked') {
      return res.status(400).json({ error: 'Group buy not accepting participants' });
    }

    if (new Date(buy.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Group buy has expired' });
    }

    // Check if already joined
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM group_buy_participants WHERE group_buy_id = $1 AND user_id = $2`,
      [req.params.id, req.session.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already joined this group buy' });
    }

    // Add participant
    await pool.query(
      `INSERT INTO group_buy_participants (group_buy_id, user_id, commitment_level, notes) VALUES ($1, $2, $3, $4)`,
      [req.params.id, req.session.user.id, commitment_level || 'full', notes || null]
    );

    // Update participant count
    const newCount = buy.current_participants + 1;
    await pool.query(
      `UPDATE group_buys SET current_participants = $1, updated_at = NOW() WHERE id = $2`,
      [newCount, req.params.id]
    );

    // Check if target reached -> lock the deal
    if (newCount >= buy.target_participants && buy.status === 'open') {
      await pool.query(
        `UPDATE group_buys SET status = 'locked', updated_at = NOW() WHERE id = $1`,
        [req.params.id]
      );

      // Emit activation event
      const eventBus = getEventBus();
      eventBus.publish('group-buy', 'deal.activated', {
        dealId: buy.id,
        zoneId: buy.zone_id,
        serviceCategory: buy.service_category,
        initiatorId: buy.initiator_id,
        targetParticipants: buy.target_participants,
        currentParticipants: newCount,
        discountPercent: buy.discount_percent,
      });
    }

    res.json({ success: true, currentParticipants: newCount, locked: newCount >= buy.target_participants });
  } catch (err) {
    console.error('POST /group-buys/:id/join error:', err);
    res.status(500).json({ error: 'Failed to join group buy' });
  }
});

/**
 * GET /api/group-buys/my/participations
 * Get current user's group buy participations
 */
router.get('/my/participations', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT gbp.*, gb.service_category, gb.description, gb.status, gb.target_participants, gb.current_participants, gb.discount_percent, gb.expires_at
      FROM group_buy_participants gbp
      JOIN group_buys gb ON gb.id = gbp.group_buy_id
      WHERE gbp.user_id = $1
      ORDER BY gbp.joined_at DESC
      `,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /group-buys/my/participations error:', err);
    res.status(500).json({ error: 'Failed to fetch participations' });
  }
});

/**
 * POST /api/group-buys/:id/activate
 * Provider confirms deal (activate)
 */
router.post('/:id/activate', requireAuth, async (req: Request, res: Response) => {
  const { provider_id, final_price, original_price, deal_terms, expires_at } = req.body;

  // Verify user is provider
  if (req.session.user.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can activate deals' });
  }

  try {
    const { rows: buyRows } = await pool.query(
      `SELECT * FROM group_buys WHERE id = $1`,
      [req.params.id]
    );

    if (!buyRows[0]) {
      return res.status(404).json({ error: 'Group buy not found' });
    }

    const buy = buyRows[0];

    if (buy.status !== 'locked' && buy.status !== 'open') {
      return res.status(400).json({ error: 'Group buy not ready for activation' });
    }

    if (buy.current_participants < buy.target_participants) {
      return res.status(400).json({ error: 'Target participants not reached' });
    }

    const discountApplied = ((original_price - final_price) / original_price) * 100;

    // Create deal
    const { rows: dealRows } = await pool.query(
      `
      INSERT INTO group_buy_deals
        (group_buy_id, provider_id, final_price, original_price, discount_applied, participants_count, deal_terms, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        buy.id,
        provider_id || req.session.user.id,
        final_price,
        original_price,
        discountApplied,
        buy.current_participants,
        deal_terms || {},
        expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ]
    );

    // Update group buy
    await pool.query(
      `UPDATE group_buys SET status = 'activated', provider_id = $1, provider_quote = $2, updated_at = NOW() WHERE id = $3`,
      [provider_id || req.session.user.id, final_price, buy.id]
    );

    res.json({ data: dealRows[0] });
  } catch (err) {
    console.error('POST /group-buys/:id/activate error:', err);
    res.status(500).json({ error: 'Failed to activate deal' });
  }
});

/**
 * GET /api/group-buy-deals
 * Get deals for provider
 */
router.get('/deals/my', requireAuth, async (req: Request, res: Response) => {
  if (req.session.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT gbd.*, gb.service_category, gb.zone_id, gb.description
      FROM group_buy_deals gbd
      JOIN group_buys gb ON gb.id = gbd.group_buy_id
      WHERE gbd.provider_id = $1
      ORDER BY gbd.created_at DESC
      `,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /group-buy-deals/my error:', err);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

/**
 * POST /api/group-buy-deals/:id/complete
 * Mark deal as completed
 */
router.post('/deals/:id/complete', requireAuth, async (req: Request, res: Response) => {
  if (req.session.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE group_buy_deals SET status = 'completed', updated_at = NOW() WHERE id = $1 AND provider_id = $2 RETURNING *`,
      [req.params.id, req.session.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Update parent group buy
    await pool.query(
      `UPDATE group_buys SET status = 'completed', updated_at = NOW() WHERE id = $1`,
      [rows[0].group_buy_id]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /group-buy-deals/:id/complete error:', err);
    res.status(500).json({ error: 'Failed to complete deal' });
  }
});

export default router;