import type { NextRequest } from 'next/server'

import { badRequest, json, notFound, readJson, serverError, unauthorized } from '../../../../lib/server/api'
import { requireUser } from '../../../../lib/server/auth'
import { BlueskyUnavailableError, publishToBluesky } from '../../../../lib/server/bluesky'
import { deleteDraft, getDraft, updateDraft } from '../../../../lib/server/store'
import { PLATFORMS, type Draft, type Platform, type DraftInput } from '../../../../lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request)
    if (!user) return unauthorized()

    // Support both JSON and multipart form data (for media uploads)
    const contentType = request.headers.get('content-type') || ''
    let patch: DraftInput

    if (contentType.includes('multipart/form-data')) {
      // Read form data for media upload
      const formData = await request.formData()
      const title = formData.get('title') as string | null
      const body = formData.get('body') as string | null
      const platform = formData.get('platform') as string | null
      const status = formData.get('status') as Draft['status'] | null
      const scheduledFor = formData.get('scheduledFor') as string | null
      const mediaFile = formData.get('media') as File | null

      if (!title || !body || !platform) {
        return badRequest('Missing required fields: title, body, platform')
      }

      const platformKey = platform as Platform | null
      if (!platformKey || !PLATFORMS.includes(platformKey)) {
        return badRequest('Unknown platform.')
      }

      if (status === 'scheduled' && !scheduledFor) {
        return badRequest('A scheduled post needs a date and time.')
      }

      const existing = getDraft(user.uid, params.id)
      if (!existing) return notFound('That post no longer exists.')

      // If publishing to Bluesky with media, publish immediately
      if (platformKey === 'Bluesky' && status === 'published') {
        if (mediaFile) {
          await publishToBluesky(title, body, mediaFile)
        } else {
          await publishToBluesky(title, body)
        }
      }

      const draft = updateDraft(user.uid, params.id, {
        title,
        body,
        platform: platformKey,
        status: status ?? existing.status,
        scheduledFor: status === 'scheduled' ? scheduledFor : undefined,
      })
      return json({ draft })
    } else {
      // Original JSON handling
      patch = await readJson<DraftInput>(request)
      if (!patch) return badRequest('Expected a JSON body.')

      if (patch.platform && !PLATFORMS.includes(patch.platform)) {
        return badRequest('Unknown platform.')
      }

      if (patch.status === 'scheduled' && !patch.scheduledFor) {
        return badRequest('A scheduled post needs a date and time.')
      }

      const existing = getDraft(user.uid, params.id)
      if (!existing) return notFound('That post no longer exists.')

      if (patch.status === 'published' && existing.platform === 'Bluesky' && existing.status !== 'published') {
        await publishToBluesky(existing.title, existing.body)
      }

      const draft = updateDraft(user.uid, params.id, patch!)
      return json({ draft })
    }
  } catch (error) {
    if (error instanceof BlueskyUnavailableError) {
      return Response.json(
        { error: error.message },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return serverError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(request)
    if (!user) return unauthorized()

    const deleted = deleteDraft(user.uid, params.id)
    if (!deleted) return notFound('That post no longer exists.')

    return json({ ok: true })
  } catch (error) {
    return serverError(error)
  }
}