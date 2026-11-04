import fs from 'node:fs';
import path from 'node:path';

import { databaseFile } from './db';

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export class MediaError extends Error {}

export type StoredMedia = {
  path: string;
  name: string;
  type: string;
  sizeBytes: number;
};

/** Media lives beside the SQLite file so both stay inside the project's data directory. */
export function mediaRoot(): string {
  return path.join(path.dirname(databaseFile()), 'media');
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+/, '');
  return cleaned.slice(-80) || 'upload';
}

export async function saveDraftMedia(uid: string, draftId: string, file: File): Promise<StoredMedia> {
  const type = file.type || '';
  if (!type.startsWith('image/') && !type.startsWith('video/')) {
    throw new MediaError('Attach an image or a video file.');
  }

  if (file.size === 0) throw new MediaError('That file is empty.');
  if (file.size > MAX_MEDIA_BYTES) throw new MediaError('Media must be 50MB or smaller.');

  const target = path.join(mediaRoot(), uid, `${draftId}-${safeFilename(file.name)}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(await file.arrayBuffer()));

  return { path: target, name: file.name.slice(0, 120), type, sizeBytes: file.size };
}

export function readStoredMedia(filePath: string): Uint8Array | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return new Uint8Array(fs.readFileSync(filePath));
  } catch {
    return null;
  }
}

export function removeStoredMedia(filePath: string | null): void {
  if (!filePath) return;

  try {
    fs.rmSync(filePath, { force: true });
  } catch {
    // A leftover file is harmless; never fail the request over cleanup.
  }
}
