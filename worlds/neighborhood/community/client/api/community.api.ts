/**
 * Community World API Client
 */

const BASE = '/api/neighborhood/community';

export const communityApi = {
  // Posts
  getPosts: async (params?: { zone_id?: string; neighborhood_id?: string; scope?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/posts${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  getPost: async (id: string) => {
    const res = await fetch(`${BASE}/posts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  createPost: async (data: {
    zone_id?: string;
    neighborhood_id?: string;
    type?: string;
    title?: string;
    body: string;
    image_url?: string;
    tags?: string[];
    visibility_scope?: string;
  }) => {
    const res = await fetch(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  reactToPost: async (postId: string, reaction_type: string) => {
    const res = await fetch(`${BASE}/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction_type }),
    });
    if (!res.ok) throw new Error('Failed to react');
    return res.json();
  },

  commentOnPost: async (postId: string, body: string, parent_comment_id?: string) => {
    const res = await fetch(`${BASE}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parent_comment_id }),
    });
    if (!res.ok) throw new Error('Failed to comment');
    return res.json();
  },

  // Polls
  getPolls: async (params?: { zone_id?: string; neighborhood_id?: string; scope?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/polls${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch polls');
    return res.json();
  },

  createPoll: async (data: {
    zone_id?: string;
    neighborhood_id?: string;
    question: string;
    options: string[];
    expires_at?: string;
    visibility_scope?: string;
  }) => {
    const res = await fetch(`${BASE}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create poll');
    return res.json();
  },

  votePoll: async (pollId: string, option_index: number) => {
    const res = await fetch(`${BASE}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_index }),
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
  },

  // Events
  getEvents: async (params?: { zone_id?: string; neighborhood_id?: string; scope?: string; upcoming?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/events${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  createEvent: async (data: {
    zone_id?: string;
    neighborhood_id?: string;
    title: string;
    description?: string;
    category?: string;
    venue_name: string;
    venue_type?: string;
    address?: string;
    date: string;
    start_time?: string;
    end_time?: string;
    ticket_price?: number;
    is_free?: boolean;
    total_tickets?: number;
    bundle_services?: string[];
    cover_image_url?: string;
    visibility_scope?: string;
    capacity?: number;
    tags?: string[];
  }) => {
    const res = await fetch(`${BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
  },

  getEventTicket: async (eventId: string, quantity?: number) => {
    const res = await fetch(`${BASE}/event-tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, quantity: quantity || 1 }),
    });
    if (!res.ok) throw new Error('Failed to get ticket');
    return res.json();
  },

  // Announcements
  getAnnouncements: async (params?: { zone_id?: string; neighborhood_id?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/announcements${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },
};