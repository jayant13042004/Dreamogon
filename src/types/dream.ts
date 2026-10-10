export type Mood = 'peaceful' | 'happy' | 'anxious' | 'confused' | 'sad' | 'excited' | 'scared' | 'neutral' | 'other';
export type Lucidity = 'not_lucid' | 'partially_lucid' | 'lucid' | 'not_sure';

export interface Emotion {
  name: string;
  percentage: number;
}

export interface DreamSymbol {
  name: string;
  reflection?: string;
}

export interface DreamAnalysis {
  summary: string;
  emotions: Emotion[];
  themes: string[];
  symbols?: DreamSymbol[];
  people?: string[];
  locations?: string[];
  notable_details?: string[];
  possible_interpretations: string[];
  recurring_patterns: string[];
  reflection_questions: string[];
  insight: string;
  key_elements: string[];
  entities?: Array<{
    entity_type: EntityType;
    entity_name: string;
    confidence: number;
  }>;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  dream_date: string;
  created_at: string;
  updated_at: string;
  mood: Mood | null;
  lucidity: Lucidity | null;
  ai_summary: string | null;
  ai_analysis: DreamAnalysis | null;
  ai_emotions: string[] | null;
  ai_symbols: string[] | null;
  ai_themes: string[] | null;
  embedding: number[] | null;
  /** Stable display URL (proxy path or legacy data/http URL) */
  image_url?: string | null;
  /** Supabase Storage object path — source of truth for new images */
  image_path?: string | null;
  image_status?: 'none' | 'generating' | 'completed' | 'failed' | null;
  image_prompt?: string | null;
  image_generated_at?: string | null;
  image_generation_count?: number | null;
  /** Phase 3: Supabase Storage audio object path */
  audio_path?: string | null;
  /** Duration in seconds */
  audio_duration_seconds?: number | null;
  /** MIME type (audio/webm, audio/mp4, etc.) */
  audio_mime_type?: string | null;
  /** Audio file size in bytes */
  audio_file_size_bytes?: number | null;
  /** Transcription lifecycle status */
  transcription_status?: 'none' | 'transcribing' | 'completed' | 'failed' | null;
  /** Initial verbatim transcript before any user edits */
  raw_transcript?: string | null;
  /** Client local unique ID for idempotency and duplicate prevention */
  client_local_id?: string | null;
  dream_tags?: DreamTag[];
  dream_entities?: DreamEntity[];
  /** Phase 7: Multi-segment dream memories */
  dream_segments?: DreamSegment[];
}

export type SegmentType = 'voice' | 'text';

export interface DreamSegment {
  id: string;
  dream_id: string;
  user_id: string;
  segment_index: number;
  segment_type: SegmentType;
  content: string;
  raw_transcript?: string | null;
  audio_path?: string | null;
  audio_duration_seconds?: number | null;
  audio_mime_type?: string | null;
  audio_file_size_bytes?: number | null;
  transcription_status?: 'none' | 'transcribing' | 'completed' | 'failed' | null;
  client_local_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type EntityType = 'person' | 'place' | 'object' | 'emotion' | 'animal' | 'activity' | 'symbol' | 'theme';

export interface DreamEntity {
  id: string;
  dream_id: string;
  user_id: string;
  entity_type: EntityType;
  entity_name: string;
  confidence: number;
  created_at: string;
}

export interface DreamTag {
  id: string;
  dream_id: string;
  user_id: string;
  tag: string;
}

export interface CreateDreamInput {
  title?: string;
  content: string;
  dream_date: string;
  mood?: Mood;
  lucidity?: Lucidity;
}

export interface UpdateDreamInput {
  title?: string;
  content?: string;
  dream_date?: string;
  mood?: Mood;
  lucidity?: Lucidity;
}

export type TemporalStatus = 'emerging' | 'recurring' | 'dormant' | 'anchor' | 'fading';

export interface DreamArtifact {
  id: string;
  user_id: string;
  artifact_type: EntityType;
  name: string;
  description: string | null;
  metadata: any;
  appearance_count: number;
  first_seen_at: string;
  last_seen_at: string;
  position_x: number;
  position_y: number;
  position_z: number;
  temporal_status?: TemporalStatus;
  connected_artifact_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface DreamConnection {
  id: string;
  user_id: string;
  artifact_id_1: string;
  artifact_id_2: string;
  connection_strength: number;
  first_connected_at: string;
}

export interface DreamInsight {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_pro_locked: boolean;
  related_dream_ids: string[];
  related_artifact_ids: string[];
  created_at: string;
}

export interface DreamWorldState {
  user_id: string;
  world_theme: 'ethereal' | 'deep_ocean' | 'twilight' | 'lucid';
  maturity_level: number;
  camera_position_x: number;
  camera_position_y: number;
  camera_position_z: number;
  unlocked_features: any;
  created_at: string;
  updated_at: string;
}

export interface EntityContinuity {
  id?: string;
  name: string;
  type: EntityType;
  appearanceCount: number;
  firstSeenAt: string;
  lastSeenAt?: string;
  isFirstAppearance: boolean;
  continuityBadge: string;
}

export interface RelatedDreamConnection {
  id: string;
  title: string;
  dream_date: string;
  ai_summary: string | null;
  content: string;
  sharedEntities: string[];
  sharedThemes: string[];
  semanticScore: number;
  reasons: string[];
  primaryReason: string;
}
