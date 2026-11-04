import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError, unauthorized } from '../../../lib/server/api';
import { requireUser } from '../../../lib/server/auth';
import { listFingerprints, loadProfile, registerFingerprint } from '../../../lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    return json({ fingerprints: listFingerprints(user.uid) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const body = await readJson<{ filename?: string; sha256?: string; sizeBytes?: number }>(request);
    if (!body) return badRequest('Expected a JSON body.');

    const hash = typeof body.sha256 === 'string' ? body.sha256.toLowerCase() : '';
    if (!SHA256_PATTERN.test(hash)) return badRequest('Expected a SHA-256 hex digest.');

    loadProfile(user.uid, user.email);

    const { fingerprint, duplicate } = registerFingerprint(user.uid, {
      filename: body.filename,
      sha256: hash,
      sizeBytes: body.sizeBytes,
    });

    if (duplicate) {
      return json(
        {
          duplicate: true,
          fingerprint,
          message: 'This exact file is already in your ownership ledger.',
        },
        409,
      );
    }

    return json({ duplicate: false, fingerprint }, 201);
  } catch (error) {
    return serverError(error);
  }
}
