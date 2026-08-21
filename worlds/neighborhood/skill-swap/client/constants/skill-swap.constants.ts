/**
 * Skill Swap World Constants
 */

export const SKILL_CATEGORIES = [
  'Tech & Digital', 'Creative & Design', 'Home & Repair', 'Food & Cooking',
  'Languages & Tutoring', 'Health & Wellness', 'Business & Finance', 'Automotive',
  'Gardening & Outdoors', 'Writing & Editing', 'Music & Audio', 'Photography & Video',
  'Personal Services', 'Education & Learning', 'Legal & Admin',
] as const;

export const DEFAULT_TIME_CREDITS = 1;
export const MAX_TIME_CREDITS = 20;
export const MIN_TIME_CREDITS = 1;

export const SWAP_STATUSES = [
  'open', 'matched', 'in_progress', 'completed', 'cancelled',
] as const;

export const PROPOSAL_STATUSES = [
  'pending', 'accepted', 'rejected', 'withdrawn',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
export type SwapStatus = typeof SWAP_STATUSES[number];
export type ProposalStatus = typeof PROPOSAL_STATUSES[number];