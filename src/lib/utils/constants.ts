import type { Mood, Lucidity } from '@/types/dream';

export const APP_NAME = 'Subconscious Log';
export const APP_DESCRIPTION =
  'A private place to record your dreams and discover what keeps returning.';

export const MOODS: Array<{ label: string; value: Mood; emoji: string; color: string }> = [
  { label: 'Peaceful', value: 'peaceful', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
  { label: 'Happy', value: 'happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Anxious', value: 'anxious', emoji: '😰', color: 'bg-red-100 text-red-800' },
  { label: 'Confused', value: 'confused', emoji: '😕', color: 'bg-purple-100 text-purple-800' },
  { label: 'Sad', value: 'sad', emoji: '😢', color: 'bg-indigo-100 text-indigo-800' },
  { label: 'Excited', value: 'excited', emoji: '🤩', color: 'bg-orange-100 text-orange-800' },
  { label: 'Scared', value: 'scared', emoji: '😨', color: 'bg-slate-800 text-slate-200' },
  { label: 'Neutral', value: 'neutral', emoji: '😐', color: 'bg-gray-100 text-gray-800' },
  { label: 'Other', value: 'other', emoji: '🤔', color: 'bg-slate-100 text-slate-800' },
];

export const LUCIDITY_OPTIONS: Array<{ label: string; value: Lucidity; description: string }> = [
  { label: 'Not Lucid', value: 'not_lucid', description: 'I had no idea I was dreaming.' },
  { label: 'Partially Lucid', value: 'partially_lucid', description: 'I vaguely realized it was a dream, but couldn\'t control it.' },
  { label: 'Lucid', value: 'lucid', description: 'I knew I was dreaming and could control my actions.' },
  { label: 'Not Sure', value: 'not_sure', description: 'I cannot remember if I was lucid or not.' }
];

export const ANALYSIS_STAGES = [
  'Reading dream content...',
  'Extracting emotions and themes...',
  'Identifying key elements...',
  'Generating possible interpretations...',
  'Formulating insights...'
];
