/**
 * Neighborhood Core Schema
 * Shared tables: neighborhoods, zones, memberships
 * This replaces the neighborhood table creation logic from server/db.js
 */

import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Initialize all core neighborhood tables
 */
export async function initNeighborhoodCoreTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Neighborhoods table (top-level container)
    await client.query(`
      CREATE TABLE IF NOT EXISTS neighborhoods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        city TEXT,
        country TEXT DEFAULT 'PK',
        description TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Neighborhood zones (geographic areas within a neighborhood)
    await client.query(`
      CREATE TABLE IF NOT EXISTS neighborhood_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        area TEXT,
        city TEXT DEFAULT NULL,
        health_score NUMERIC(5,2) DEFAULT 50.00,
        demand_index NUMERIC(5,2) DEFAULT 0.00,
        active_providers INT DEFAULT 0,
        center_lat NUMERIC(9,6),
        center_lng NUMERIC(9,6),
        radius_meters INTEGER DEFAULT 25000,
        geolocation GEOGRAPHY(POINT, 4326),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Ensure PostGIS extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    // Add geolocation if missing (for existing tables)
    await client.query(`
      ALTER TABLE neighborhood_zones
      ADD COLUMN IF NOT EXISTS center_lat NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS center_lng NUMERIC(9,6),
      ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 25000,
      ADD COLUMN IF NOT EXISTS geolocation GEOGRAPHY(POINT, 4326)
    `);

    // Create GIST index for zones geolocation
    await client.query(`CREATE INDEX IF NOT EXISTS idx_zones_geo ON neighborhood_zones USING GIST(geolocation)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_zones_neighborhood ON neighborhood_zones(neighborhood_id)`);

    // Neighborhood memberships (users belonging to zones)
    await client.query(`
      CREATE TABLE IF NOT EXISTS neighborhood_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        zone_id UUID NOT NULL REFERENCES neighborhood_zones(id) ON DELETE CASCADE,
        neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident','provider','admin','moderator')),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        verified_at TIMESTAMPTZ,
        settings JSONB DEFAULT '{}',
        UNIQUE(user_id, zone_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_memberships_user ON neighborhood_memberships(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_memberships_zone ON neighborhood_memberships(zone_id)`);

    // Community posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
        type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post','announcement','event','poll','alert')),
        title TEXT,
        body TEXT NOT NULL,
        author_name TEXT,
        author_email TEXT,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        image_url TEXT,
        upvotes INT DEFAULT 0,
        reply_count INT DEFAULT 0,
        visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city')),
        created_date TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_community_posts_date ON community_posts(created_date DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_community_posts_zone ON community_posts(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_community_posts_hood ON community_posts(neighborhood_id)`);

    // Post comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        author_email TEXT NOT NULL,
        author_name TEXT,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at ASC)`);

    // Neighborhood polls
    await client.query(`
      CREATE TABLE IF NOT EXISTS neighborhood_polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
        question TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        expires_at TIMESTAMPTZ,
        visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Events
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'community',
        venue_name TEXT,
        venue_type TEXT,
        address TEXT,
        date DATE,
        start_time TEXT,
        end_time TEXT,
        organizer_name TEXT,
        organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ticket_price NUMERIC(10,2) DEFAULT 0,
        is_free BOOLEAN DEFAULT TRUE,
        total_tickets INT DEFAULT 100,
        tickets_sold INT DEFAULT 0,
        bundle_services JSONB DEFAULT '[]',
        cover_image_url TEXT,
        visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city')),
        status TEXT DEFAULT 'published' CHECK (status IN ('draft','published','cancelled','completed')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_zone ON events(zone_id)`);

    // Event tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        event_title TEXT,
        buyer_email TEXT NOT NULL,
        buyer_name TEXT,
        buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        quantity INT DEFAULT 1,
        unit_price NUMERIC(10,2) DEFAULT 0,
        total_amount NUMERIC(10,2) DEFAULT 0,
        ticket_code TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active','used','refunded','cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer ON event_tickets(buyer_email, created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id)`);

    await client.query('COMMIT');
    console.log('✅ Neighborhood core tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initNeighborhoodCoreTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get or create a zone for given coordinates
 */
export async function getOrCreateZone(lat: number, lng: number): Promise<{ id: string } | null> {
  try {
    // Try to find existing zone within 25km
    const { rows } = await pool.query(
      `
      SELECT id FROM neighborhood_zones
      WHERE geolocation IS NOT NULL
        AND ST_DWithin(
          geolocation,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          25000
        )
      ORDER BY ST_Distance(geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) ASC
      LIMIT 1
      `,
      [lng, lat]
    );

    if (rows[0]) return { id: rows[0].id };

    // Create new zone centered on this location
    const { rows: newZone } = await pool.query(
      `
      INSERT INTO neighborhood_zones (name, center_lat, center_lng, geolocation, city)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, $4)
      RETURNING id
      `,
      [`Zone ${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng, 'Auto-generated']
    );

    return { id: newZone[0].id };
  } catch (err) {
    console.error('getOrCreateZone error:', err);
    return null;
  }
}

/**
 * Refresh zone statistics (health_score, demand_index, active_providers)
 */
export async function refreshZoneStats(zoneId: string): Promise<void> {
  try {
    await pool.query(
      `
      UPDATE neighborhood_zones nz
      SET
        health_score = COALESCE((
          SELECT 50 + (COUNT(DISTINCT pp.provider_id) * 2) - (COUNT(DISTINCT er.id) * 0.5)
          FROM provider_presence pp
          LEFT JOIN emergency_requests er ON er.zone_id = nz.id AND er.status = 'open'
          WHERE pp.current_zone_id = nz.id
            AND pp.is_online = true
            AND pp.last_heartbeat > NOW() - INTERVAL '10 minutes'
        ), 50),
        demand_index = COALESCE((
          SELECT COUNT(*) FROM bookings b
          WHERE b.zone_id = nz.id AND b.created_at > NOW() - INTERVAL '24 hours'
        ), 0) + COALESCE((
          SELECT COUNT(*) FROM emergency_requests er
          WHERE er.zone_id = nz.id AND er.status = 'open'
        ), 0),
        active_providers = COALESCE((
          SELECT COUNT(DISTINCT pp.provider_id) FROM provider_presence pp
          WHERE pp.current_zone_id = nz.id
            AND pp.is_online = true
            AND pp.last_heartbeat > NOW() - INTERVAL '10 minutes'
        ), 0),
        updated_at = NOW()
      WHERE nz.id = $1
      `,
      [zoneId]
    );
  } catch (err) {
    console.error('refreshZoneStats error:', err);
  }
}

/**
 * Verify user has membership in a zone
 */
export async function verifyZoneMembership(userId: string, zoneId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM neighborhood_memberships WHERE user_id = $1 AND zone_id = $2`,
    [userId, zoneId]
  );
  return rows.length > 0;
}

/**
 * Add user to a zone
 */
export async function addZoneMembership(
  userId: string,
  zoneId: string,
  role: 'resident' | 'provider' | 'admin' | 'moderator' = 'resident'
): Promise<void> {
  const { rows: zone } = await pool.query(
    `SELECT neighborhood_id FROM neighborhood_zones WHERE id = $1`,
    [zoneId]
  );

  const neighborhoodId = zone[0]?.neighborhood_id;
  if (!neighborhoodId) throw new Error('Zone not found');

  await pool.query(
    `
    INSERT INTO neighborhood_memberships (user_id, zone_id, neighborhood_id, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, zone_id) DO UPDATE SET role = EXCLUDED.role
    `,
    [userId, zoneId, neighborhoodId, role]
  );
}

export { pool };