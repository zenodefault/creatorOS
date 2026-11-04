import type { NextRequest } from 'next/server'

import { json, serverError, unauthorized } from '../../../lib/server/api'
import { requireUser } from '../../../lib/server/auth'
import { getAnalytics, loadProfile } from '../../../lib/server/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_RANGES = [7, 30, 90]

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    if (!user) return unauthorized()

    const requested = Number(request.nextUrl.searchParams.get('days') ?? 30)
    const days = ALLOWED_RANGES.includes(requested) ? requested : 30
    const requestedPlatform = request.nextUrl.searchParams.get('platform') || 'all'

    loadProfile(user.uid, user.email)

    return json(getAnalytics(user.uid, days, requestedPlatform as 'all' | 'bluesky'))
  } catch (error) {
    return serverError(error)
  }
}