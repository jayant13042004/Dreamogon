export interface VoiceLanguage {
  code: string;
  label: string;
  nativeLabel: string;
  short: string;
  flag?: string;
}

export const SUPPORTED_LANGUAGES: VoiceLanguage[] = [
  { code: 'en-US', label: 'English (US)', nativeLabel: 'English (US)', short: 'EN' },
  { code: 'en-GB', label: 'English (UK)', nativeLabel: 'English (UK)', short: 'UK' },
  { code: 'en-IN', label: 'English (India)', nativeLabel: 'English (India)', short: 'EN-IN' },
  { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी', short: 'HI' },
  { code: 'es-ES', label: 'Spanish (Spain)', nativeLabel: 'Español (España)', short: 'ES' },
  { code: 'es-419', label: 'Spanish (Latin America)', nativeLabel: 'Español (Latinoamérica)', short: 'ES-LA' },
  { code: 'fr-FR', label: 'French (France)', nativeLabel: 'Français (France)', short: 'FR' },
  { code: 'fr-CA', label: 'French (Canada)', nativeLabel: 'Français (Canada)', short: 'FR-CA' },
  { code: 'de-DE', label: 'German', nativeLabel: 'Deutsch', short: 'DE' },
  { code: 'it-IT', label: 'Italian', nativeLabel: 'Italiano', short: 'IT' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', nativeLabel: 'Português (Brasil)', short: 'PT-BR' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)', nativeLabel: 'Português (Portugal)', short: 'PT' },
  { code: 'ja-JP', label: 'Japanese', nativeLabel: '日本語', short: 'JA' },
  { code: 'ko-KR', label: 'Korean', nativeLabel: '한국어', short: 'KO' },
  { code: 'zh-CN', label: 'Mandarin (Simplified)', nativeLabel: '中文 (普通话)', short: 'ZH' },
  { code: 'nl-NL', label: 'Dutch', nativeLabel: 'Nederlands', short: 'NL' },
  { code: 'ru-RU', label: 'Russian', nativeLabel: 'Русский', short: 'RU' },
  { code: 'ar-SA', label: 'Arabic', nativeLabel: 'العربية', short: 'AR' },
  { code: 'tr-TR', label: 'Turkish', nativeLabel: 'Türkçe', short: 'TR' },
  { code: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी', short: 'MR' },
  { code: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা', short: 'BN' },
  { code: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்', short: 'TA' },
  { code: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు', short: 'TE' },
  { code: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી', short: 'GU' },
  { code: 'pl-PL', label: 'Polish', nativeLabel: 'Polski', short: 'PL' },
  { code: 'sv-SE', label: 'Swedish', nativeLabel: 'Svenska', short: 'SV' },
];

export const DEFAULT_LANGUAGE = 'en-US';
