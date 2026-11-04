import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError, unauthorized } from '../../../lib/server/api';
import { requireUser } from '../../../lib/server/auth';
import { loadProfile, saveProfile } from '../../../lib/server/store';
import type { ProfilePatch } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    return json(loadProfile(user.uid, user.email));
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const patch = await readJson<ProfilePatch>(request);
    if (!patch) return badRequest('Expected a JSON body.');

    if (typeof patch.displayName === 'string' && patch.displayName.trim().length === 0) {
      return badRequest('Display name cannot be empty.');
    }

    return json(saveProfile(user.uid, user.email, patch));
  } catch (error) {
    return serverError(error);
  }
}
