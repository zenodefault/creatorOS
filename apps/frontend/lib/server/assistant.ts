import type {
  AnalyticsSummary,
  AssistantMessage,
  Draft,
  Fingerprint,
  Profile,
} from '../types';

type AssistantContext = {
  profile: Profile;
  summary: AnalyticsSummary;
  drafts: Draft[];
  fingerprints: Fingerprint[];
  messages: AssistantMessage[];
};

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: unknown };
};

export class AssistantUnavailableError extends Error {}

function workspaceContext({ profile, summary, drafts, fingerprints }: AssistantContext): string {
  const connectedPlatforms = Object.entries(profile.channels)
    .filter(([, connected]) => connected)
    .map(([platform]) => platform);

  const recentDrafts = drafts.slice(0, 12).map((draft) => ({
    title: draft.title,
    platform: draft.platform,
    status: draft.status,
    scheduledFor: draft.scheduledFor,
    publishedAt: draft.publishedAt,
  }));

  const recentFingerprints = fingerprints.slice(0, 6).map((fingerprint) => ({
    filename: fingerprint.filename,
    createdAt: fingerprint.createdAt,
  }));

  return JSON.stringify({
    creator: {
      displayName: profile.displayName || null,
      niche: profile.niche,
      bio: profile.bio || null,
      connectedPlatforms,
    },
    workspaceTotals: summary.totals,
    scheduledPosts: summary.upcoming.map((draft) => ({
      title: draft.title,
      platform: draft.platform,
      scheduledFor: draft.scheduledFor,
    })),
    recentPosts: recentDrafts,
    protectedAssets: recentFingerprints,
  });
}

function systemPrompt(context: AssistantContext): string {
  return `You are Creator Mind's helpful AI assistant for a creator workspace.
Answer the creator's questions directly, use concise practical advice, and format lists with Markdown bullets when useful.

You have the following private workspace snapshot. Treat it as factual context, but do not reveal it unless relevant to the creator's request. Do not claim that social accounts are actually OAuth-connected or that posts were sent to an external platform: their connection flags and publishing state are only records inside Creator Mind. Do not imply that file fingerprints prove legal ownership; they are SHA-256 entries in the creator's private ledger.

Workspace snapshot:
${workspaceContext(context)}`;
}

function historyMessages(messages: AssistantMessage[]): OpenRouterMessage[] {
  return messages.slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

/** Calls OpenRouter from the server, so the API key never reaches the browser. */
export async function generateAssistantReply(context: AssistantContext): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    throw new AssistantUnavailableError(
      'AI is not configured. Add OPENROUTER_API_KEY and OPENROUTER_MODEL to .env.local, then restart the server.',
    );
  }

  let response: Response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Creator Mind',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt(context) }, ...historyMessages(context.messages)],
        temperature: 0.7,
        max_tokens: 800,
      }),
      cache: 'no-store',
    });
  } catch {
    throw new AssistantUnavailableError('Could not reach the AI provider. Check your connection and try again.');
  }

  const payload = (await response.json().catch(() => null)) as OpenRouterResponse | null;
  const providerMessage = typeof payload?.error?.message === 'string' ? payload.error.message : null;

  if (!response.ok) {
    console.error('[assistant] OpenRouter request failed:', response.status, providerMessage ?? 'unknown error');
    throw new AssistantUnavailableError(
      response.status === 401 || response.status === 403
        ? 'The OpenRouter API key was rejected. Check OPENROUTER_API_KEY and restart the server.'
        : response.status === 429
          ? 'The AI provider is temporarily rate-limited. Please try again shortly.'
          : 'The AI provider could not complete this request. Please try again.',
    );
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    console.error('[assistant] OpenRouter returned no message content');
    throw new AssistantUnavailableError('The AI provider returned an empty response. Please try again.');
  }

  return content.trim();
}
