/**
 * Community World Constants
 */

export const POST_TYPES = [
  { id: 'post', label: 'Post', description: 'General neighborhood post' },
  { id: 'announcement', label: 'Announcement', description: 'Official announcement' },
  { id: 'event', label: 'Event', description: 'Community event' },
  { id: 'poll', label: 'Poll', description: 'Neighborhood poll' },
  { id: 'alert', label: 'Alert', description: 'Urgent community alert' },
] as const;

export const EVENT_CATEGORIES = [
  { id: 'concert', label: 'Concert', icon: 'Music' },
  { id: 'workshop', label: 'Workshop', icon: 'Wrench' },
  { id: 'meetup', label: 'Meetup', icon: 'Users' },
  { id: 'sports', label: 'Sports', icon: 'Zap' },
  { id: 'festival', label: 'Festival', icon: 'Sparkles' },
  { id: 'exhibition', label: 'Exhibition', icon: 'Image' },
  { id: 'food', label: 'Food & Drink', icon: 'UtensilsCrossed' },
  { id: 'community', label: 'Community', icon: 'Home' },
  { id: 'other', label: 'Other', icon: 'Calendar' },
] as const;

export const VENUE_TYPES = [
  { id: 'hall', label: 'Community Hall' },
  { id: 'rooftop', label: 'Rooftop' },
  { id: 'open_ground', label: 'Open Ground' },
  { id: 'indoor', label: 'Indoor Venue' },
  { id: 'online', label: 'Online' },
  { id: 'other', label: 'Other' },
] as const;

export const BUNDLE_SERVICES = [
  'photographer', 'decorator', 'caterer', 'security',
  'sound_system', 'mc_host', 'florist', 'lighting',
  'videographer', 'transport', 'kids_corner', 'cleanup',
] as const;

export const VISIBILITY_SCOPES = [
  { id: 'block', label: 'My Block', description: 'Immediate neighbors' },
  { id: 'zone', label: 'My Zone', description: 'Entire neighborhood zone' },
  { id: 'city', label: 'My City', description: 'All zones in city' },
] as const;

export const REACTION_TYPES = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'wow', emoji: '😲', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'angry', emoji: '😡', label: 'Angry' },
] as const;

export const POLL_PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
] as const;

export type PostType = typeof POST_TYPES[number]['id'];
export type EventCategory = typeof EVENT_CATEGORIES[number]['id'];
export type VenueType = typeof VENUE_TYPES[number]['id'];
export type VisibilityScope = typeof VISIBILITY_SCOPES[number]['id'];
export type ReactionType = typeof REACTION_TYPES[number]['id'];