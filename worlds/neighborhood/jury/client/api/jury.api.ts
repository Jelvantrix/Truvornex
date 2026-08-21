/**
 * Jury World API Client
 */

const BASE = '/api/neighborhood/jury';

export const juryApi = {
  // Disputes
  getDisputes: async () => {
    const res = await fetch(`${BASE}/disputes`);
    if (!res.ok) throw new Error('Failed to fetch disputes');
    return res.json();
  },

  getDispute: async (id: string) => {
    const res = await fetch(`${BASE}/disputes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch dispute');
    return res.json();
  },

  fileDispute: async (data: {
    zone_id?: string;
    category: string;
    description: string;
    evidence_urls?: string[];
    evidence_notes?: string;
    against_id?: string;
    booking_id?: string;
  }) => {
    const res = await fetch(`${BASE}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to file dispute');
    return res.json();
  },

  getMyDisputes: async () => {
    const res = await fetch(`${BASE}/my-disputes`);
    if (!res.ok) throw new Error('Failed to fetch disputes');
    return res.json();
  },

  // Jury selection
  selectJury: async (disputeId: string) => {
    const res = await fetch(`${BASE}/disputes/${disputeId}/select-jury`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to select jury');
    return res.json();
  },

  // Voting
  vote: async (disputeId: string, vote: 'for_plaintiff' | 'for_defendant' | 'abstain') => {
    const res = await fetch(`${BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispute_id: disputeId, vote }),
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
  },

  getMyVotes: async () => {
    const res = await fetch(`${BASE}/my-votes`);
    if (!res.ok) throw new Error('Failed to fetch votes');
    return res.json();
  },

  // Appeals
  fileAppeal: async (disputeId: string, grounds: string) => {
    const res = await fetch(`${BASE}/appeal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispute_id: disputeId, grounds }),
    });
    if (!res.ok) throw new Error('Failed to file appeal');
    return res.json();
  },
};