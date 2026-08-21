/**
 * Group Buy World Schema
 * Tables: group_buys, group_buy_participants, group_buy_deals
 */

import pg from 'pg';
import { pool } from '../../_core/neighborhood.schema';

/**
 * Initialize group-buy-specific tables
 */
export async function initGroupBuyTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Group buys
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_buys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        service_category TEXT NOT NULL,
        description TEXT,
        initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_participants INT NOT NULL DEFAULT 5,
        current_participants INT NOT NULL DEFAULT 1,
        discount_percent INT NOT NULL DEFAULT 15,
        max_discount_percent INT DEFAULT 35,
        expires_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','locked','activated','completed','cancelled')),
        deal_details JSONB,
        provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
        provider_quote NUMERIC(12,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_group_buys_zone ON group_buys(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_group_buys_status ON group_buys(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_group_buys_initiator ON group_buys(initiator_id)`);

    // Group buy participants
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_buy_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_buy_id UUID NOT NULL REFERENCES group_buys(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        commitment_level TEXT DEFAULT 'full' CHECK (commitment_level IN ('full','partial')),
        notes TEXT,
        UNIQUE(group_buy_id, user_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_gbp_buy ON group_buy_participants(group_buy_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_gbp_user ON group_buy_participants(user_id)`);

    // Group buy deals (activated deals with provider)
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_buy_deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_buy_id UUID NOT NULL REFERENCES group_buys(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        final_price NUMERIC(12,2) NOT NULL,
        original_price NUMERIC(12,2) NOT NULL,
        discount_applied NUMERIC(5,2) NOT NULL,
        participants_count INT NOT NULL,
        deal_terms JSONB,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_gbd_buy ON group_buy_deals(group_buy_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_gbd_provider ON group_buy_deals(provider_id)`);

    await client.query('COMMIT');
    console.log('✅ Group Buy tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initGroupBuyTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { pool };