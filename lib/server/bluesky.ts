type BlueskySession = {
  accessJwt?: string;
  did?: string;
};

type BlueskyBlob = {
  $type?: string;
  ref?: { $link?: string };
  mimeType?: string;
  size?: number;
};

export type BlueskyMedia = {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
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

function serviceUrl(): URL {
  const service = process.env.BSKY_SERVICE ?? DEFAULT_SERVICE;

  try {
    const url = new URL(service);
    if (url.protocol !== 'https:') throw new Error('Bluesky service must use HTTPS.');
    return url;
  } catch {
    throw new BlueskyUnavailableError('The configured Bluesky service URL is invalid.');
  }
}

async function createSession(base: URL): Promise<{ accessJwt: string; did: string }> {
  const configuredHandle = process.env.BSKY_HANDLE;
  const identifier = configuredHandle?.replace(/^@/, '');
  const password = process.env.BSKY_APP_PASSWORD;

  if (!identifier || !password) {
    throw new BlueskyUnavailableError(
      'Bluesky is not configured. Add BSKY_HANDLE and BSKY_APP_PASSWORD to .env.local, then restart the server.',
    );
  }

  let response: Response;
  try {
    response = await fetch(new URL('/xrpc/com.atproto.server.createSession', base), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    });
  } catch {
    throw new BlueskyUnavailableError('Could not reach Bluesky. Check your connection and try again.');
  }

  const session = (await response.json().catch(() => null)) as BlueskySession | null;

  if (!response.ok || typeof session?.accessJwt !== 'string' || typeof session.did !== 'string') {
    console.error('[bluesky] Could not create a publishing session:', response.status);
    throw new BlueskyUnavailableError(
      response.status === 401 || response.status === 403
        ? 'Bluesky rejected the configured handle or app password. Check BSKY_HANDLE and BSKY_APP_PASSWORD.'
        : 'Bluesky could not start a publishing session. Please try again.',
    );
  }

  return { accessJwt: session.accessJwt, did: session.did };
}

async function uploadBlob(base: URL, accessJwt: string, media: BlueskyMedia): Promise<BlueskyBlob> {
  // Copy into a plain ArrayBuffer so the Blob constructor accepts the bytes.
  const bytes = new Uint8Array(media.bytes.byteLength);
  bytes.set(media.bytes);

  const form = new FormData();
  form.append('file', new Blob([bytes.buffer], { type: media.mimeType }), media.filename);

  let response: Response;
  try {
    response = await fetch(new URL('/xrpc/com.atproto.repo.uploadBlob', base), {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessJwt}` },
      body: form,
      cache: 'no-store',
    });
  } catch {
    throw new BlueskyUnavailableError('Could not upload the media to Bluesky. Please try again.');
  }

  if (!response.ok) {
    console.error('[bluesky] Blob upload failed:', response.status);
    throw new BlueskyUnavailableError(
      response.status === 413
        ? 'Bluesky rejected that file because it is too large.'
        : 'Bluesky could not accept that file. Try a smaller image or video.',
    );
  }

  const payload = (await response.json().catch(() => null)) as { blob?: BlueskyBlob } | null;
  if (!payload?.blob?.ref?.$link) {
    throw new BlueskyUnavailableError('Bluesky did not return a usable reference for that file.');
  }

  return payload.blob;
}

/** Publishes one post using a Bluesky handle and app password held only in server environment variables. */
export async function publishToBluesky(
  title: string,
  body: string,
  media?: BlueskyMedia | null,
): Promise<void> {
  const base = serviceUrl();
  const session = await createSession(base);
  const text = postText(title, body);

  const record: Record<string, unknown> = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  };

  if (media) {
    const blob = await uploadBlob(base, session.accessJwt, media);

    if (media.mimeType.startsWith('image/')) {
      record.embed = {
        $type: 'app.bsky.embed.images',
        images: [{ image: blob, alt: title.trim().slice(0, 2000) }],
      };
    } else if (media.mimeType.startsWith('video/')) {
      record.embed = { $type: 'app.bsky.embed.video', video: blob };
    }
  }

  let response: Response;
  try {
    response = await fetch(new URL('/xrpc/com.atproto.repo.createRecord', base), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record,
      }),
      cache: 'no-store',
    });
  } catch {
    throw new BlueskyUnavailableError('Could not reach Bluesky. Check your connection and try again.');
  }

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
