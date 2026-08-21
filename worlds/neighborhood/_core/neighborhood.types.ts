/**
 * Shared TypeScript types across all Neighborhood Worlds
 * This file is the single source of truth for cross-world type contracts
 */

// ──────────────────────────────────────────────────────────────────────────────
// Core Neighborhood Types
// ──────────────────────────────────────────────────────────────────────────────

export interface NeighborhoodZone {
  id: string;
  name: string;
  area?: string;
  city?: string;
  healthScore: number;
  demandIndex: number;
  activeProviders: number;
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  geolocation?: GeoJSON.Point;
  createdAt: string;
  updatedAt: string;
}

export interface NeighborhoodMembership {
  id: string;
  userId: string;
  zoneId: string;
  role: 'resident' | 'provider' | 'admin' | 'moderator';
  joinedAt: string;
  verifiedAt?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Event Bus Types (World Communication)
// ──────────────────────────────────────────────────────────────────────────────

export type EventPayload =
  | EmergencyEventPayload
  | JuryEventPayload
  | GroupBuyEventPayload
  | SkillSwapEventPayload
  | CommunityEventPayload;

export interface BaseEvent<T extends string, P> {
  type: T;
  payload: P;
  timestamp: string;
  sourceWorld: WorldName;
  correlationId?: string;
}

export type WorldName = 'emergency' | 'jury' | 'group-buy' | 'skill-swap' | 'community' | '_core';

export type NeighborhoodEvent =
  | BaseEvent<'incident.created', EmergencyEventPayload>
  | BaseEvent<'incident.resolved', EmergencyEventPayload>
  | BaseEvent<'responder.assigned', EmergencyEventPayload>
  | BaseEvent<'dispute.filed', JuryEventPayload>
  | BaseEvent<'verdict.reached', JuryEventPayload>
  | BaseEvent<'appeal.opened', JuryEventPayload>
  | BaseEvent<'deal.created', GroupBuyEventPayload>
  | BaseEvent<'deal.activated', GroupBuyEventPayload>
  | BaseEvent<'deal.expired', GroupBuyEventPayload>
  | BaseEvent<'swap.requested', SkillSwapEventPayload>
  | BaseEvent<'swap.completed', SkillSwapEventPayload>
  | BaseEvent<'credits.settled', SkillSwapEventPayload>
  | BaseEvent<'post.created', CommunityEventPayload>
  | BaseEvent<'poll.closed', CommunityEventPayload>
  | BaseEvent<'event.published', CommunityEventPayload>;

export interface EmergencyEventPayload {
  incidentId: string;
  zoneId: string;
  category: string;
  urgency: 'critical' | 'immediate' | 'urgent' | 'scheduled';
  customerId: string;
  responderId?: string;
}

export interface JuryEventPayload {
  disputeId: string;
  zoneId: string;
  raisedBy: string;
  againstId?: string;
  category: string;
  phase: 'filing' | 'evidence' | 'jury_selection' | 'deliberation' | 'verdict' | 'appeal';
}

export interface GroupBuyEventPayload {
  dealId: string;
  zoneId: string;
  serviceCategory: string;
  initiatorId: string;
  targetParticipants: number;
  currentParticipants: number;
  discountPercent: number;
}

export interface SkillSwapEventPayload {
  swapId: string;
  zoneId: string;
  offererId: string;
  offering: string;
  seeking: string;
  timeCreditsOffered: number;
  matchedWithUserId?: string;
}

export interface CommunityEventPayload {
  postId: string;
  zoneId: string;
  authorId: string;
  type: 'post' | 'announcement' | 'event' | 'poll' | 'alert';
  visibilityScope: 'block' | 'zone' | 'city';
}

// ──────────────────────────────────────────────────────────────────────────────
// API Contract Types
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Shared Enums & Constants
// ──────────────────────────────────────────────────────────────────────────────

export const URGENCY_LEVELS = ['critical', 'immediate', 'urgent', 'scheduled'] as const;
export type UrgencyLevel = typeof URGENCY_LEVELS[number];

export const DISPUTE_PHASES = ['filing', 'evidence', 'jury_selection', 'deliberation', 'verdict', 'appeal'] as const;
export type DisputePhase = typeof DISPUTE_PHASES[number];

export const VISIBILITY_SCOPES = ['block', 'zone', 'city'] as const;
export type VisibilityScope = typeof VISIBILITY_SCOPES[number];

export const POST_TYPES = ['post', 'announcement', 'event', 'poll', 'alert'] as const;
export type PostType = typeof POST_TYPES[number];

export const VOTE_TYPES = ['for_plaintiff', 'for_defendant', 'abstain'] as const;
export type VoteType = typeof VOTE_TYPES[number];