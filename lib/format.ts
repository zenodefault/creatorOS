export function formatDraftDate(value: string | null): { weekday: string; day: string } {
  if (!value) return { weekday: '--', day: '--' };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { weekday: '--', day: '--' };

  return {
    weekday: parsed.toLocaleDateString('en-US', { weekday: 'short' }),
    day: String(parsed.getDate()),
  };
}

export function formatDraftTime(value: string | null): string {
  if (!value) return 'Unscheduled';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unscheduled';

  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDay(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelative(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';

  const diffMs = Date.now() - parsed.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Combines local `<input type="date">` and `<input type="time">` values into an ISO instant. */
export function toScheduledFor(date: string, time: string): string | null {
  if (!date || !time) return null;

  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
}

/** Splits an ISO instant back into local date/time input values. */
export function splitScheduledFor(value: string | null): { date: string; time: string } {
  if (!value) return { date: '', time: '' };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };

  const pad = (input: number) => String(input).padStart(2, '0');

  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
}

export function buildSeriesPath(values: number[], width = 500, height = 140): string {
  if (values.length === 0) return '';

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / span) * (height - 20);

      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
