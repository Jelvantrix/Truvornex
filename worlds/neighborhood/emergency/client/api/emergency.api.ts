/**
 * Emergency World API Client
 */

const BASE = '/api/neighborhood/emergency';

export const emergencyApi = {
  // Requests
  getMyRequests: async () => {
    const res = await fetch(`${BASE}/requests`);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  createRequest: async (data: {
    category: string;
    urgency: string;
    description: string;
    lat?: number;
    lng?: number;
    zone_id?: string;
  }) => {
    const res = await fetch(`${BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create request');
    return res.json();
  },

  updateRequest: async (id: string, status: string) => {
    const res = await fetch(`${BASE}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update request');
    return res.json();
  },

  // Responders
  getResponders: async (params?: { zone_id?: string; category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/responders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch responders');
    return res.json();
  },

  registerAsResponder: async (data: {
    zone_id: string;
    categories: string[];
    max_distance_km?: number;
  }) => {
    const res = await fetch(`${BASE}/responders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to register');
    return res.json();
  },

  // Active emergencies (for responders)
  getActive: async (params?: { zone_id?: string; lat?: number; lng?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/active${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch active emergencies');
    return res.json();
  },

  // Dispatch
  acceptDispatch: async (request_id: string) => {
    const res = await fetch(`${BASE}/dispatch/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id }),
    });
    if (!res.ok) throw new Error('Failed to accept dispatch');
    return res.json();
  },

  updateDispatch: async (request_id: string, action: string) => {
    const res = await fetch(`${BASE}/dispatch/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id, action }),
    });
    if (!res.ok) throw new Error('Failed to update dispatch');
    return res.json();
  },
};