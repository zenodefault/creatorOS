import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { PLATFORMS } from '../types';

/**
 * A single SQLite database, owned by the server. Node 26 ships `node:sqlite`,
 * so there is no native dependency to build and nothing to provision.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  uid           TEXT PRIMARY KEY,
  email         TEXT,
  display_name  TEXT NOT NULL DEFAULT '',
  niche         TEXT NOT NULL DEFAULT 'Technology & Coding',
  bio           TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  uid                 TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  weekly_digest       INTEGER NOT NULL DEFAULT 1,
  public_profile      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS channels (
  uid      TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  connected INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (uid, platform)
);

CREATE TABLE IF NOT EXISTS drafts (
  id            TEXT PRIMARY KEY,
  uid           TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  platform      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TEXT,
  published_at  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS drafts_uid_created ON drafts (uid, created_at DESC);

CREATE TABLE IF NOT EXISTS fingerprints (
  id         TEXT PRIMARY KEY,
  uid        TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  filename   TEXT NOT NULL,
  sha256     TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (uid, sha256)
);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  uid        TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  platform   TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS events_uid_created ON events (uid, created_at DESC);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  uid        TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS assistant_uid_created ON assistant_messages (uid, created_at);

CREATE TABLE IF NOT EXISTS email_codes (
  email       TEXT PRIMARY KEY,
  code_hash   TEXT NOT NULL,
  expires_at  INTEGER NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
`;

const globalForDb = globalThis as unknown as { __creatorOsDb?: DatabaseSync };

export function databaseFile(): string {
  const configured = process.env.CREATOROS_DB_PATH;
  if (configured) return path.resolve(configured);

  return path.join(process.cwd(), '.data', 'creatoros.db');
}

export function getDb(): DatabaseSync {
  if (globalForDb.__creatorOsDb) return globalForDb.__creatorOsDb;

  const file = databaseFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  globalForDb.__creatorOsDb = db;
  return db;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Every authenticated request funnels through here, so a user row (and its
 * default settings/channel rows) exists before any feature reads from it.
 */
export function ensureUser(uid: string, email: string | null): void {
  const db = getDb();
  const timestamp = nowIso();

  db.prepare(
    `INSERT INTO users (uid, email, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET
       email = COALESCE(excluded.email, users.email),
       updated_at = users.updated_at`,
  ).run(uid, email, timestamp, timestamp);

  db.prepare('INSERT OR IGNORE INTO settings (uid) VALUES (?)').run(uid);

  const insertChannel = db.prepare('INSERT OR IGNORE INTO channels (uid, platform) VALUES (?, ?)');
  for (const platform of PLATFORMS) {
    insertChannel.run(uid, platform);
  }
}
