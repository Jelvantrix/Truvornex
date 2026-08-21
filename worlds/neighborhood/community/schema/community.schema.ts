/**
 * Community World Schema
 * Tables: community_posts, post_comments, neighborhood_polls, events, event_tickets
 * These extend the core neighborhood schema with community-specific features
 */

import pg from 'pg';
import { pool } from '../../_core/neighborhood.schema';

/**
 * Initialize community-specific tables (beyond core)
 */
export async function initCommunityTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Community posts - extend core with reactions, visibility, pinning
    await client.query(`
      ALTER TABLE community_posts
      ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city'))
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_community_posts_scope ON community_posts(visibility_scope)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(is_pinned, created_date DESC) WHERE is_pinned = true`);

    // Post comments - extend core
    await client.query(`
      ALTER TABLE post_comments
      ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE
    `);

    // Neighborhood polls - extend core
    await client.query(`
      ALTER TABLE neighborhood_polls
      ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS total_votes INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city'))
    `);

    // Events - extend core with more event types, capacity management
    await client.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS capacity INT,
      ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS waitlist_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city'))
    `);

    // Event tickets - extend core
    await client.query(`
      ALTER TABLE event_tickets
      ADD COLUMN IF NOT EXISTS qr_code TEXT,
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS transferable BOOLEAN DEFAULT TRUE
    `);

    // Post reactions (detailed)
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like','love','laugh','wow','sad','angry')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id, reaction_type)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id)`);

    // Poll votes (detailed)
    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID NOT NULL REFERENCES neighborhood_polls(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        option_index INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(poll_id, user_id)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id)`);

    // Community announcements (system-level)
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        zone_id UUID REFERENCES neighborhood_zones(id) ON DELETE SET NULL,
        neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        starts_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        visibility_scope TEXT DEFAULT 'zone' CHECK (visibility_scope IN ('block','zone','city')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_zone ON community_announcements(zone_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_active ON community_announcements(starts_at, expires_at) WHERE expires_at > NOW()`);

    await client.query('COMMIT');
    console.log('✅ Community tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ initCommunityTables error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { pool };