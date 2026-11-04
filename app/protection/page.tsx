'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Copy, Fingerprint as FingerprintIcon, Inbox, Loader2, ShieldCheck, Upload } from 'lucide-react';

import { AppShell } from '../../components/AppShell';
import { useApiData } from '../../hooks/useApiData';
import { ApiError, apiSend } from '../../lib/api-client';
import { formatRelative } from '../../lib/format';
import type { Fingerprint } from '../../lib/types';

type HashedFile = { filename: string; sha256: string; sizeBytes: number };

async function hashFile(file: File): Promise<HashedFile> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return { filename: file.name, sha256, sizeBytes: file.size };
}

export default function ProtectionPage() {
  const { data, error, loading, reload } = useApiData<{ fingerprints: Fingerprint[] }>('/api/fingerprints');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hashed, setHashed] = useState<HashedFile | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ledger = data?.fingerprints ?? [];

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setFailure(null);
    setStatus(null);
    setBusy(true);

    try {
      setHashed(await hashFile(file));
    } catch {
      setFailure('Could not read that file. Try another one.');
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    if (!hashed) return;

    setFailure(null);
    setBusy(true);

    try {
      await apiSend<{ fingerprint: Fingerprint }>('/api/fingerprints', 'POST', hashed);
      setStatus('Fingerprint stored in your ownership ledger.');
      reload();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        setStatus('This exact file is already in your ledger.');
      } else {
        setFailure(cause instanceof ApiError ? cause.message : 'Could not store the fingerprint.');
      }
    } finally {
      setBusy(false);
    }
  };

  const checkLedger = () => {
    if (!hashed) return;

    const match = ledger.find((entry) => entry.sha256 === hashed.sha256);
    setFailure(null);
    setStatus(
      match
        ? `Found: registered as “${match.filename}” ${formatRelative(match.createdAt)}.`
        : 'Not in your ledger. Register it to claim ownership.',
    );
  };

  const copyHash = async () => {
    if (!hashed) return;

    try {
      const result = navigator.clipboard?.writeText(hashed.sha256);

      if (result && typeof result.then === 'function') {
        await Promise.race([result, new Promise((resolve) => setTimeout(resolve, 800))]);
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(hashed.sha256);
      }

      setStatus('Hash copied.');
    } catch {
      setStatus('Copy failed — select the hash and copy it manually.');
    }
  };

  return (
    <AppShell active="protection">
      <div className="p-6 xl:p-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Protection</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Files are hashed in your browser. Only the SHA-256 digest is stored — never the file itself.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-soft ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Fingerprint a file</h3>
            </div>

            <input
              ref={inputRef}
              type="file"
              aria-label="Choose a file to fingerprint"
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            />

            {busy && (
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Hashing…
              </p>
            )}

            {hashed && (
              <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{hashed.filename}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {(hashed.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <code className="break-all font-mono text-xs text-slate-600 dark:text-slate-300">{hashed.sha256}</code>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={register}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Register ownership
                  </button>
                  <button
                    type="button"
                    onClick={checkLedger}
                    disabled={busy}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <FingerprintIcon className="w-3.5 h-3.5" />
                    Check my ledger
                  </button>
                  <button
                    type="button"
                    onClick={copyHash}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy hash
                  </button>
                </div>
              </div>
            )}

            {status && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {status}
              </p>
            )}

            {failure && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {failure}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Ownership ledger ({ledger.length})</h3>

            {loading ? (
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            ) : ledger.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <Inbox className="w-5 h-5" />
                Nothing fingerprinted yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-surface-light shadow-soft ring-1 ring-slate-900/5 dark:divide-slate-800 dark:bg-surface-dark dark:ring-white/10">
                {ledger.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold">{entry.filename}</span>
                      <code className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                        {entry.sha256}
                      </code>
                    </div>
                    <span className="flex-shrink-0 text-xs text-slate-400">
                      {(entry.sizeBytes / 1024).toFixed(1)} KB • {formatRelative(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
