import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError, unauthorized } from '../../../lib/server/api';
import { requireUser } from '../../../lib/server/auth';
import { createDraft, listDrafts, loadProfile } from '../../../lib/server/store';
import { PLATFORMS, type DraftInput } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    return json({ drafts: listDrafts(user.uid) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const input = await readJson<DraftInput>(request);
    if (!input) return badRequest('Expected a JSON body.');

    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (title.length === 0) return badRequest('Give the post a title.');
    if (title.length > 200) return badRequest('Titles are limited to 200 characters.');

    if (input.platform && !PLATFORMS.includes(input.platform)) {
      return badRequest('Unknown platform.');
    }

    if (input.status === 'scheduled' && !input.scheduledFor) {
      return badRequest('A scheduled post needs a date and time.');
    }

    loadProfile(user.uid, user.email);

    return json({ draft: createDraft(user.uid, input) }, 201);
  } catch (error) {
    return serverError(error);
  }
}
