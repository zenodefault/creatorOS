type BlueskySession = {
  accessJwt?: string;
  did?: string;
};

export class BlueskyUnavailableError extends Error {}

const DEFAULT_SERVICE = 'https://bsky.social';
const MAX_POST_LENGTH = 300;
const MAX_BLOB_SIZE = 50 * 1024 * 1024; // 50MB

function postText(title: string, body: string): string {
  const text = body.trim() || title.trim();
  if (Array.from(text).length > MAX_POST_LENGTH) {
    throw new BlueskyUnavailableError(`Bluesky posts are limited to ${MAX_POST_LENGTH} characters.`);
  }
  return text;
}

/** Upload a blob (image or video) to Bluesky and return the blob reference. */
export async function uploadBlobs(
  serviceUrl: URL,
  accessJwt: string,
  file: File
): Promise<{ blob: string; mimeType: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', file.type);

  const response = await fetch(
    new URL('/xrpc/com.atproto.repo.uploadBlob', serviceUrl).toString(),
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[bluesky] Blob upload failed:', response.status, errorText);
    throw new BlueskyUnavailableError(
      `Bluesky blob upload failed (${response.status}). Please try again.`
    );
  }

  const result = (await response.json()) as { $type?: string; $link?: string; mimeType?: string };
  return {
    blob: result.$link || '',
    mimeType: result.mimeType || file.type,
  };
}

/** Publishes a post to Bluesky, optionally with an image or video attachment. */
export async function publishToBluesky(
  title: string,
  body: string,
  media?: File
): Promise<void> {
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

  // Step 1: Create session
  const sessionResponse = await fetch(
    new URL('/xrpc/com.atproto.server.createSession', serviceUrl).toString(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    }
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

  // Step 2: Upload media if provided
  let blobRef: string = '';
  if (media) {
    if (media.size > MAX_BLOB_SIZE) {
      throw new BlueskyUnavailableError(`File is too large (${Math.round(media.size / 1024 / 1024)}MB). Bluesky supports up to 50MB.`);
    }
    const uploadResult = await uploadBlobs(serviceUrl, session.accessJwt, media);
    blobRef = uploadResult.blob;
  }

  // Step 3: Create the post
  const text = postText(title, body);

  const recordBody = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  } as const;

  // Add embed if we have a blob (image/video)
  if (blobRef) {
    const mimeType = media?.type || '';
    if (mimeType.startsWith('image/')) {
      ;(recordBody as any).embed = {
        $type: 'app.bsky.embed.images',
        image: blobRef,
        alt: { encoding: 'plain', text: title || 'Image' },
      };
    } else if (mimeType.startsWith('video/')) {
      ;(recordBody as any).embed = {
        $type: 'app.bsky.embed.video',
        video: blobRef,
        thumbnail: blobRef,
        aspectRatio: { width: 16, height: 9 },
      };
    }
  }

  const response = await fetch(
    new URL('/xrpc/com.atproto.repo.createRecord', serviceUrl).toString(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify(recordBody),
    }
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