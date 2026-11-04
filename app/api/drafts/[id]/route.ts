import type { NextRequest } from 'next/server';

import { badRequest, json, notFound, readJson, serverError, unauthorized } from '../../../../lib/server/api';
import { requireUser } from '../../../../lib/server/auth';
import { BlueskyUnavailableError, publishToBluesky } from '../../../../lib/server/bluesky';
import { deleteDraft, getDraft, updateDraft } from '../../../../lib/server/store';
import { PLATFORMS, type DraftInput } from '../../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const patch = await readJson<DraftInput>(request);
    if (!patch) return badRequest('Expected a JSON body.');

    if (patch.platform && !PLATFORMS.includes(patch.platform)) {
      return badRequest('Unknown platform.');
    }

    if (patch.status === 'scheduled' && !patch.scheduledFor) {
      return badRequest('A scheduled post needs a date and time.');
    }

    const existing = getDraft(user.uid, params.id);
    if (!existing) return notFound('That post no longer exists.');

    if (patch.status === 'published' && existing.platform === 'Bluesky' && existing.status !== 'published') {
      await publishToBluesky(existing.title, existing.body);
    }

    const draft = updateDraft(user.uid, params.id, patch)!;
    return json({ draft });
  } catch (error) {
    if (error instanceof BlueskyUnavailableError) {
      return Response.json(
        { error: error.message },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return serverError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const deleted = deleteDraft(user.uid, params.id);
    if (!deleted) return notFound('That post no longer exists.');

    return json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
