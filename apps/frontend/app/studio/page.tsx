'use client';

import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Inbox,
  Loader2,
  Send,
  SquarePlus,
  Trash2,
  Undo2,
} from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { ApiError, apiSend } from '../../lib/api-client';
import { formatDraftTime, toScheduledFor, splitScheduledFor } from '../../lib/format';
import { DRAFT_STATUS_LABEL, PLATFORMS, type Draft, type Platform } from '../../lib/types';

const STATUS_STYLES: Record<Draft['status'], string> = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  scheduled: 'bg-primary/10 text-primary',
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export default function StudioPage() {
  const { data, error, loading, reload } = useApiData<{ drafts: Draft[] }>('/api/drafts');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState<Platform>('YouTube');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [schedule, setSchedule] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const drafts = data?.drafts ?? [];

  const resetForm = () => {
    setTitle('');
    setBody('');
    setPlatform('YouTube');
    setDate('');
    setTime('10:00');
    setSchedule(false);
  };

  const createDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length === 0) {
      setFormError('Give the post a title.');
      return;
    }

    const scheduledFor = schedule ? toScheduledFor(date, time) : null;
    if (schedule && !scheduledFor) {
      setFormError('Pick a date to schedule this post.');
      return;
    }

    setBusy(true);
    try {
      await apiSend<{ draft: Draft }>('/api/drafts', 'POST', {
        title,
        body,
        platform,
        status: schedule ? 'scheduled' : 'draft',
        scheduledFor,
      });
      resetForm();
      setNotice(schedule ? 'Post scheduled.' : 'Draft saved.');
      reload();
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Could not save the post.');
    } finally {
      setBusy(false);
    }
  };

  const mutate = async (
    draft: Draft,
    patch: { status?: Draft['status']; scheduledFor?: string | null },
    message: string,
  ) => {
    setFormError(null);
    setBusy(true);

    try {
      await apiSend<{ draft: Draft }>(`/api/drafts/${draft.id}`, 'PATCH', patch);
      setNotice(message);
      reload();
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Could not update the post.');
    } finally {
      setBusy(false);
    }
  };

  const publishNow = (draft: Draft) => mutate(draft, { status: 'published' }, `“${draft.title}” marked as published.`);

  const scheduleDraft = (draft: Draft) => {
    const local = splitScheduledFor(draft.scheduledFor);
    const scheduledFor = local.date && local.time ? draft.scheduledFor : toScheduledFor(date, time);

    if (!scheduledFor) {
      setFormError('Set a date in the form first, then schedule this draft.');
      return;
    }

    void mutate(draft, { status: 'scheduled', scheduledFor }, `“${draft.title}” scheduled.`);
  };

  const remove = async (draft: Draft) => {
    setBusy(true);
    setFormError(null);

    try {
      await apiSend<{ ok: boolean }>(`/api/drafts/${draft.id}`, 'DELETE');
      setNotice(`“${draft.title}” deleted.`);
      reload();
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : 'Could not delete the post.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <AppShell active="studio">
      <div className="p-6 xl:p-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Studio</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Draft, schedule and publish. Each post is a row in your database, not a browser cache.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
              {notice}
            </div>
          )}

          <form
            onSubmit={createDraft}
            className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10"
          >
            <div className="flex items-center gap-2">
              <SquarePlus className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">New post</h3>
            </div>

            <input
              aria-label="Post title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Post title"
              className={inputClass}
            />

            <textarea
              aria-label="Post notes"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Notes, hook, script…"
              rows={3}
              className={inputClass}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Platform
                <select
                  aria-label="Platform"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as Platform)}
                  className={inputClass}
                >
                  {PLATFORMS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Date
                <input
                  aria-label="Schedule date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Time
                <input
                  aria-label="Schedule time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(event) => setSchedule(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              Schedule this post
            </label>

            {formError && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <SquarePlus className="w-4 h-4" />}
              {schedule ? 'Schedule post' : 'Save draft'}
            </button>
          </form>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Your posts ({drafts.length})</h3>

            {loading ? (
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            ) : drafts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <Inbox className="w-5 h-5" />
                No posts yet. Your first one will appear here.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="flex flex-col gap-3 rounded-2xl bg-surface-light p-4 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[draft.status]}`}>
                          {DRAFT_STATUS_LABEL[draft.status]}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{draft.platform}</span>
                        {draft.scheduledFor && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarClock className="w-3 h-3" />
                            {formatDraftTime(draft.scheduledFor)}
                          </span>
                        )}
                      </div>
                      <p className="truncate font-semibold">{draft.title}</p>
                      {draft.body && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{draft.body}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {draft.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => publishNow(draft)}
                          disabled={busy}
                          aria-label={`Publish ${draft.title}`}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-400"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish
                        </button>
                      )}

                      {draft.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => scheduleDraft(draft)}
                          disabled={busy}
                          aria-label={`Schedule ${draft.title}`}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          Schedule
                        </button>
                      )}

                      {draft.status !== 'draft' && (
                        <button
                          type="button"
                          onClick={() => mutate(draft, { status: 'draft' }, `“${draft.title}” moved back to drafts.`)}
                          disabled={busy}
                          aria-label={`Move ${draft.title} to drafts`}
                          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          Draft
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => remove(draft)}
                        disabled={busy}
                        aria-label={`Delete ${draft.title}`}
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-60 dark:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-3 h-3" />
            Publishing and scheduling record activity that feeds your dashboard.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
