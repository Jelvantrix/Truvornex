/**
 * Skill Swap World Schema
 * Tables: skill_swaps, time_credits_ledger, skill_swap_matches
 */

import pg from 'pg';
import { pool } from '../../_core/neighborhood.schema';

/**
 * Initialize skill-swap-specific tables
 */
export async function initSkillSwapTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Skill swaps (listings)
    await client.query(`
      CREATE TABLE IF NOT EXISTS skill_swaps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        offerer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        offering TEXT NOT NULL,
        seeking TEXT,
        time_credits_offered INT NOT NULL DEFAULT 1,
        time_credits_sought INT DEFAULT 1,
        category_offering TEXT,
        category_seeking TEXT,
        matched_with_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        matched_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','in_progress','completed','cancelled')),
        completed_at TIMESTAMPTZ,
        rating_offerer INTEGER CHECK (rating_offerer BETWEEN 1 AND 5),
        rating_seeker INTEGER CHECK (rating_seeker BETWEEN 1 AND 5),
        review_offerer TEXT,
        review_seeker TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_skill_swaps_zone ON skill_swaps(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_skill_swaps_status ON skill_swaps(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_skill_swaps_offerer ON skill_swaps(offerer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_skill_swaps_matched ON skill_swaps(matched_with_user_id)`);

    // Time credits ledger
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_credits_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount INT NOT NULL,
        reason TEXT NOT NULL,
        reference_type TEXT,
        reference_id UUID,
        balance_after INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_time_credits_user ON time_credits_ledger(user_id, created_at DESC)`);

    // Skill swap matches (pending proposals)
    await client.query(`
      CREATE TABLE IF NOT EXISTS skill_swap_proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        skill_swap_id UUID NOT NULL REFERENCES skill_swaps(id) ON DELETE CASCADE,
        proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        proposed_credits INT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        responded_at TIMESTAMPTZ
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ssp_swap ON skill_swap_proposals(skill_swap_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ssp_proposer ON skill_swap_proposals(proposer_id)`);

    await client.query('COMMIT');
    console.log('✅ Skill Swap tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initSkillSwapTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { pool };