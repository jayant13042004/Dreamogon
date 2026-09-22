export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting = 'Good evening';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  }

  return name ? `${greeting}, ${name}` : greeting;
}

/** Parse YYYY-MM-DD as local calendar date (avoids UTC day-shift). */
export function parseLocalDateKey(date: string | Date): Date {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [y, m, d] = date.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(date);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function toDateKey(input: string | Date): string {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    return input.slice(0, 10);
  }
  const d = parseLocalDateKey(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDreamDate(date: string | Date): string {
  return parseLocalDateKey(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getRelativeDate(date: string | Date): string {
  const d = parseLocalDateKey(date);
  const now = new Date();
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowDay.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return formatShortDate(d);
}

export function formatShortDate(date: string | Date): string {
  return parseLocalDateKey(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
