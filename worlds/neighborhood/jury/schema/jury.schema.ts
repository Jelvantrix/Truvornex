/**
 * Jury World Schema
 * Tables: disputes, jury_assignments, jury_pools, verdicts
 */

import pg from 'pg';
import { pool } from '../../_core/neighborhood.schema';

/**
 * Initialize jury-specific tables
 */
export async function initJuryTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Disputes
    await client.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        raised_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        against_id UUID REFERENCES users(id) ON DELETE SET NULL,
        booking_id UUID,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_urls TEXT[] DEFAULT '{}',
        evidence_notes TEXT,
        status TEXT NOT NULL DEFAULT 'filing' CHECK (status IN ('filing','evidence','jury_selection','deliberation','verdict','appeal','resolved','dismissed')),
        resolution TEXT,
        verdict JSONB,
        quorum_reached_at TIMESTAMPTZ,
        verdict_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_disputes_zone ON disputes(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by)`);

    // Jury assignments (jurors assigned to disputes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS jury_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
        juror_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote TEXT CHECK (vote IN ('for_plaintiff','for_defendant','abstain')),
        vote_weight INTEGER DEFAULT 1,
        voted_at TIMESTAMPTZ,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(dispute_id, juror_user_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jury_dispute ON jury_assignments(dispute_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jury_juror ON jury_assignments(juror_user_id)`);

    // Jury pool (eligible jurors per zone)
    await client.query(`
      CREATE TABLE IF NOT EXISTS jury_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID NOT NULL REFERENCES neighborhood_zones(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        eligibility_score NUMERIC(5,2) DEFAULT 50.00,
        disputes_served INT DEFAULT 0,
        last_served_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        disqualified_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(zone_id, user_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jury_pool_zone ON jury_pools(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jury_pool_user ON jury_pools(user_id)`);

    // Verdicts (final outcomes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS verdicts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
        winning_side TEXT NOT NULL CHECK (winning_side IN ('plaintiff','defendant','split')),
        votes_for_plaintiff INT NOT NULL DEFAULT 0,
        votes_for_defendant INT NOT NULL DEFAULT 0,
        votes_abstain INT NOT NULL DEFAULT 0,
        total_jurors INT NOT NULL,
        quorum_met BOOLEAN NOT NULL DEFAULT FALSE,
        penalty JSONB,
        compensation JSONB,
        reasoning TEXT,
        is_appealed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Appeals
    await client.query(`
      CREATE TABLE IF NOT EXISTS appeals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
        appealed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        grounds TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','resolved')),
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        decision TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Jury tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initJuryTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { pool };