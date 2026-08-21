/**
 * Skill Swap World API Routes
 * All routes under /api/skill-swap
 */

import { Router, Request, Response } from 'express';
import { pool } from '../../_core/neighborhood.schema';
import { SkillSwapEvents } from '../../_core/neighborhood.events';
import { getEventBus } from '../../_core/neighborhood.events';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * GET /api/skill-swaps
 * Get open skill swaps
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { zone_id, category_offering, category_seeking, exclude_user } = req.query;

    let query = `
      SELECT ss.*, u.full_name AS offerer_name, u.avatar_url AS offerer_avatar
      FROM skill_swaps ss
      LEFT JOIN users u ON u.id = ss.offerer_id
      WHERE ss.status = 'open'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND ss.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (category_offering) {
      query += ` AND ss.category_offering = $${paramIndex++}`;
      params.push(category_offering);
    }

    if (category_seeking) {
      query += ` AND ss.category_seeking = $${paramIndex++}`;
      params.push(category_seeking);
    }

    if (exclude_user) {
      query += ` AND ss.offerer_id != $${paramIndex++}`;
      params.push(exclude_user);
    }

    query += ` ORDER BY ss.created_at DESC LIMIT 30`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /skill-swaps error:', err);
    res.status(500).json({ error: 'Failed to fetch skill swaps' });
  }
});

/**
 * GET /api/skill-swaps/my
 * Get current user's skill swaps
 */
router.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM skill_swaps WHERE offerer_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /skill-swaps/my error:', err);
    res.status(500).json({ error: 'Failed to fetch your swaps' });
  }
});

/**
 * GET /api/skill-swaps/matched
 * Get swaps where current user is matched
 */
router.get('/matched', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT ss.*, u.full_name AS offerer_name, u.avatar_url AS offerer_avatar,
             u2.full_name AS matched_name, u2.avatar_url AS matched_avatar
      FROM skill_swaps ss
      LEFT JOIN users u ON u.id = ss.offerer_id
      LEFT JOIN users u2 ON u2.id = ss.matched_with_user_id
      WHERE ss.matched_with_user_id = $1 OR ss.offerer_id = $1
      ORDER BY ss.matched_at DESC NULLS LAST, ss.created_at DESC
      LIMIT 20
      `,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /skill-swaps/matched error:', err);
    res.status(500).json({ error: 'Failed to fetch matched swaps' });
  }
});

/**
 * GET /api/time-credits/balance
 * Get current user's time credit balance
 */
router.get('/time-credits/balance', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS balance FROM time_credits_ledger WHERE user_id = $1`,
      [req.session.user.id]
    );
    res.json({ balance: parseInt(rows[0]?.balance || '0') });
  } catch (err) {
    console.error('GET /time-credits/balance error:', err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * GET /api/time-credits/history
 * Get current user's time credit history
 */
router.get('/time-credits/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM time_credits_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /time-credits/history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * POST /api/skill-swaps
 * Create a new skill swap listing
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, offering, seeking, time_credits_offered, time_credits_sought, category_offering, category_seeking } = req.body;

  if (!offering || !seeking) {
    return res.status(400).json({ error: 'Offering and seeking required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO skill_swaps
        (zone_id, offerer_id, offering, seeking, time_credits_offered, time_credits_sought, category_offering, category_seeking)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        zone_id || null,
        req.session.user.id,
        offering,
        seeking,
        time_credits_offered || 1,
        time_credits_sought || 1,
        category_offering || null,
        category_seeking || null
      ]
    );

    const swap = rows[0];

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('skill-swap', 'swap.requested', {
      swapId: swap.id,
      zoneId: swap.zone_id,
      offererId: swap.offerer_id,
      offering: swap.offering,
      seeking: swap.seeking,
      timeCreditsOffered: swap.time_credits_offered,
    });

    res.json({ data: swap });
  } catch (err) {
    console.error('POST /skill-swaps error:', err);
    res.status(500).json({ error: 'Failed to create skill swap' });
  }
});

/**
 * POST /api/skill-swaps/:id/propose
 * Propose a swap (match request)
 */
router.post('/:id/propose', requireAuth, async (req: Request, res: Response) => {
  const { message, proposed_credits } = req.body;

  try {
    const { rows: swapRows } = await pool.query(
      `SELECT * FROM skill_swaps WHERE id = $1`,
      [req.params.id]
    );

    if (!swapRows[0]) {
      return res.status(404).json({ error: 'Skill swap not found' });
    }

    const swap = swapRows[0];

    if (swap.status !== 'open') {
      return res.status(400).json({ error: 'Swap not open for proposals' });
    }

    if (swap.offerer_id === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot propose to your own swap' });
    }

    // Create proposal
    const { rows: proposalRows } = await pool.query(
      `
      INSERT INTO skill_swap_proposals (skill_swap_id, proposer_id, message, proposed_credits)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [swap.id, req.session.user.id, message || null, proposed_credits || swap.time_credits_offered]
    );

    // Notify offerer
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'skill_swap_proposal', 'New Swap Proposal', $2, $3)`,
      [
        swap.offerer_id,
        `${req.session.user.full_name || 'Someone'} wants to swap with you`,
        JSON.stringify({ swapId: swap.id, proposalId: proposalRows[0].id })
      ]
    );

    res.json({ data: proposalRows[0] });
  } catch (err) {
    console.error('POST /skill-swaps/:id/propose error:', err);
    res.status(500).json({ error: 'Failed to propose swap' });
  }
});

/**
 * POST /api/skill-swaps/proposals/:id/accept
 * Accept a proposal
 */
router.post('/proposals/:id/accept', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows: proposalRows } = await pool.query(
      `SELECT * FROM skill_swap_proposals WHERE id = $1`,
      [req.params.id]
    );

    if (!proposalRows[0]) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = proposalRows[0];

    // Verify user is the offerer
    const { rows: swapRows } = await pool.query(
      `SELECT * FROM skill_swaps WHERE id = $1`,
      [proposal.skill_swap_id]
    );

    if (!swapRows[0] || swapRows[0].offerer_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const swap = swapRows[0];

    if (swap.status !== 'open') {
      return res.status(400).json({ error: 'Swap no longer open' });
    }

    // Update proposal
    await pool.query(
      `UPDATE skill_swap_proposals SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [proposal.id]
    );

    // Update swap
    await pool.query(
      `UPDATE skill_swaps SET status = 'matched', matched_with_user_id = $1, matched_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [proposal.proposer_id, swap.id]
    );

    // Reject other proposals
    await pool.query(
      `UPDATE skill_swap_proposals SET status = 'rejected', responded_at = NOW() WHERE skill_swap_id = $1 AND id != $2`,
      [swap.id, proposal.id]
    );

    // Award time credits to proposer for initiating
    const creditsToTransfer = proposal.proposed_credits || swap.time_credits_offered;
    await pool.query(
      `INSERT INTO time_credits_ledger (user_id, amount, reason, reference_type, reference_id, balance_after)
       SELECT $1, $2, 'swap_initiated', 'skill_swap', $3,
       COALESCE((SELECT SUM(amount) FROM time_credits_ledger WHERE user_id = $1), 0) + $2
       `,
      [proposal.proposer_id, creditsToTransfer, swap.id]
    );

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('skill-swap', 'swap.completed', {
      swapId: swap.id,
      zoneId: swap.zone_id,
      offererId: swap.offerer_id,
      offering: swap.offering,
      seeking: swap.seeking,
      timeCreditsOffered: creditsToTransfer,
      matchedWithUserId: proposal.proposer_id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('POST /skill-swaps/proposals/:id/accept error:', err);
    res.status(500).json({ error: 'Failed to accept proposal' });
  }
});

/**
 * POST /api/skill-swaps/:id/complete
 * Mark swap as completed and settle credits
 */
router.post('/:id/complete', requireAuth, async (req: Request, res: Response) => {
  const { rating, review } = req.body;

  try {
    const { rows: swapRows } = await pool.query(
      `SELECT * FROM skill_swaps WHERE id = $1`,
      [req.params.id]
    );

    if (!swapRows[0]) {
      return res.status(404).json({ error: 'Skill swap not found' });
    }

    const swap = swapRows[0];

    // Verify user is a participant
    if (swap.offerer_id !== req.session.user.id && swap.matched_with_user_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    if (swap.status !== 'matched' && swap.status !== 'in_progress') {
      return res.status(400).json({ error: 'Swap not in progress' });
    }

    // Update swap
    const updateFields = ['status = \'completed\'', 'completed_at = NOW()', 'updated_at = NOW()'];
    if (swap.offerer_id === req.session.user.id) {
      if (rating) updateFields.push(`rating_offerer = ${rating}`);
      if (review) updateFields.push(`review_offerer = '${review.replace(/'/g, "''")}'`);
    } else {
      if (rating) updateFields.push(`rating_seeker = ${rating}`);
      if (review) updateFields.push(`review_seeker = '${review.replace(/'/g, "''")}'`);
    }

    await pool.query(
      `UPDATE skill_swaps SET ${updateFields.join(', ')} WHERE id = $1`,
      [swap.id]
    );

    // Settle time credits between both parties
    const credits = swap.time_credits_offered;

    // Offerer receives credits (they provided the service)
    await pool.query(
      `INSERT INTO time_credits_ledger (user_id, amount, reason, reference_type, reference_id, balance_after)
       SELECT $1, $2, 'swap_completed_offerer', 'skill_swap', $3,
       COALESCE((SELECT SUM(amount) FROM time_credits_ledger WHERE user_id = $1), 0) + $2
       `,
      [swap.offerer_id, credits, swap.id]
    );

    // Seeker spends credits (they received the service)
    await pool.query(
      `INSERT INTO time_credits_ledger (user_id, amount, reason, reference_type, reference_id, balance_after)
       SELECT $1, -$2, 'swap_completed_seeker', 'skill_swap', $3,
       COALESCE((SELECT SUM(amount) FROM time_credits_ledger WHERE user_id = $1), 0) - $2
       `,
      [swap.matched_with_user_id, credits, swap.id]
    );

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('skill-swap', 'credits.settled', {
      swapId: swap.id,
      zoneId: swap.zone_id,
      offererId: swap.offerer_id,
      offering: swap.offering,
      seeking: swap.seeking,
      timeCreditsOffered: credits,
      matchedWithUserId: swap.matched_with_user_id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('POST /skill-swaps/:id/complete error:', err);
    res.status(500).json({ error: 'Failed to complete swap' });
  }
});

/**
 * GET /api/skill-swaps/proposals/my
 * Get proposals sent by current user
 */
router.get('/proposals/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT ssp.*, ss.offering, ss.seeking, ss.offerer_id
      FROM skill_swap_proposals ssp
      JOIN skill_swaps ss ON ss.id = ssp.skill_swap_id
      WHERE ssp.proposer_id = $1
      ORDER BY ssp.created_at DESC
      LIMIT 20
      `,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /skill-swaps/proposals/my error:', err);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

/**
 * GET /api/skill-swaps/proposals/received
 * Get proposals received by current user
 */
router.get('/proposals/received', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT ssp.*, ss.offering, ss.seeking, ss.offerer_id, u.full_name AS proposer_name, u.avatar_url AS proposer_avatar
      FROM skill_swap_proposals ssp
      JOIN skill_swaps ss ON ss.id = ssp.skill_swap_id
      JOIN users u ON u.id = ssp.proposer_id
      WHERE ss.offerer_id = $1
      ORDER BY ssp.created_at DESC
      LIMIT 20
      `,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /skill-swaps/proposals/received error:', err);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

export default router;