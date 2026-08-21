/**
 * Emergency World Constants
 */

export const EMERGENCY_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', description: 'Burst pipes, leaks, drainage issues' },
  { id: 'electrical', label: 'Electrical', description: 'Power outages, wiring, fuse issues' },
  { id: 'hvac', label: 'HVAC', description: 'AC, heating, ventilation failures' },
  { id: 'locksmith', label: 'Locksmith', description: 'Lockouts, broken locks, rekeying' },
  { id: 'structural', label: 'Structural', description: 'Roof leaks, wall cracks, foundation' },
  { id: 'appliance', label: 'Appliance', description: 'Fridge, washer, oven, water heater' },
  { id: 'gas', label: 'Gas', description: 'Gas leaks, stove issues, cylinder' },
  { id: 'pest', label: 'Pest Control', description: 'Infestations, rodents, termites' },
] as const;

export const URGENCY_LEVELS = [
  { id: 'critical', label: 'EMERGENCY', description: 'Within 30 minutes', color: 'red', priority: 0 },
  { id: 'immediate', label: 'Right Now', description: 'Within 1 hour', color: 'orange', priority: 1 },
  { id: 'urgent', label: 'Within 4 Hours', description: 'Same day service', color: 'amber', priority: 2 },
  { id: 'scheduled', label: 'Schedule', description: 'Next available slot', color: 'slate', priority: 3 },
] as const;

export const STATUS_STEPS = ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Submitted',
  assigned: 'Provider Matched',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

export const MAX_DESCRIPTION_LENGTH = 500;
export const DISPATCH_RADIUS_KM = 25;
export const RESPONDER_CATEGORIES = EMERGENCY_CATEGORIES.map(c => c.id);

export type EmergencyCategory = typeof EMERGENCY_CATEGORIES[number]['id'];
export type UrgencyLevel = typeof URGENCY_LEVELS[number]['id'];
export type EmergencyStatus = typeof STATUS_STEPS[number];