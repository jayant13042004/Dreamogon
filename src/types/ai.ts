export interface DreamReferenceItem {
  id: string;
  title: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  dream_references?: DreamReferenceItem[];
  created_at: string;
  user_id?: string;
  provenance?: {
    totalArchiveSearched: number;
    earliestDate?: string;
    latestDate?: string;
    matchedCount: number;
  };
}

export interface AnalysisStage {
  name: string;
  status: 'pending' | 'active' | 'complete';
}

export interface PatternAnalysis {
  recurring_themes: string[];
  recurring_symbols: string[];
  recurring_people: string[];
  recurring_places: string[];
  emotional_patterns: string[];
  frequency_changes: string[];
  interesting_observations: string[];
}

export interface MotifShift {
  motif: string;
  type: 'emerging' | 'fading' | 'transforming' | 'stabilizing';
  category: 'theme' | 'person' | 'place' | 'symbol' | 'emotion' | 'narrative';
  observation: string;
  earlierContext?: string;
  recentContext?: string;
}

export interface TemporalPeriodSummary {
  dateRange: string;
  dreamCount: number;
  dominantMoods: string[];
  keyMotifs: string[];
  characteristicAtmosphere: string;
}

export interface DreamEvolutionAnalysis {
  temporalComparison: {
    earlierPeriod: TemporalPeriodSummary;
    recentPeriod: TemporalPeriodSummary;
    summary: string;
  };
  shifts: MotifShift[];
  emotionalTrajectory: {
    direction: string;
    observation: string;
  };
  narrativeAgency: {
    observation: string;
  };
  reflectionPrompt: string;
  analyzedAt: string;
  totalDreamsAnalyzed: number;
}
