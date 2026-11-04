import type { NextRequest } from 'next/server';

import { badRequest, json, notFound, readJson, serverError, unauthorized } from '../../../../lib/server/api';
import { requireUser } from '../../../../lib/server/auth';
import { BlueskyUnavailableError, publishToBluesky } from '../../../../lib/server/bluesky';
import { MediaError, readStoredMedia, removeStoredMedia, saveDraftMedia } from '../../../../lib/server/media';
import {
  attachDraftMedia,
  deleteDraft,
  getDraft,
  getDraftMedia,
  updateDraft,
} from '../../../../lib/server/store';
import { PLATFORMS, type DraftInput, type DraftStatus } from '../../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ParsedPatch = { patch: DraftInput; media: File | null };

async function parsePatch(request: NextRequest): Promise<ParsedPatch | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    const patch = await readJson<DraftInput>(request);
    return patch ? { patch, media: null } : null;
  }

  const form = await request.formData();
  const file = form.get('media');
  const field = (name: string): string | null => {
    const value = form.get(name);
    return typeof value === 'string' && value.length > 0 ? value : null;
  };

  const platform = field('platform');
  const status = field('status');
  const scheduledFor = field('scheduledFor');

  return {
    patch: {
      title: field('title') ?? undefined,
      body: field('body') ?? undefined,
      platform: platform ? (platform as DraftInput['platform']) : undefined,
      status: status ? (status as DraftStatus) : undefined,
      scheduledFor: scheduledFor ?? undefined,
    },
    media: file instanceof File && file.size > 0 ? file : null,
  };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const parsed = await parsePatch(request);
    if (!parsed) return badRequest('Expected a JSON body.');

    const { patch, media } = parsed;

    if (patch.platform && !PLATFORMS.includes(patch.platform)) {
      return badRequest('Unknown platform.');
    }

    if (patch.status === 'scheduled' && !patch.scheduledFor) {
      return badRequest('A scheduled post needs a date and time.');
    }

    const existing = getDraft(user.uid, params.id);
    if (!existing) return notFound('That post no longer exists.');

    if (media && existing.platform !== 'Bluesky') {
      return badRequest('Media attachments are only supported for Bluesky posts.');
    }

    if (media) {
      try {
        const stored = await saveDraftMedia(user.uid, params.id, media);
        attachDraftMedia(user.uid, params.id, stored);
      } catch (error) {
        if (error instanceof MediaError) return badRequest(error.message);
        throw error;
      }
    }

    const publishingToBluesky =
      patch.status === 'published' && existing.platform === 'Bluesky' && existing.status !== 'published';

    if (publishingToBluesky) {
      const stored = getDraftMedia(user.uid, params.id);

      if (stored) {
        const bytes = readStoredMedia(stored.path);
        await publishToBluesky(
          existing.title,
          existing.body,
          bytes ? { bytes, mimeType: stored.type, filename: stored.name } : null,
        );
      } else {
        await publishToBluesky(existing.title, existing.body);
      }
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

    const stored = getDraftMedia(user.uid, params.id);
    const deleted = deleteDraft(user.uid, params.id);
    if (!deleted) return notFound('That post no longer exists.');

    removeStoredMedia(stored?.path ?? null);
    return json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
