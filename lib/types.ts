export type ArgumentClassification =
  | 'price_challenge'
  | 'fairness_appeal'
  | 'time_pressure'
  | 'information_request'
  | 'relationship_signal'
  | 'authority_constraint'
  | 'emotional_expression'
  | 'general';

export type EmotionalState =
  | 'frustrated'
  | 'enthusiastic'
  | 'sceptical'
  | 'satisfied'
  | 'neutral'
  | 'pressured';

export type NegotiationPhase =
  | 'opening'
  | 'elicitation'
  | 'negotiation'
  | 'closure'
  | 'escalation';

export type PersonaType =
  | 'compliance_officer'
  | 'esg_fund_manager'
  | 'trading_desk'
  | 'sustainability_director'
  | 'government_procurement';

export type NegotiationOutcome = 'agreed' | 'deferred' | 'escalated' | null;

export interface Message {
  role: 'agent' | 'buyer';
  content: string;
  timestamp: string;
  argumentClassification?: ArgumentClassification;
  emotionalState?: EmotionalState;
}

export interface BuyerProfile {
  persona: PersonaType | 'freeplay';
  detectedWarmth: number;       // 1-10
  detectedDominance: number;    // 1-10
  priceAnchor: number | null;
  volumeInterest: number | null;
  timelineUrgency: 'low' | 'medium' | 'high' | null;
  complianceDriver: string | null;
}

export interface NegotiationState {
  round: number;
  phase: NegotiationPhase;
  anchorPrice: number;
  currentOfferPrice: number;
  priceFloor: number;
  maxConcessionPerRound: number;
  maxTotalConcession: number;
  totalConcessionGiven: number;
  roundsSinceLastConcession: number;
  minimumRoundsBeforeConcession: number;
  messages: Message[];
  buyerProfile: BuyerProfile;
  argumentHistory: ArgumentClassification[];
  emotionalState: EmotionalState;
  negotiationComplete: boolean;
  outcome: NegotiationOutcome;
}

export interface ClaudeResponse {
  response: string;
  argumentClassification: ArgumentClassification;
  emotionalState: EmotionalState;
  detectedWarmth: number;
  detectedDominance: number;
  proposedPrice: number | null;
  suggestedConcession: string | null;
  escalate: boolean;
  escalationReason: string | null;
}

export interface PersonaDefinition {
  id: PersonaType;
  name: string;
  title: string;
  organisation: string;
  warmth: number;         // 1-10
  dominance: number;      // 1-10
  patience: number;       // 1-10
  primaryMotivation: string;
  budgetRange: string;
  volumeTarget: string;
  briefing: string;       // shown to the human tester
  agentStrategy: string;  // embedded in the system prompt for Claude
}