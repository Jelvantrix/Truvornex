/**
 * Shared Event Bus Interface for Neighborhood Worlds
 * Worlds communicate ONLY through this event bus - never by importing directly into each other
 */

import type {
  NeighborhoodEvent,
  WorldName,
  EventPayload,
  EmergencyEventPayload,
  JuryEventPayload,
  GroupBuyEventPayload,
  SkillSwapEventPayload,
  CommunityEventPayload,
} from './neighborhood.types';

/**
 * Event handler signature
 */
export type EventHandler<P extends EventPayload = EventPayload> = (event: NeighborhoodEvent & { payload: P }) => void | Promise<void>;

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Event bus interface - implemented by the platform, consumed by worlds
 */
export interface INeighborhoodEventBus {
  /**
   * Subscribe to events from a specific world or all worlds
   */
  on<T extends EventPayload>(world: WorldName | '*', eventType: string, handler: EventHandler<T>): EventSubscription;

  /**
   * Subscribe to all events matching a pattern
   */
  onAny(handler: (event: NeighborhoodEvent) => void | Promise<void>): EventSubscription;

  /**
   * Emit an event to the bus
   */
  emit<E extends NeighborhoodEvent>(event: E): void;

  /**
   * Emit an event with automatic timestamp and source
   */
  publish<T extends EventPayload>(
    sourceWorld: WorldName,
    eventType: string,
    payload: T,
    correlationId?: string
  ): void;

  /**
   * Get event history for debugging/replay (optional)
   */
  getHistory?(world?: WorldName, limit?: number): NeighborhoodEvent[];
}

/**
 * Event factory helpers for each world
 */
export const EmergencyEvents = {
  incidentCreated: (payload: EmergencyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'incident.created',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'emergency',
    correlationId,
  }),

  incidentResolved: (payload: EmergencyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'incident.resolved',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'emergency',
    correlationId,
  }),

  responderAssigned: (payload: EmergencyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'responder.assigned',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'emergency',
    correlationId,
  }),
};

export const JuryEvents = {
  disputeFiled: (payload: JuryEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'dispute.filed',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'jury',
    correlationId,
  }),

  verdictReached: (payload: JuryEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'verdict.reached',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'jury',
    correlationId,
  }),

  appealOpened: (payload: JuryEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'appeal.opened',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'jury',
    correlationId,
  }),
};

export const GroupBuyEvents = {
  dealCreated: (payload: GroupBuyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'deal.created',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'group-buy',
    correlationId,
  }),

  dealActivated: (payload: GroupBuyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'deal.activated',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'group-buy',
    correlationId,
  }),

  dealExpired: (payload: GroupBuyEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'deal.expired',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'group-buy',
    correlationId,
  }),
};

export const SkillSwapEvents = {
  swapRequested: (payload: SkillSwapEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'swap.requested',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'skill-swap',
    correlationId,
  }),

  swapCompleted: (payload: SkillSwapEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'swap.completed',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'skill-swap',
    correlationId,
  }),

  creditsSettled: (payload: SkillSwapEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'credits.settled',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'skill-swap',
    correlationId,
  }),
};

export const CommunityEvents = {
  postCreated: (payload: CommunityEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'post.created',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'community',
    correlationId,
  }),

  pollClosed: (payload: CommunityEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'poll.closed',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'community',
    correlationId,
  }),

  eventPublished: (payload: CommunityEventPayload, correlationId?: string): NeighborhoodEvent => ({
    type: 'event.published',
    payload,
    timestamp: new Date().toISOString(),
    sourceWorld: 'community',
    correlationId,
  }),
};

/**
 * In-memory event bus implementation for development
 * Production should use Supabase Realtime or a proper message broker
 */
export class InMemoryEventBus implements INeighborhoodEventBus {
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  private anySubscribers: Set<(event: NeighborhoodEvent) => void> = new Set();
  private history: NeighborhoodEvent[] = [];
  private maxHistory = 1000;

  private getKey(world: WorldName | '*', eventType: string): string {
    return `${world}:${eventType}`;
  }

  on<T extends EventPayload>(world: WorldName | '*', eventType: string, handler: EventHandler<T>): EventSubscription {
    const key = this.getKey(world, eventType);
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(handler as EventHandler);

    return {
      unsubscribe: () => {
        this.subscribers.get(key)?.delete(handler as EventHandler);
      },
    };
  }

  onAny(handler: (event: NeighborhoodEvent) => void): EventSubscription {
    this.anySubscribers.add(handler);
    return {
      unsubscribe: () => this.anySubscribers.delete(handler),
    };
  }

  emit(event: NeighborhoodEvent): void {
    // Add to history
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify specific subscribers
    const specificKey = this.getKey(event.sourceWorld, event.type);
    const wildcardKey = this.getKey('*', event.type);

    this.subscribers.get(specificKey)?.forEach(h => {
      try { h(event); } catch (e) { console.error('[EventBus] Handler error:', e); }
    });

    this.subscribers.get(wildcardKey)?.forEach(h => {
      try { h(event); } catch (e) { console.error('[EventBus] Handler error:', e); }
    });

    // Notify any subscribers
    this.anySubscribers.forEach(h => {
      try { h(event); } catch (e) { console.error('[EventBus] Any handler error:', e); }
    });
  }

  publish<T extends EventPayload>(sourceWorld: WorldName, eventType: string, payload: T, correlationId?: string): void {
    const event: NeighborhoodEvent = {
      type: eventType as any,
      payload,
      timestamp: new Date().toISOString(),
      sourceWorld,
      correlationId,
    };
    this.emit(event);
  }

  getHistory(world?: WorldName, limit = 100): NeighborhoodEvent[] {
    let events = this.history;
    if (world) {
      events = events.filter(e => e.sourceWorld === world);
    }
    return events.slice(-limit);
  }
}

/**
 * Singleton instance for the application
 */
let eventBusInstance: INeighborhoodEventBus | null = null;

export function getEventBus(): INeighborhoodEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new InMemoryEventBus();
  }
  return eventBusInstance;
}

export function setEventBus(bus: INeighborhoodEventBus): void {
  eventBusInstance = bus;
}