import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError, unauthorized } from '../../../lib/server/api';
import { requireUser } from '../../../lib/server/auth';
import { MediaError, saveDraftMedia } from '../../../lib/server/media';
import { attachDraftMedia, createDraft, deleteDraft, listDrafts, loadProfile } from '../../../lib/server/store';
import { PLATFORMS, type DraftInput, type DraftStatus } from '../../../lib/types';

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

type ParsedDraft = { input: DraftInput; media: File | null };

async function parseDraft(request: NextRequest): Promise<ParsedDraft | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    const input = await readJson<DraftInput>(request);
    return input ? { input, media: null } : null;
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
    input: {
      title: field('title') ?? '',
      body: field('body') ?? '',
      platform: platform ? (platform as DraftInput['platform']) : undefined,
      status: status ? (status as DraftStatus) : undefined,
      scheduledFor,
    },
    media: file instanceof File && file.size > 0 ? file : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const parsed = await parseDraft(request);
    if (!parsed) return badRequest('Expected a JSON body.');

    const { input, media } = parsed;
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (title.length === 0) return badRequest('Give the post a title.');
    if (title.length > 200) return badRequest('Titles are limited to 200 characters.');

    if (input.platform && !PLATFORMS.includes(input.platform)) {
      return badRequest('Unknown platform.');
    }

    if (input.status === 'scheduled' && !input.scheduledFor) {
      return badRequest('A scheduled post needs a date and time.');
    }

    if (media && input.platform !== 'Bluesky') {
      return badRequest('Media attachments are only supported for Bluesky posts.');
    }

    loadProfile(user.uid, user.email);

    const draft = createDraft(user.uid, { ...input, title });
    if (!media) return json({ draft }, 201);

    try {
      const stored = await saveDraftMedia(user.uid, draft.id, media);
      return json({ draft: attachDraftMedia(user.uid, draft.id, stored) ?? draft }, 201);
    } catch (error) {
      deleteDraft(user.uid, draft.id);
      if (error instanceof MediaError) return badRequest(error.message);
      throw error;
    }
  } catch (error) {
    return serverError(error);
  }
}
