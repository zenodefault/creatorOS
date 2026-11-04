'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  Inbox,
  Link2,
  MessageSquare,
  SquarePlus,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { buildSeriesPath, formatDateTime, formatDraftDate, formatDraftTime, formatRelative } from '../../lib/format';
import type { AnalyticsSummary, EventType, SeriesMetric } from '../../lib/types';

const METRIC_OPTIONS: { key: SeriesMetric; label: string }[] = [
  { key: 'published', label: 'Published' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'protected', label: 'Protected assets' },
];

const EVENT_COPY: Record<EventType, { label: string; Icon: typeof Activity }> = {
  post_scheduled: { label: 'Scheduled a post', Icon: CalendarClock },
  post_published: { label: 'Published a post', Icon: Video },
  asset_protected: { label: 'Protected an asset', Icon: ShieldCheck },
  assistant_message: { label: 'Asked the assistant', Icon: MessageSquare },
};

function StatCard({
  label,
  value,
  caption,
  Icon,
}: {
  label: string;
  value: number;
  caption: string;
  Icon: typeof Activity;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-400">{caption}</p>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[240px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />;
}

export default function DashboardPage() {
  const { data, error, loading } = useApiData<AnalyticsSummary>('/api/analytics?days=7');
  const [metric, setMetric] = useState<SeriesMetric>('published');

  const series = data?.series[metric] ?? [];
  const total = series.reduce((sum, value) => sum + value, 0);

  const nextSteps: { text: string; href: string; cta: string }[] = [];
  if (data) {
    if (data.totals.drafts === 0) {
      nextSteps.push({ text: 'Your studio is empty. Draft your first post.', href: '/studio', cta: 'Open Studio' });
    }
    if (data.totals.scheduled === 0 && data.totals.drafts > 0) {
      nextSteps.push({ text: 'Nothing is scheduled yet.', href: '/studio', cta: 'Schedule a post' });
    }
    if (data.totals.protectedAssets === 0) {
      nextSteps.push({ text: 'No asset is fingerprinted yet.', href: '/protection', cta: 'Protect a file' });
    }
    if (data.totals.connectedChannels === 0) {
      nextSteps.push({ text: 'No channel is connected.', href: '/settings', cta: 'Connect channels' });
    }
    if (nextSteps.length === 0) {
      nextSteps.push({ text: 'Everything is set up. Keep the queue full.', href: '/studio', cta: 'Add a post' });
    }
  }

  return (
    <AppShell active="dashboard">
      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 p-6 xl:p-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-slate-500 dark:text-slate-400">
                {loading
                  ? 'Loading your workspace…'
                  : `Everything below is computed from your ${data?.totals.drafts ?? 0} ${
                      data?.totals.drafts === 1 ? 'post' : 'posts'
                    } and ${data?.totals.protectedAssets ?? 0} ${
                      data?.totals.protectedAssets === 1 ? 'protected asset' : 'protected assets'
                    }.`}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Scheduled"
                value={data?.totals.scheduled ?? 0}
                caption="in your calendar"
                Icon={CalendarClock}
              />
              <StatCard
                label="Published"
                value={data?.totals.published ?? 0}
                caption="all time"
                Icon={CheckCircle2}
              />
              <StatCard
                label="Protected assets"
                value={data?.totals.protectedAssets ?? 0}
                caption="fingerprints stored"
                Icon={ShieldCheck}
              />
              <StatCard
                label="Connected channels"
                value={data?.totals.connectedChannels ?? 0}
                caption="of 4 platforms"
                Icon={Link2}
              />
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Activity, last 7 days</h3>
                  <p className="text-xs text-slate-400">Recorded from what you do in Creator Mind.</p>
                </div>
                <select
                  aria-label="Chart metric"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value as SeriesMetric)}
                  className="rounded-lg border border-slate-200 bg-surface-light px-3 py-1 text-xs font-medium text-slate-600 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {METRIC_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <ChartSkeleton />
              ) : (
                <div className="relative h-[240px] w-full pt-4">
                  <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4461ee" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4461ee" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="0" x2="500" y1="150" y2="150" />
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="100" y2="100" />
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="50" y2="50" />
                    <path d={`${buildSeriesPath(series)} L500 150 L0 150 Z`} fill="url(#chartGradient)" stroke="none" />
                    <path
                      d={buildSeriesPath(series)}
                      fill="none"
                      stroke="#4461ee"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              )}

              <div className="flex justify-between px-2 text-xs font-medium text-slate-400">
                {(data?.dates ?? []).map((date) => (
                  <span key={date}>
                    {new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  7-day total:{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{total.toLocaleString()}</span>
                </span>
                <Link href="/analytics" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  <BarChart3 className="w-3 h-3" />
                  Full report
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold">Recent activity</h3>

              {loading ? (
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
              ) : data && data.events.length > 0 ? (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-surface-light shadow-soft ring-1 ring-slate-900/5 dark:divide-slate-800 dark:bg-surface-dark dark:ring-white/10">
                  {data.events.slice(0, 6).map((event) => {
                    const { label, Icon } = EVENT_COPY[event.type];

                    return (
                      <li key={event.id} className="flex items-center gap-3 p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {event.platform ? `${event.platform} • ` : ''}
                            {formatRelative(event.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <Inbox className="w-5 h-5" />
                  Nothing recorded yet. Schedule a post or protect a file and it will show up here.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="w-full border-l border-slate-200 bg-surface-light/50 p-6 dark:border-slate-800 dark:bg-surface-dark/50 xl:w-96">
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/studio"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-primary p-4 text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
                >
                  <SquarePlus className="w-6 h-6" />
                  <span className="text-sm font-semibold">Create Post</span>
                </Link>
                <Link
                  href="/chatbot"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-light p-4 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-transform hover:bg-slate-50 active:scale-95 dark:bg-surface-dark dark:text-white dark:ring-white/10 dark:hover:bg-slate-800"
                >
                  <Bot className="w-6 h-6" />
                  <span className="text-sm font-semibold">Ask AI</span>
                </Link>
                <Link
                  href="/analytics"
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-surface-light p-3 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-transform hover:bg-slate-50 active:scale-95 dark:bg-surface-dark dark:text-white dark:ring-white/10 dark:hover:bg-slate-800"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-semibold">View Full Analytics Report</span>
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Up next</h3>
                <Link href="/studio" className="text-xs font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              ) : data && data.upcoming.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {data.upcoming.map((draft) => {
                    const { weekday, day } = formatDraftDate(draft.scheduledFor);

                    return (
                      <Link
                        key={draft.id}
                        href="/studio"
                        className="flex items-center gap-3 rounded-xl bg-surface-light p-3 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md dark:bg-surface-dark dark:ring-white/10"
                      >
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="text-xs font-bold uppercase">{weekday}</span>
                          <span className="text-sm font-bold">{day}</span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <p className="truncate font-semibold">{draft.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDraftTime(draft.scheduledFor)} • {draft.platform}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Nothing scheduled yet.{' '}
                  <Link href="/studio" className="font-semibold text-primary hover:underline">
                    Schedule a post
                  </Link>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold">Next steps</h3>
              <div className="flex flex-col gap-3">
                {nextSteps.slice(0, 3).map((step) => (
                  <Link
                    key={step.cta}
                    href={step.href}
                    className="relative overflow-hidden rounded-xl border border-secondary/20 bg-secondary/5 p-4 transition-colors hover:bg-secondary/10 dark:bg-secondary/10"
                  >
                    <div className="absolute -right-2 -top-2 text-secondary/10">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <div className="relative flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="text-sm font-bold">{step.cta}</p>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{step.text}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-xs text-slate-600 dark:text-slate-300">
              <CalendarClock className="w-4 h-4 text-primary" />
              {data && data.upcoming.length > 0 ? (
                <span>
                  Next post: <strong>{data.upcoming[0].title}</strong> on {formatDateTime(data.upcoming[0].scheduledFor)}
                </span>
              ) : (
                <span>No posts scheduled this week.</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Stored in your own database, one row per user.</span>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
