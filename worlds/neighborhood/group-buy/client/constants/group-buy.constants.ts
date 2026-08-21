/**
 * Group Buy World Constants
 */

export const SERVICE_CATEGORIES = [
  'Cleaning', 'Gardening', 'Plumbing', 'Electrical', 'Painting',
  'HVAC', 'Security', 'Handyman', 'Pest Control', 'Moving',
  'AC Maintenance', 'Generator Service', 'Water Tank Cleaning', 'Carpentry',
  'Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning', 'Sofa Cleaning',
  'Marble Polishing', 'Tank Cleaning', 'Solar Panel Cleaning',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Cleaning': 'Leaf', 'Gardening': 'Leaf', 'Plumbing': 'Wrench', 'Electrical': 'Zap',
  'Painting': 'Package', 'HVAC': 'Building2', 'Security': 'Shield', 'Handyman': 'Hammer',
  'Pest Control': 'Shield', 'Moving': 'Truck', 'AC Maintenance': 'Building2',
  'Generator Service': 'Zap', 'Water Tank Cleaning': 'Wrench', 'Carpentry': 'Hammer',
  'Deep Cleaning': 'Leaf', 'Window Cleaning': 'Leaf', 'Carpet Cleaning': 'Leaf', 'Sofa Cleaning': 'Leaf',
  'Marble Polishing': 'Package', 'Tank Cleaning': 'Wrench', 'Solar Panel Cleaning': 'Zap',
};

export const MIN_TARGET_PARTICIPANTS = 3;
export const MAX_TARGET_PARTICIPANTS = 20;
export const DEFAULT_DISCOUNT_PERCENT = 15;
export const MAX_DISCOUNT_PERCENT = 35;
export const DEFAULT_EXPIRY_DAYS = 7;
export const MAX_EXPIRY_DAYS = 30;

export const DEAL_STATUSES = [
  'open', 'locked', 'activated', 'completed', 'cancelled',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
export type DealStatus = typeof DEAL_STATUSES[number];