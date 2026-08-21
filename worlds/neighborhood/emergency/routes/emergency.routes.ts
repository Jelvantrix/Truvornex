/**
 * Emergency World API Routes
 * All routes under /api/emergency
 */

import { Router, Request, Response } from 'express';
import { pool } from '../../_core/neighborhood.schema';
import { EmergencyEvents } from '../../_core/neighborhood.events';
import { getEventBus } from '../../_core/neighborhood.events';

const router = Router();

// Helper: require authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * GET /api/emergency/requests
 * Get user's emergency requests
 */
router.get('/requests', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM emergency_requests WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.session.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /emergency/requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * POST /api/emergency/requests
 * Create new emergency request
 */
router.post('/requests', requireAuth, async (req: Request, res: Response) => {
  const { category, urgency, description, lat, lng, zone_id } = req.body;

  if (!category || !description) {
    return res.status(400).json({ error: 'Category and description required' });
  }

  try {
    let finalZoneId = zone_id;

    // Auto-detect zone if lat/lng provided
    if (!finalZoneId && lat && lng) {
      const { rows } = await pool.query(
        `
        SELECT id FROM neighborhood_zones
        WHERE geolocation IS NOT NULL
          AND ST_DWithin(
            geolocation,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            50000
          )
        ORDER BY ST_Distance(geolocation, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) ASC
        LIMIT 1
        `,
        [lng, lat]
      );
      finalZoneId = rows[0]?.id;
    }

    // Insert request
    const { rows } = await pool.query(
      `
      INSERT INTO emergency_requests
        (customer_id, zone_id, category, urgency, description, lat, lng, geolocation)
      VALUES ($1, $2, $3, $4, $5, $6, $7,
        CASE WHEN $6 IS NOT NULL AND $7 IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography
          ELSE NULL END)
      RETURNING *
      `,
      [
        req.session.user.id,
        finalZoneId || null,
        category,
        urgency || 'immediate',
        description,
        lat || null,
        lng || null
      ]
    );

    const request = rows[0];

    // Emit event for other worlds to react
    const eventBus = getEventBus();
    eventBus.publish('emergency', 'incident.created', {
      incidentId: request.id,
      zoneId: request.zone_id,
      category: request.category,
      urgency: request.urgency,
      customerId: request.customer_id,
    });

    // Notify available responders in the zone
    if (finalZoneId) {
      const { rows: responders } = await pool.query(
        `SELECT provider_id FROM emergency_responders
         WHERE zone_id = $1 AND is_active = true AND $2 = ANY(categories)`,
        [finalZoneId, category]
      );

      for (const r of responders) {
        await pool.query(
          `INSERT INTO emergency_dispatch_log (request_id, responder_id, action) VALUES ($1, $2, 'notified')`,
          [request.id, r.provider_id]
        );
      }
    }

    res.json({ data: request });
  } catch (err) {
    console.error('POST /emergency/requests error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

/**
 * PATCH /api/emergency/requests/:id
 * Update emergency request status
 */
router.patch('/requests/:id', requireAuth, async (req: Request, res: Response) => {
  const { status, assigned_provider_id } = req.body;
  const allowedStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateFields: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];
    let paramIndex = 2;

    if (status === 'assigned' && assigned_provider_id) {
      updateFields.push(`assigned_provider_id = $${paramIndex++}`);
      params.push(assigned_provider_id);
      updateFields.push(`assigned_at = NOW()`);
    }

    if (status === 'resolved') {
      updateFields.push(`resolved_at = NOW()`);
    }

    params.push(req.params.id, req.session.user.id);

    const { rows } = await pool.query(
      `UPDATE emergency_requests SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex++} AND customer_id = $${paramIndex}
       RETURNING *`,
      params
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Request not found or no permission' });
    }

    const request = rows[0];

    // Emit event
    const eventBus = getEventBus();
    if (status === 'resolved') {
      eventBus.publish('emergency', 'incident.resolved', {
        incidentId: request.id,
        zoneId: request.zone_id,
        category: request.category,
        urgency: request.urgency,
        customerId: request.customer_id,
        responderId: request.assigned_provider_id,
      });
    } else if (status === 'assigned') {
      eventBus.publish('emergency', 'responder.assigned', {
        incidentId: request.id,
        zoneId: request.zone_id,
        category: request.category,
        urgency: request.urgency,
        customerId: request.customer_id,
        responderId: request.assigned_provider_id,
      });
    }

    res.json({ data: request });
  } catch (err) {
    console.error('PATCH /emergency/requests error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

/**
 * GET /api/emergency/responders
 * Get available emergency responders for a zone/category
 */
router.get('/responders', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, category } = req.query;

  try {
    let query = `
      SELECT er.*, u.full_name, u.avatar_url, u.phone
      FROM emergency_responders er
      JOIN users u ON u.id = er.provider_id
      WHERE er.is_active = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND er.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    }

    if (category) {
      query += ` AND $${paramIndex} = ANY(er.categories)`;
      params.push(category);
    }

    query += ` ORDER BY er.rating DESC NULLS LAST, er.response_time_avg_minutes ASC NULLS LAST`;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /emergency/responders error:', err);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

/**
 * POST /api/emergency/responders
 * Register as emergency responder (providers only)
 */
router.post('/responders', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, categories, max_distance_km } = req.body;

  if (!zone_id || !categories?.length) {
    return res.status(400).json({ error: 'zone_id and categories required' });
  }

  // Verify user is a provider
  if (req.session.user.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can register as responders' });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO emergency_responders (provider_id, zone_id, categories, max_distance_km)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (provider_id, zone_id) DO UPDATE SET
        categories = EXCLUDED.categories,
        max_distance_km = EXCLUDED.max_distance_km,
        updated_at = NOW()
      RETURNING *
      `,
      [req.session.user.id, zone_id, categories, max_distance_km || 10]
    );

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /emergency/responders error:', err);
    res.status(500).json({ error: 'Failed to register responder' });
  }
});

/**
 * GET /api/emergency/active
 * Get active emergencies in a zone (for responders)
 */
router.get('/active', requireAuth, async (req: Request, res: Response) => {
  const { zone_id, lat, lng, radius_km = '25' } = req.query;

  try {
    let query = `
      SELECT er.*, u.full_name AS customer_name, u.phone AS customer_phone
      FROM emergency_requests er
      JOIN users u ON u.id = er.customer_id
      WHERE er.status IN ('pending', 'assigned', 'in_progress')
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (zone_id) {
      query += ` AND er.zone_id = $${paramIndex++}`;
      params.push(zone_id);
    } else if (lat && lng) {
      query += ` AND er.geolocation IS NOT NULL
        AND ST_DWithin(er.geolocation, ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography, $${paramIndex + 2})`;
      params.push(lng, lat, parseInt(radius_km as string) * 1000);
      paramIndex += 3;
    }

    query += ` ORDER BY
      CASE er.urgency
        WHEN 'critical' THEN 0
        WHEN 'immediate' THEN 1
        WHEN 'urgent' THEN 2
        ELSE 3
      END,
      er.created_at ASC
    `;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /emergency/active error:', err);
    res.status(500).json({ error: 'Failed to fetch active emergencies' });
  }
});

/**
 * POST /api/emergency/dispatch/accept
 * Responder accepts dispatch
 */
router.post('/dispatch/accept', requireAuth, async (req: Request, res: Response) => {
  const { request_id } = req.body;

  try {
    // Update request
    const { rows: requestRows } = await pool.query(
      `UPDATE emergency_requests
       SET status = 'assigned', assigned_provider_id = $1, assigned_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [req.session.user.id, request_id]
    );

    if (!requestRows[0]) {
      return res.status(404).json({ error: 'Request not found or already assigned' });
    }

    // Log dispatch
    await pool.query(
      `INSERT INTO emergency_dispatch_log (request_id, responder_id, action) VALUES ($1, $2, 'accepted')`,
      [request_id, req.session.user.id]
    );

    res.json({ data: requestRows[0] });
  } catch (err) {
    console.error('POST /emergency/dispatch/accept error:', err);
    res.status(500).json({ error: 'Failed to accept dispatch' });
  }
});

/**
 * POST /api/emergency/dispatch/update
 * Responder updates status (en_route, arrived, completed)
 */
router.post('/dispatch/update', requireAuth, async (req: Request, res: Response) => {
  const { request_id, action } = req.body;
  const allowedActions = ['en_route', 'arrived', 'completed'];

  if (!allowedActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const statusMap: Record<string, string> = {
      en_route: 'in_progress',
      arrived: 'in_progress',
      completed: 'resolved',
    };

    const { rows } = await pool.query(
      `UPDATE emergency_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND assigned_provider_id = $3
       RETURNING *`,
      [statusMap[action], request_id, req.session.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Request not found or not assigned to you' });
    }

    await pool.query(
      `INSERT INTO emergency_dispatch_log (request_id, responder_id, action) VALUES ($1, $2, $3)`,
      [request_id, req.session.user.id, action]
    );

    // Emit event if completed
    if (action === 'completed') {
      const eventBus = getEventBus();
      eventBus.publish('emergency', 'incident.resolved', {
        incidentId: rows[0].id,
        zoneId: rows[0].zone_id,
        category: rows[0].category,
        urgency: rows[0].urgency,
        customerId: rows[0].customer_id,
        responderId: req.session.user.id,
      });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('POST /emergency/dispatch/update error:', err);
    res.status(500).json({ error: 'Failed to update dispatch' });
  }
});

export default router;