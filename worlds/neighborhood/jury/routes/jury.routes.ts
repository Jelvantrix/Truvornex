/**
 * Jury World API Routes
 * All routes under /api/jury
 */

import { Router, Request, Response } from 'express';
import { pool } from '../../_core/neighborhood.schema';
import { JuryEvents } from '../../_core/neighborhood.events';
import { getEventBus } from '../../_core/neighborhood.events';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * GET /api/jury/disputes
 * Get open disputes for jury service
 */
router.get('/disputes', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status = 'open' } = req.query;
    const statuses = Array.isArray(status) ? status : [status];

    // Get disputes user can vote on (not their own, not already voted)
    const placeholders = statuses.map((_, i) => `$${i + 1}`).join(',');
    const params = [...statuses, req.session.user.id, req.session.user.id];

    const { rows } = await pool.query(
      `
      SELECT d.*, u.full_name AS raised_by_name
      FROM disputes d
      LEFT JOIN users u ON u.id = d.raised_by
      WHERE d.status IN (${placeholders})
        AND d.raised_by != $${statuses.length + 1}
        AND (d.against_id IS NULL OR d.against_id != $${statuses.length + 2})
        AND NOT EXISTS (
          SELECT 1 FROM jury_assignments ja
          WHERE ja.dispute_id = d.id AND ja.juror_user_id = $${statuses.length + 2}
        )
      ORDER BY d.created_at DESC
      LIMIT 30
      `,
      params
    );

    // Get user's votes
    const disputeIds = rows.map(r => r.id);
    let myVotes: Record<string, string> = {};
    if (disputeIds.length > 0) {
      const votePlaceholders = disputeIds.map((_, i) => `$${i + 1}`).join(',');
      const { rows: voteRows } = await pool.query(
        `SELECT dispute_id, vote FROM jury_assignments WHERE juror_user_id = $${disputeIds.length + 1} AND dispute_id IN (${votePlaceholders})`,
        [req.session.user.id, ...disputeIds]
      );
      myVotes = Object.fromEntries(voteRows.map(v => [v.dispute_id, v.vote]));
    }

    res.json({ data: rows, myVotes });
  } catch (err) {
    console.error('GET /jury/disputes error:', err);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

/**
 * GET /api/jury/disputes/:id
 * Get single dispute with evidence
 */
router.get('/disputes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT d.*, u.full_name AS raised_by_name
      FROM disputes d
      LEFT JOIN users u ON u.id = d.raised_by
      WHERE d.id = $1
      `,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Get jury assignments for this dispute
    const { rows: assignments } = await pool.query(
      `
      SELECT ja.*, u.full_name AS juror_name
      FROM jury_assignments ja
      LEFT JOIN users u ON u.id = ja.juror_user_id
      WHERE ja.dispute_id = $1
      `,
      [req.params.id]
    );

    res.json({ data: { ...rows[0], jury: assignments } });
  } catch (err) {
    console.error('GET /jury/disputes/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch dispute' });
  }
});

/**
 * POST /api/jury/disputes
 * File a new dispute
 */
router.post('/disputes', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, category, description, evidence_urls, evidence_notes, against_id, booking_id } = req.body;

  if (!category || !description) {
    return res.status(400).json({ error: 'Category and description required' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO disputes (zone_id, raised_by, against_id, booking_id, category, description, evidence_urls, evidence_notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'filing')
      RETURNING *
      `,
      [zone_id || null, req.session.user.id, against_id || null, booking_id || null, category, description, evidence_urls || [], evidence_notes || null]
    );

    const dispute = rows[0];

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('jury', 'dispute.filed', {
      disputeId: dispute.id,
      zoneId: dispute.zone_id,
      raisedBy: dispute.raised_by,
      againstId: dispute.against_id,
      category: dispute.category,
      phase: 'filing',
    });

    // Move to evidence phase after creation
    await pool.query(
      `UPDATE disputes SET status = 'evidence', updated_at = NOW() WHERE id = $1`,
      [dispute.id]
    );

    res.json({ data: dispute });
  } catch (err) {
    console.error('POST /jury/disputes error:', err);
    res.status(500).json({ error: 'Failed to file dispute' });
  }
});

/**
 * GET /api/jury/my-disputes
 * Get disputes filed by current user
 */
router.get('/my-disputes', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM disputes WHERE raised_by = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /jury/my-disputes error:', err);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

/**
 * POST /api/jury/disputes/:id/select-jury
 * Select random jurors from pool (call after evidence phase)
 */
router.post('/disputes/:id/select-jury', requireAuth, async (req: Request, res: Response) => {
  // Only the complainant or admin can trigger jury selection
  try {
    const { rows: disputeRows } = await pool.query(
      `SELECT * FROM disputes WHERE id = $1`,
      [req.params.id]
    );

    if (!disputeRows[0]) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const dispute = disputeRows[0];

    if (dispute.raised_by !== req.session.user.id && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (dispute.status !== 'evidence') {
      return res.status(400).json({ error: 'Dispute not in evidence phase' });
    }

    // Select 5 random eligible jurors from the zone's pool
    const { rows: jurors } = await pool.query(
      `
      SELECT jp.user_id
      FROM jury_pools jp
      WHERE jp.zone_id = $1
        AND jp.is_active = true
        AND jp.user_id != $2
        AND (jp.disqualified_reason IS NULL)
      ORDER BY RANDOM()
      LIMIT 5
      `,
      [dispute.zone_id, req.session.user.id]
    );

    if (jurors.length < 3) {
      return res.status(400).json({ error: 'Not enough eligible jurors in zone' });
    }

    // Assign jurors
    for (const juror of jurors) {
      await pool.query(
        `INSERT INTO jury_assignments (dispute_id, juror_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [dispute.id, juror.user_id]
      );
    }

    // Update dispute status
    await pool.query(
      `UPDATE disputes SET status = 'jury_selection', updated_at = NOW() WHERE id = $1`,
      [dispute.id]
    );

    // Move to deliberation after a short delay (or immediately for demo)
    setTimeout(async () => {
      await pool.query(
        `UPDATE disputes SET status = 'deliberation', updated_at = NOW() WHERE id = $1`,
        [dispute.id]
      );
    }, 5000);

    res.json({ success: true, jurors: jurors.map(j => j.user_id) });
  } catch (err) {
    console.error('POST /jury/select-jury error:', err);
    res.status(500).json({ error: 'Failed to select jury' });
  }
});

/**
 * POST /api/jury/vote
 * Cast a vote as a juror
 */
router.post('/vote', requireAuth, async (req: Request, res: Response) => {
  const { dispute_id, vote } = req.body;
  const allowedVotes = ['for_plaintiff', 'for_defendant', 'abstain'];

  if (!allowedVotes.includes(vote)) {
    return res.status(400).json({ error: 'Invalid vote' });
  }

  try {
    // Check if user is assigned juror
    const { rows: assignmentRows } = await pool.query(
      `SELECT * FROM jury_assignments WHERE dispute_id = $1 AND juror_user_id = $2`,
      [dispute_id, req.session.user.id]
    );

    if (!assignmentRows[0]) {
      return res.status(403).json({ error: 'Not assigned to this dispute' });
    }

    if (assignmentRows[0].voted_at) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Check dispute is in deliberation
    const { rows: disputeRows } = await pool.query(
      `SELECT * FROM disputes WHERE id = $1`,
      [dispute_id]
    );

    if (!disputeRows[0] || disputeRows[0].status !== 'deliberation') {
      return res.status(400).json({ error: 'Voting not open' });
    }

    // Record vote
    await pool.query(
      `UPDATE jury_assignments SET vote = $1, voted_at = NOW() WHERE dispute_id = $2 AND juror_user_id = $3`,
      [vote, dispute_id, req.session.user.id]
    );

    // Award time credit
    await pool.query(
      `INSERT INTO time_credits_ledger (user_id, amount, reason, reference_type, reference_id)
       VALUES ($1, 1, 'jury_vote', 'dispute', $2)
       ON CONFLICT DO NOTHING`,
      [req.session.user.id, dispute_id]
    );

    // Check if quorum reached (3 votes minimum)
    const { rows: voteCounts } = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE vote = 'for_plaintiff') AS for_plaintiff,
        COUNT(*) FILTER (WHERE vote = 'for_defendant') AS for_defendant,
        COUNT(*) FILTER (WHERE vote = 'abstain') AS abstain,
        COUNT(*) FILTER (WHERE vote IS NOT NULL) AS total_voted,
        (SELECT COUNT(*) FROM jury_assignments WHERE dispute_id = $1) AS total_jurors
      FROM jury_assignments WHERE dispute_id = $1
      `,
      [dispute_id]
    );

    const counts = voteCounts[0];
    const quorumMet = counts.total_voted >= 3;

    if (quorumMet) {
      const winningSide = counts.for_plaintiff > counts.for_defendant ? 'plaintiff' : 
                          counts.for_defendant > counts.for_plaintiff ? 'defendant' : 'split';

      // Create verdict
      await pool.query(
        `
        INSERT INTO verdicts (dispute_id, winning_side, votes_for_plaintiff, votes_for_defendant, votes_abstain, total_jurors, quorum_met)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        `,
        [dispute_id, winningSide, counts.for_plaintiff, counts.for_defendant, counts.abstain, counts.total_jurors]
      );

      // Update dispute
      await pool.query(
        `UPDATE disputes SET status = 'verdict', verdict_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [dispute_id]
      );

      // Emit event
      const eventBus = getEventBus();
      eventBus.publish('jury', 'verdict.reached', {
        disputeId: dispute_id,
        zoneId: disputeRows[0].zone_id,
        raisedBy: disputeRows[0].raised_by,
        againstId: disputeRows[0].against_id,
        category: disputeRows[0].category,
        phase: 'verdict',
      });
    }

    res.json({ success: true, quorumMet, counts });
  } catch (err) {
    console.error('POST /jury/vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

/**
 * GET /api/jury/my-votes
 * Get current user's jury votes
 */
router.get('/my-votes', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT ja.*, d.category, d.description, v.winning_side
       FROM jury_assignments ja
       JOIN disputes d ON d.id = ja.dispute_id
       LEFT JOIN verdicts v ON v.dispute_id = d.id
       WHERE ja.juror_user_id = $1
       ORDER BY ja.voted_at DESC NULLS LAST, ja.assigned_at DESC
       LIMIT 20`,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /jury/my-votes error:', err);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

/**
 * POST /api/jury/appeal
 * File an appeal
 */
router.post('/appeal', requireAuth, async (req: Request, res: Response) => {
  const { dispute_id, grounds } = req.body;

  if (!grounds) {
    return res.status(400).json({ error: 'Grounds for appeal required' });
  }

  try {
    const { rows: disputeRows } = await pool.query(
      `SELECT * FROM disputes WHERE id = $1`,
      [dispute_id]
    );

    if (!disputeRows[0]) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const dispute = disputeRows[0];

    // Only parties to the dispute can appeal
    if (dispute.raised_by !== req.session.user.id && dispute.against_id !== req.session.user.id) {
      return res.status(403).json({ error: 'Not a party to this dispute' });
    }

    if (dispute.status !== 'verdict') {
      return res.status(400).json({ error: 'Can only appeal after verdict' });
    }

    // Check if already appealed
    const { rows: existingAppeals } = await pool.query(
      `SELECT 1 FROM appeals WHERE dispute_id = $1 AND appealed_by = $2`,
      [dispute_id, req.session.user.id]
    );

    if (existingAppeals.length > 0) {
      return res.status(400).json({ error: 'Already appealed this dispute' });
    }

    const { rows } = await pool.query(
      `INSERT INTO appeals (dispute_id, appealed_by, grounds) VALUES ($1, $2, $3) RETURNING *`,
      [dispute_id, req.session.user.id, grounds]
    );

    // Update dispute status
    await pool.query(
      `UPDATE disputes SET status = 'appeal', updated_at = NOW() WHERE id = $1`,
      [dispute_id]
    );

    // Emit event
    const eventBus = getEventBus();
    eventBus.publish('jury', 'appeal.opened', {
      disputeId: dispute_id,
      zoneId: dispute.zone_id,
      raisedBy: dispute.raised_by,
      againstId: dispute.against_id,
      category: dispute.category,
      phase: 'appeal',
    });

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /jury/appeal error:', err);
    res.status(500).json({ error: 'Failed to file appeal' });
  }
});

/**
 * GET /api/jury/pool/:zoneId
 * Get jury pool for a zone (admin/moderator)
 */
router.get('/pool/:zoneId', requireAuth, async (req: Request, res: Response) => {
  if (req.session.user.role !== 'admin' && req.session.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT jp.*, u.full_name, u.email
      FROM jury_pools jp
      JOIN users u ON u.id = jp.user_id
      WHERE jp.zone_id = $1
      ORDER BY jp.eligibility_score DESC
      `,
      [req.params.zoneId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /jury/pool error:', err);
    res.status(500).json({ error: 'Failed to fetch jury pool' });
  }
});

export default router;