/**
 * Skill Swap World API Client
 */

const BASE = '/api/neighborhood/skill-swap';

export const skillSwapApi = {
  getSwaps: async (params?: { zone_id?: string; category_offering?: string; category_seeking?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch skill swaps');
    return res.json();
  },

  getMySwaps: async () => {
    const res = await fetch(`${BASE}/my`);
    if (!res.ok) throw new Error('Failed to fetch my swaps');
    return res.json();
  },

  getMatchedSwaps: async () => {
    const res = await fetch(`${BASE}/matched`);
    if (!res.ok) throw new Error('Failed to fetch matched swaps');
    return res.json();
  },

  getBalance: async () => {
    const res = await fetch(`${BASE}/time-credits/balance`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },

  getHistory: async () => {
    const res = await fetch(`${BASE}/time-credits/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  createSwap: async (data: {
    zone_id?: string;
    offering: string;
    seeking: string;
    time_credits_offered?: number;
    time_credits_sought?: number;
    category_offering?: string;
    category_seeking?: string;
  }) => {
    const res = await fetch(`${BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create swap');
    return res.json();
  },

  proposeSwap: async (swapId: string, message?: string, proposed_credits?: number) => {
    const res = await fetch(`${BASE}/${swapId}/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, proposed_credits }),
    });
    if (!res.ok) throw new Error('Failed to propose swap');
    return res.json();
  },

  acceptProposal: async (proposalId: string) => {
    const res = await fetch(`${BASE}/proposals/${proposalId}/accept`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to accept proposal');
    return res.json();
  },

  completeSwap: async (swapId: string, rating?: number, review?: string) => {
    const res = await fetch(`${BASE}/${swapId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review }),
    });
    if (!res.ok) throw new Error('Failed to complete swap');
    return res.json();
  },

  getMyProposals: async () => {
    const res = await fetch(`${BASE}/proposals/my`);
    if (!res.ok) throw new Error('Failed to fetch proposals');
    return res.json();
  },

  getReceivedProposals: async () => {
    const res = await fetch(`${BASE}/proposals/received`);
    if (!res.ok) throw new Error('Failed to fetch proposals');
    return res.json();
  },
};