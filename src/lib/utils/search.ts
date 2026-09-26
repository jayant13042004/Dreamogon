/**
 * PostgREST uses commas, parentheses, quotes, and backslashes for its filter DSL syntax.
 * Directly interpolating raw user search queries into `.or()` breaks PostgREST parsing with HTTP 400.
 * This helper strips syntax-breaking characters while preserving normal words, numbers, spaces, and international text.
 */
export function sanitizePostgrestSearch(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[,()\\"%_]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
