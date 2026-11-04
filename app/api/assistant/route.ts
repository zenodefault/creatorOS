import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError, unauthorized } from '../../../lib/server/api';
import { requireUser } from '../../../lib/server/auth';
import { AssistantUnavailableError, generateAssistantReply } from '../../../lib/server/assistant';
import {
  addMessage,
  getAnalytics,
  listDrafts,
  listFingerprints,
  listMessages,
  loadProfile,
  recordEvent,
} from '../../../lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    loadProfile(user.uid, user.email);

    return json({ messages: listMessages(user.uid) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) return unauthorized();

    const body = await readJson<{ message?: string }>(request);
    if (!body) return badRequest('Expected a JSON body.');

    const question = typeof body.message === 'string' ? body.message.trim() : '';
    if (question.length === 0) return badRequest('Ask a question first.');
    if (question.length > 1000) return badRequest('Questions are limited to 1000 characters.');

    const profile = loadProfile(user.uid, user.email);
    const messages = listMessages(user.uid);
    const summary = getAnalytics(user.uid, 30);

    const reply = await generateAssistantReply({
      profile,
      summary,
      drafts: listDrafts(user.uid),
      fingerprints: listFingerprints(user.uid),
      messages: [...messages, { id: 0, role: 'user', content: question, createdAt: new Date().toISOString() }],
    });

    const userMessage = addMessage(user.uid, 'user', question);
    const assistantMessage = addMessage(user.uid, 'assistant', reply);
    recordEvent(user.uid, 'assistant_message', null);

    return json({ userMessage, assistantMessage });
  } catch (error) {
    if (error instanceof AssistantUnavailableError) {
      return Response.json(
        { error: error.message },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return serverError(error);
  }
}
