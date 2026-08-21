/**
 * Jury World Constants
 */

export const VOTE_OPTIONS = [
  { value: 'for_plaintiff', label: 'For Complainant', description: 'Customer is right', color: 'emerald' },
  { value: 'for_defendant', label: 'For Provider', description: 'Provider is right', color: 'red' },
  { value: 'abstain', label: 'Abstain', description: 'Cannot decide', color: 'zinc' },
] as const;

export const DISPUTE_CATEGORIES = [
  { id: 'service_quality', label: 'Service Quality', description: 'Work not up to standard' },
  { id: 'pricing', label: 'Pricing Dispute', description: 'Overcharged or hidden fees' },
  { id: 'no_show', label: 'No-Show', description: 'Provider did not arrive' },
  { id: 'damage', label: 'Property Damage', description: 'Damage during service' },
  { id: 'communication', label: 'Poor Communication', description: 'Unresponsive or misleading' },
  { id: 'timeline', label: 'Timeline', description: 'Late or missed deadlines' },
  { id: 'other', label: 'Other', description: 'Other issues' },
] as const;

export const DISPUTE_PHASES = [
  { id: 'filing', label: 'Filed', description: 'Dispute submitted' },
  { id: 'evidence', label: 'Evidence', description: 'Both sides submit proof' },
  { id: 'jury_selection', label: 'Jury Selected', description: 'Community jurors chosen' },
  { id: 'deliberation', label: 'Deliberation', description: 'Jury reviews and votes' },
  { id: 'verdict', label: 'Verdict', description: 'Decision reached' },
  { id: 'appeal', label: 'Appeal', description: 'Party requests review' },
  { id: 'resolved', label: 'Resolved', description: 'Case closed' },
  { id: 'dismissed', label: 'Dismissed', description: 'Case thrown out' },
] as const;

export const QUORUM_THRESHOLD = 3;
export const VOTE_CREDIT_REWARD = 1;
export const APPEAL_WINDOW_DAYS = 7;

export type VoteValue = typeof VOTE_OPTIONS[number]['value'];
export type DisputeCategory = typeof DISPUTE_CATEGORIES[number]['id'];
export type DisputePhase = typeof DISPUTE_PHASES[number]['id'];