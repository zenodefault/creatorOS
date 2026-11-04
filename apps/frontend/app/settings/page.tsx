'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { ApiError, apiSend } from '../../lib/api-client';
import { NICHE_OPTIONS } from '../../lib/niches';
import { PLATFORMS, type Profile, type ProfileSettings } from '../../lib/types';

const NICHES = NICHE_OPTIONS;

const TOGGLES: { key: keyof ProfileSettings; label: string; caption: string }[] = [
  { key: 'emailNotifications', label: 'Email notifications', caption: 'Publish and schedule confirmations.' },
  { key: 'weeklyDigest', label: 'Weekly digest', caption: 'A summary of your week every Monday.' },
  { key: 'publicProfile', label: 'Public profile', caption: 'Let others see your creator page.' },
];

export default function SettingsPage() {
  const { data, error, loading, reload } = useApiData<Profile>('/api/profile');

  const [displayName, setDisplayName] = useState('');
  const [niche, setNiche] = useState(NICHES[0]);
  const [bio, setBio] = useState('');
  const [settings, setSettings] = useState<ProfileSettings>({
    emailNotifications: true,
    weeklyDigest: true,
    publicProfile: false,
  });
  const [channels, setChannels] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;

    setDisplayName(data.displayName || data.email?.split('@')[0] || '');
    setNiche(data.niche || NICHES[0]);
    setBio(data.bio);
    setSettings(data.settings);
    setChannels(data.channels);
  }, [data]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setFailure(null);
    setSaved(false);

    if (displayName.trim().length === 0) {
      setFailure('Display name cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      await apiSend<Profile>('/api/profile', 'PATCH', {
        displayName,
        niche,
        bio,
        settings,
        channels,
      });
      setSaved(true);
      window.dispatchEvent(new Event('creatoros:profile-updated'));
      reload();
    } catch (cause) {
      setFailure(cause instanceof ApiError ? cause.message : 'Could not save your settings.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <AppShell active="settings">
      <div className="p-6 xl:p-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Stored server-side against your account, so it follows you across devices.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={save} className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
                  {(displayName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">Profile photo</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Generated from your display name initial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Display name
                  <input
                    aria-label="Display name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder={loading ? 'Loading…' : 'Your name'}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Email address
                  <input
                    aria-label="Email address"
                    value={data?.email ?? ''}
                    readOnly
                    placeholder={loading ? 'Loading…' : 'No email on file'}
                    className={`${inputClass} bg-slate-50 text-slate-500 dark:bg-slate-800`}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Content niche
                <select
                  aria-label="Content niche"
                  value={niche}
                  onChange={(event) => setNiche(event.target.value)}
                  className={inputClass}
                >
                  {(NICHES.includes(niche) ? NICHES : [niche, ...NICHES]).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Bio
                <textarea
                  aria-label="Bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  placeholder="Tell us a little about yourself…"
                  className={inputClass}
                />
              </label>

              {failure && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {failure}
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold">Connected platforms</h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {PLATFORMS.filter((platform) => channels[platform]).length} active
                </span>
              </div>

              {PLATFORMS.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center justify-between border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold">{platform}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {channels[platform] ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(channels[platform])}
                    aria-label={`Toggle ${platform} connection`}
                    onClick={() => setChannels((current) => ({ ...current, [platform]: !current[platform] }))}
                    className={
                      channels[platform]
                        ? 'relative h-6 w-11 rounded-full bg-primary transition-colors'
                        : 'relative h-6 w-11 rounded-full bg-slate-300 transition-colors dark:bg-slate-600'
                    }
                  >
                    <span
                      className={
                        channels[platform]
                          ? 'absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all'
                          : 'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all'
                      }
                    />
                  </button>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
              <h3 className="mb-2 text-lg font-bold">Notifications</h3>

              {TOGGLES.map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between border-t border-slate-100 py-3 first:border-t-0 dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold">{toggle.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{toggle.caption}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[toggle.key]}
                    aria-label={`Toggle ${toggle.label}`}
                    onClick={() => setSettings((current) => ({ ...current, [toggle.key]: !current[toggle.key] }))}
                    className={
                      settings[toggle.key]
                        ? 'relative h-6 w-11 rounded-full bg-primary transition-colors'
                        : 'relative h-6 w-11 rounded-full bg-slate-300 transition-colors dark:bg-slate-600'
                    }
                  >
                    <span
                      className={
                        settings[toggle.key]
                          ? 'absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all'
                          : 'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all'
                      }
                    />
                  </button>
                </div>
              ))}
            </section>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
