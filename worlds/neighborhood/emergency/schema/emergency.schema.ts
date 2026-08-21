/**
 * Emergency World Schema
 * Tables: emergency_requests, emergency_responders, emergency_zones
 */

import pg from 'pg';
import { pool } from '../_core/neighborhood.schema';

/**
 * Initialize emergency-specific tables
 */
export async function initEmergencyTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Emergency requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        category TEXT NOT NULL,
        urgency TEXT NOT NULL DEFAULT 'immediate' CHECK (urgency IN ('critical','immediate','urgent','scheduled')),
        description TEXT,
        lat NUMERIC(10,8),
        lng NUMERIC(11,8),
        geolocation GEOGRAPHY(POINT, 4326),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','in_progress','resolved','cancelled')),
        assigned_provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Add geolocation if missing
    await client.query(`
      ALTER TABLE emergency_requests
      ADD COLUMN IF NOT EXISTS geolocation GEOGRAPHY(POINT, 4326)
    `);

    // Update geolocation from lat/lng
    await client.query(`
      UPDATE emergency_requests
      SET geolocation = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      WHERE lat IS NOT NULL AND lng IS NOT NULL AND geolocation IS NULL
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_emergency_geo ON emergency_requests USING GIST(geolocation)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emergency_zone ON emergency_requests(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emergency_customer ON emergency_requests(customer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_requests(status)`);

    // Emergency responders (providers who can respond to emergencies)
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_responders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE CASCADE,
        categories TEXT[] NOT NULL DEFAULT '{}',
        max_distance_km INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        response_time_avg_minutes NUMERIC(6,2),
        rating NUMERIC(3,2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(provider_id, zone_id)
      )
    `);

    // Emergency dispatch log
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_dispatch_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
        responder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL CHECK (action IN ('notified','accepted','en_route','arrived','completed','rejected')),
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_dispatch_request ON emergency_dispatch_log(request_id)`);

    await client.query('COMMIT');
    console.log('✅ Emergency tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initEmergencyTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { pool };