'use client';

import { useState } from 'react';
import { Activity, BarChart3, CalendarClock, CheckCircle2, Link2, ShieldCheck } from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { buildSeriesPath, formatDay, formatRelative } from '../../lib/format';
import type { AnalyticsSummary, SeriesMetric } from '../../lib/types';

const RANGES = [7, 30, 90];

const METRICS: { key: SeriesMetric; label: string }[] = [
  { key: 'published', label: 'Published' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'protected', label: 'Protected' },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState<SeriesMetric>('published');

  const { data, error, loading } = useApiData<AnalyticsSummary>(`/api/analytics?days=${days}`);

  const series = data?.series[metric] ?? [];
  const total = series.reduce((sum, value) => sum + value, 0);
  const peak = series.length > 0 ? Math.max(...series) : 0;
  const peakIndex = series.indexOf(peak);
  const maxPlatformPosts = Math.max(1, ...(data?.platforms.map((entry) => entry.posts) ?? [1]));

  return (
    <AppShell active="analytics">
      <div className="p-6 xl:p-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
              <p className="text-slate-500 dark:text-slate-400">
                Built from the posts, fingerprints and questions stored for your account.
              </p>
            </div>

            <div className="flex gap-2" role="group" aria-label="Date range">
              {RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  aria-pressed={days === option}
                  className={
                    days === option
                      ? 'rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white'
                      : 'rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }
                >
                  {option}d
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Published', value: data?.totals.published ?? 0, Icon: CheckCircle2 },
              { label: 'Scheduled', value: data?.totals.scheduled ?? 0, Icon: CalendarClock },
              { label: 'Protected', value: data?.totals.protectedAssets ?? 0, Icon: ShieldCheck },
              { label: 'Channels', value: data?.totals.connectedChannels ?? 0, Icon: Link2 },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-2xl bg-surface-light p-5 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold">
                  {METRICS.find((entry) => entry.key === metric)?.label} per day
                </h3>
              </div>

              <select
                aria-label="Series metric"
                value={metric}
                onChange={(event) => setMetric(event.target.value as SeriesMetric)}
                className="rounded-lg border border-slate-200 bg-surface-light px-3 py-1 text-xs font-medium text-slate-600 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {METRICS.map((entry) => (
                  <option key={entry.key} value={entry.key}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="h-[220px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            ) : (
              <div className="relative h-[220px] w-full pt-2">
                <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 140">
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4461ee" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4461ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="0" x2="500" y1="140" y2="140" />
                  <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="70" y2="70" />
                  <path d={`${buildSeriesPath(series)} L500 140 L0 140 Z`} fill="url(#analyticsGradient)" stroke="none" />
                  <path
                    d={buildSeriesPath(series)}
                    fill="none"
                    stroke="#4461ee"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>{data ? formatDay(data.dates[0]) : '—'}</span>
              <span>
                Total{' '}
                <strong className="text-slate-900 dark:text-white">{total.toLocaleString()}</strong>
                {peak > 0 && peakIndex !== -1 ? ` • peak ${peak} on ${formatDay(data!.dates[peakIndex])}` : ''}
              </span>
              <span>{data ? formatDay(data.dates[data.dates.length - 1]) : '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <h3 className="text-base font-bold">Posts by platform</h3>

              {loading ? (
                <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              ) : (
                <div className="flex flex-col gap-4">
                  {(data?.platforms ?? []).map((entry) => (
                    <div key={entry.platform} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          {entry.platform}
                          {!entry.connected && <span className="text-slate-400">(not connected)</span>}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {entry.posts} {entry.posts === 1 ? 'post' : 'posts'} • {entry.published} published
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(entry.posts / maxPlatformPosts) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {data && data.totals.drafts === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No posts yet, so there is nothing to break down.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold">Latest events</h3>
              </div>

              {loading ? (
                <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              ) : data && data.events.length > 0 ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {data.events.slice(0, 8).map((event) => (
                    <li key={event.id} className="flex items-center justify-between gap-3">
                      <span className="truncate text-slate-600 dark:text-slate-300">
                        {event.type === 'post_published'
                          ? 'Published a post'
                          : event.type === 'post_scheduled'
                            ? 'Scheduled a post'
                            : event.type === 'asset_protected'
                              ? 'Protected an asset'
                              : 'Asked the assistant'}
                        {event.platform ? ` • ${event.platform}` : ''}
                      </span>
                      <span className="flex-shrink-0 text-xs text-slate-400">{formatRelative(event.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nothing recorded in this range yet.
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Reach and engagement from YouTube, Instagram and TikTok are not included: those numbers require a
            platform connection, which this app does not have yet.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
