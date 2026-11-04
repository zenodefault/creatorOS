type BlueskySession = {
  accessJwt?: unknown;
  did?: unknown;
};

export class BlueskyUnavailableError extends Error {}

const DEFAULT_SERVICE = 'https://bsky.social';
const MAX_POST_LENGTH = 300;

function postText(title: string, body: string): string {
  const text = body.trim() || title.trim();
  if (Array.from(text).length > MAX_POST_LENGTH) {
    throw new BlueskyUnavailableError(`Bluesky posts are limited to ${MAX_POST_LENGTH} characters.`);
  }

  return text;
}

async function blueskyRequest(url: string, body: Record<string, unknown>, accessJwt?: string): Promise<Response> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessJwt ? { Authorization: `Bearer ${accessJwt}` } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new BlueskyUnavailableError('Could not reach Bluesky. Check your connection and try again.');
  }
}

/** Publishes one text post using a Bluesky handle and app password held only in server environment variables. */
export async function publishToBluesky(title: string, body: string): Promise<void> {
  const configuredHandle = process.env.BSKY_HANDLE;
  const identifier = configuredHandle?.replace(/^@/, '');
  const password = process.env.BSKY_APP_PASSWORD;
  const service = process.env.BSKY_SERVICE ?? DEFAULT_SERVICE;

  if (!identifier || !password) {
    throw new BlueskyUnavailableError(
      'Bluesky is not configured. Add BSKY_HANDLE and BSKY_APP_PASSWORD to .env.local, then restart the server.',
    );
  }

  let serviceUrl: URL;
  try {
    serviceUrl = new URL(service);
    if (serviceUrl.protocol !== 'https:') throw new Error('Bluesky service must use HTTPS.');
  } catch {
    throw new BlueskyUnavailableError('The configured Bluesky service URL is invalid.');
  }

  const sessionResponse = await blueskyRequest(
    new URL('/xrpc/com.atproto.server.createSession', serviceUrl).toString(),
    { identifier, password },
  );
  const session = (await sessionResponse.json().catch(() => null)) as BlueskySession | null;

  if (!sessionResponse.ok || typeof session?.accessJwt !== 'string' || typeof session.did !== 'string') {
    console.error('[bluesky] Could not create a publishing session:', sessionResponse.status);
    throw new BlueskyUnavailableError(
      sessionResponse.status === 401 || sessionResponse.status === 403
        ? 'Bluesky rejected the configured handle or app password. Check BSKY_HANDLE and BSKY_APP_PASSWORD.'
        : 'Bluesky could not start a publishing session. Please try again.',
    );
  }

  const response = await blueskyRequest(
    new URL('/xrpc/com.atproto.repo.createRecord', serviceUrl).toString(),
    {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: postText(title, body),
        createdAt: new Date().toISOString(),
      },
    },
    session.accessJwt,
  );

  if (!response.ok) {
    console.error('[bluesky] Publishing request failed:', response.status);
    throw new BlueskyUnavailableError(
      response.status === 401 || response.status === 403
        ? 'Your Bluesky publishing session expired or was rejected. Please try again.'
        : response.status === 429
          ? 'Bluesky is rate-limiting requests. Please try again shortly.'
          : 'Bluesky could not publish this post. Please try again.',
    );
  }
}
