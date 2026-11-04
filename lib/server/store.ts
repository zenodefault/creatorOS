import { randomUUID } from 'node:crypto';

import { ensureUser, getDb, nowIso } from './db';
import {
  PLATFORMS,
  type ActivityEvent,
  type AnalyticsSummary,
  type AssistantMessage,
  type ChannelMap,
  type Draft,
  type DraftInput,
  type DraftStatus,
  type EventType,
  type Fingerprint,
  type Platform,
  type PlatformBreakdown,
  type Profile,
  type ProfilePatch,
  type SeriesMetric,
} from '../types';

type Row = Record<string, unknown>;

const DRAFT_STATUSES: DraftStatus[] = ['draft', 'scheduled', 'published'];
const EVENT_TYPES: EventType[] = [
  'post_scheduled',
  'post_published',
  'asset_protected',
  'assistant_message',
];

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function number(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function toPlatform(value: unknown): Platform {
  return PLATFORMS.includes(value as Platform) ? (value as Platform) : 'YouTube';
}

function toDraftStatus(value: unknown): DraftStatus {
  return DRAFT_STATUSES.includes(value as DraftStatus) ? (value as DraftStatus) : 'draft';
}

function toEventType(value: unknown): EventType {
  return EVENT_TYPES.includes(value as EventType) ? (value as EventType) : 'assistant_message';
}

function toDraft(row: Row): Draft {
  return {
    id: text(row.id),
    title: text(row.title),
    body: text(row.body),
    platform: toPlatform(row.platform),
    status: toDraftStatus(row.status),
    scheduledFor: nullableText(row.scheduled_for),
    publishedAt: nullableText(row.published_at),
    createdAt: text(row.created_at),
    updatedAt: text(row.updated_at),
  };
}

function toFingerprint(row: Row): Fingerprint {
  return {
    id: text(row.id),
    filename: text(row.filename),
    sha256: text(row.sha256),
    sizeBytes: number(row.size_bytes),
    createdAt: text(row.created_at),
  };
}

function toEvent(row: Row): ActivityEvent {
  return {
    id: number(row.id),
    type: toEventType(row.type),
    platform: row.platform ? toPlatform(row.platform) : null,
    createdAt: text(row.created_at),
  };
}

function toChannels(rows: Row[]): ChannelMap {
  const channels = Object.fromEntries(PLATFORMS.map((platform) => [platform, false])) as ChannelMap;
  for (const row of rows) {
    channels[toPlatform(row.platform)] = number(row.connected) === 1;
  }
  return channels;
}

export function loadProfile(uid: string, email: string | null): Profile {
  ensureUser(uid, email);
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid) as Row;
  const settings = db.prepare('SELECT * FROM settings WHERE uid = ?').get(uid) as Row;
  const channelRows = db.prepare('SELECT platform, connected FROM channels WHERE uid = ?').all(uid) as Row[];

  return {
    uid: text(user.uid),
    email: nullableText(user.email),
    displayName: text(user.display_name),
    niche: text(user.niche),
    bio: text(user.bio),
    createdAt: text(user.created_at),
    settings: {
      emailNotifications: number(settings?.email_notifications) === 1,
      weeklyDigest: number(settings?.weekly_digest) === 1,
      publicProfile: number(settings?.public_profile) === 1,
    },
    channels: toChannels(channelRows),
  };
}

export function saveProfile(uid: string, email: string | null, patch: ProfilePatch): Profile {
  loadProfile(uid, email);
  const db = getDb();
  const timestamp = nowIso();

  if (typeof patch.displayName === 'string') {
    db.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE uid = ?').run(
      patch.displayName.trim().slice(0, 80),
      timestamp,
      uid,
    );
  }

  if (typeof patch.niche === 'string') {
    db.prepare('UPDATE users SET niche = ?, updated_at = ? WHERE uid = ?').run(
      patch.niche.trim().slice(0, 80),
      timestamp,
      uid,
    );
  }

  if (typeof patch.bio === 'string') {
    db.prepare('UPDATE users SET bio = ?, updated_at = ? WHERE uid = ?').run(
      patch.bio.slice(0, 500),
      timestamp,
      uid,
    );
  }

  if (patch.settings) {
    const current = db.prepare('SELECT * FROM settings WHERE uid = ?').get(uid) as Row;
    const next = {
      emailNotifications: number(current?.email_notifications) === 1,
      weeklyDigest: number(current?.weekly_digest) === 1,
      publicProfile: number(current?.public_profile) === 1,
      ...patch.settings,
    };

    db.prepare(
      `UPDATE settings
       SET email_notifications = ?, weekly_digest = ?, public_profile = ?
       WHERE uid = ?`,
    ).run(
      next.emailNotifications ? 1 : 0,
      next.weeklyDigest ? 1 : 0,
      next.publicProfile ? 1 : 0,
      uid,
    );
  }

  if (patch.channels) {
    const update = db.prepare('UPDATE channels SET connected = ? WHERE uid = ? AND platform = ?');
    for (const platform of PLATFORMS) {
      const value = patch.channels[platform] ?? false;
      update.run(value ? 1 : 0, uid, platform);
    }
  }

  return loadProfile(uid, email);
}

export function recordEvent(uid: string, type: EventType, platform: Platform | null = null): void {
  getDb()
    .prepare('INSERT INTO events (uid, type, platform, created_at) VALUES (?, ?, ?, ?)')
    .run(uid, type, platform, nowIso());
}

export function listDrafts(uid: string): Draft[] {
  const rows = getDb()
    .prepare('SELECT * FROM drafts WHERE uid = ? ORDER BY created_at DESC')
    .all(uid) as Row[];

  return rows.map(toDraft);
}

export function getDraft(uid: string, id: string): Draft | null {
  const row = getDb().prepare('SELECT * FROM drafts WHERE uid = ? AND id = ?').get(uid, id) as
    | Row
    | undefined;

  return row ? toDraft(row) : null;
}

export function createDraft(uid: string, input: DraftInput): Draft {
  const db = getDb();
  const timestamp = nowIso();
  const id = randomUUID();
  const status = toDraftStatus(input.status ?? 'draft');
  const scheduledFor = nullableText(input.scheduledFor);

  db.prepare(
    `INSERT INTO drafts (id, uid, title, body, platform, status, scheduled_for, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    uid,
    text(input.title).trim().slice(0, 200),
    text(input.body).slice(0, 4000),
    toPlatform(input.platform),
    status,
    status === 'scheduled' ? scheduledFor : null,
    status === 'published' ? timestamp : null,
    timestamp,
    timestamp,
  );

  const draft = getDraft(uid, id)!;
  if (draft.status === 'scheduled') recordEvent(uid, 'post_scheduled', draft.platform);
  if (draft.status === 'published') recordEvent(uid, 'post_published', draft.platform);

  return draft;
}

export function updateDraft(uid: string, id: string, patch: DraftInput): Draft | null {
  const existing = getDraft(uid, id);
  if (!existing) return null;

  const db = getDb();
  const timestamp = nowIso();
  const status = patch.status ? toDraftStatus(patch.status) : existing.status;

  const next = {
    title: typeof patch.title === 'string' ? patch.title.trim().slice(0, 200) : existing.title,
    body: typeof patch.body === 'string' ? patch.body.slice(0, 4000) : existing.body,
    platform: patch.platform ? toPlatform(patch.platform) : existing.platform,
    status,
    scheduledFor:
      status === 'scheduled'
        ? patch.scheduledFor !== undefined
          ? nullableText(patch.scheduledFor)
          : existing.scheduledFor
        : null,
    publishedAt:
      status === 'published'
        ? existing.publishedAt ?? timestamp
        : status === 'scheduled'
          ? null
          : existing.publishedAt,
  };

  db.prepare(
    `UPDATE drafts
     SET title = ?, body = ?, platform = ?, status = ?, scheduled_for = ?, published_at = ?, updated_at = ?
     WHERE uid = ? AND id = ?`,
  ).run(
    next.title,
    next.body,
    next.platform,
    next.status,
    next.scheduledFor,
    next.publishedAt,
    timestamp,
    uid,
    id,
  );

  if (next.status !== existing.status) {
    if (next.status === 'scheduled') recordEvent(uid, 'post_scheduled', next.platform);
    if (next.status === 'published') recordEvent(uid, 'post_published', next.platform);
  }

  return getDraft(uid, id);
}

export function deleteDraft(uid: string, id: string): boolean {
  const result = getDb().prepare('DELETE FROM drafts WHERE uid = ? AND id = ?').run(uid, id);
  return number(result.changes) > 0;
}

export function listFingerprints(uid: string): Fingerprint[] {
  const rows = getDb()
    .prepare('SELECT * FROM fingerprints WHERE uid = ? ORDER BY created_at DESC')
    .all(uid) as Row[];

  return rows.map(toFingerprint);
}

export function registerFingerprint(
  uid: string,
  input: { filename?: string; sha256?: string; sizeBytes?: number },
): { fingerprint: Fingerprint | null; duplicate: boolean } {
  const db = getDb();
  const sha256 = text(input.sha256).toLowerCase();

  const existing = db
    .prepare('SELECT * FROM fingerprints WHERE uid = ? AND sha256 = ?')
    .get(uid, sha256) as Row | undefined;

  if (existing) return { fingerprint: toFingerprint(existing), duplicate: true };

  const id = randomUUID();
  db.prepare(
    `INSERT INTO fingerprints (id, uid, filename, sha256, size_bytes, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, uid, text(input.filename, 'untitled').slice(0, 200), sha256, Math.max(0, Math.round(number(input.sizeBytes))), nowIso());

  const row = db.prepare('SELECT * FROM fingerprints WHERE id = ?').get(id) as Row;
  recordEvent(uid, 'asset_protected', null);

  return { fingerprint: toFingerprint(row), duplicate: false };
}

export function findFingerprintByHash(uid: string, sha256: string): Fingerprint | null {
  const row = getDb()
    .prepare('SELECT * FROM fingerprints WHERE uid = ? AND sha256 = ?')
    .get(uid, sha256.toLowerCase()) as Row | undefined;

  return row ? toFingerprint(row) : null;
}

export function addMessage(uid: string, role: 'user' | 'assistant', content: string): AssistantMessage {
  const timestamp = nowIso();
  const result = getDb()
    .prepare('INSERT INTO assistant_messages (uid, role, content, created_at) VALUES (?, ?, ?, ?)')
    .run(uid, role, content, timestamp);

  return {
    id: Number(result.lastInsertRowid),
    role,
    content,
    createdAt: timestamp,
  };
}

function dayKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime());
    date.setDate(date.getDate() - offset);
    keys.push(date.toISOString().slice(0, 10));
  }

  return keys;
}

const SERIES_SOURCE: Record<SeriesMetric, EventType> = {
  published: 'post_published',
  scheduled: 'post_scheduled',
  protected: 'asset_protected',
};

export function getAnalytics(uid: string, days: number, platform?: 'all' | 'bluesky'): AnalyticsSummary {
  const db = getDb();
  const dates = dayKeys(days);
  const since = `${dates[0]}T00:00:00.000Z`;

  const eventWhere = platform === 'all' ? '' : `AND platform = '${platform}'`;
  const grouped = db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS day, type, COUNT(*) AS total\n       FROM events\n       WHERE uid = ? AND created_at >= ? ${eventWhere}\n       GROUP BY day, type`,
    )
    .all(uid, since) as Row[];

  const series: Record<SeriesMetric, number[]> = {
    published: Array(days).fill(0),
    scheduled: Array(days).fill(0),
    protected: Array(days).fill(0),
  };

  for (const row of grouped) {
    const index = dates.indexOf(text(row.day));
    if (index === -1) continue;

    const type = toEventType(row.type);
    for (const metric of Object.keys(SERIES_SOURCE) as SeriesMetric[]) {
      if (SERIES_SOURCE[metric] === type) series[metric][index] += number(row.total);
    }
  }

  const count = (sql: string, params: unknown[] = []): number => {
    const row = db.prepare(sql).get(...(params as never[])) as Row | undefined;
    return number(row?.total);
  };

  const draftTotals = db
    .prepare(
      `SELECT
         COUNT(*) AS drafts,
         SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
       FROM drafts WHERE uid = ?`,
    )
    .get(uid) as Row;

  const platformRows = db
    .prepare(
      `SELECT platform,
              COUNT(*) AS posts,
              SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
       FROM drafts WHERE uid = ? GROUP BY platform`,
    )
    .all(uid) as Row[];

  const channelRows = db.prepare('SELECT platform, connected FROM channels WHERE uid = ?').all(uid) as Row[];
  const channels = toChannels(channelRows);

  const platforms: PlatformBreakdown[] = PLATFORMS.map((platform) => {
    const row = platformRows.find((candidate) => candidate.platform === platform);

    return {
      platform,
      posts: number(row?.posts),
      published: number(row?.published),
      connected: channels[platform],
    };
  });

  const upcoming = (
    db
      .prepare(
        `SELECT * FROM drafts
         WHERE uid = ? AND status = 'scheduled' AND scheduled_for IS NOT NULL
         ORDER BY scheduled_for ASC LIMIT 5`,
      )
      .all(uid) as Row[]
  ).map(toDraft);

  const events = (
    db
      .prepare('SELECT * FROM events WHERE uid = ? ORDER BY created_at DESC, id DESC LIMIT 25')
      .all(uid) as Row[]
  ).map(toEvent);

  const totals = {
    drafts: number(draftTotals?.drafts),
    scheduled: number(draftTotals?.scheduled),
    published: number(draftTotals?.published),
    protectedAssets: count('SELECT COUNT(*) AS total FROM fingerprints WHERE uid = ?', [uid]),
    connectedChannels: PLATFORMS.filter((platform) => channels[platform]).length,
    assistantMessages: count(
      'SELECT COUNT(*) AS total FROM assistant_messages WHERE uid = ? AND role = ?',
      [uid, 'user'],
    ),
  };

  return {
    days,
    dates,
    series,
    totals,
    platforms,
    upcoming,
    events,
    isEmpty: totals.drafts === 0 && totals.protectedAssets === 0 && totals.assistantMessages === 0,
  };
}

export function listMessages(uid: string): AssistantMessage[] {
  const rows = getDb()
    .prepare('SELECT * FROM assistant_messages WHERE uid = ? ORDER BY created_at ASC, id ASC')
    .all(uid) as Row[];

  return rows.map((row) => ({
    id: number(row.id),
    role: row.role === 'user' ? 'user' : 'assistant',
    content: text(row.content),
    createdAt: text(row.created_at),
  }));
}