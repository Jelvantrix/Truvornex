/**
 * Group Buy World API Client
 */

const BASE = '/api/neighborhood/group-buy';

export const groupBuyApi = {
  getDeals: async (params?: { zone_id?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch deals');
    return res.json();
  },

  getDeal: async (id: string) => {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch deal');
    return res.json();
  },

  createDeal: async (data: {
    zone_id?: string;
    service_category: string;
    description?: string;
    target_participants?: number;
    discount_percent?: number;
    max_discount_percent?: number;
    expires_at?: string;
  }) => {
    const res = await fetch(`${BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create deal');
    return res.json();
  },

  joinDeal: async (id: string, commitment_level?: string, notes?: string) => {
    const res = await fetch(`${BASE}/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commitment_level, notes }),
    });
    if (!res.ok) throw new Error('Failed to join deal');
    return res.json();
  },

  getMyParticipations: async () => {
    const res = await fetch(`${BASE}/my/participations`);
    if (!res.ok) throw new Error('Failed to fetch participations');
    return res.json();
  },

  activateDeal: async (id: string, data: {
    provider_id?: string;
    final_price: number;
    original_price: number;
    deal_terms?: any;
    expires_at?: string;
  }) => {
    const res = await fetch(`${BASE}/${id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to activate deal');
    return res.json();
  },

  getMyDeals: async () => {
    const res = await fetch(`${BASE}/deals/my`);
    if (!res.ok) throw new Error('Failed to fetch deals');
    return res.json();
  },

  completeDeal: async (id: string) => {
    const res = await fetch(`${BASE}/deals/${id}/complete`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to complete deal');
    return res.json();
  },
};