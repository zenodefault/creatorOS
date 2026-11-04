const PRIVATE_HEADERS = { 'Cache-Control': 'no-store' } as const;

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: PRIVATE_HEADERS });
}

export function unauthorized(): Response {
  return Response.json({ error: 'Sign in to continue.' }, { status: 401, headers: PRIVATE_HEADERS });
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400, headers: PRIVATE_HEADERS });
}

export function notFound(message = 'Not found.'): Response {
  return Response.json({ error: message }, { status: 404, headers: PRIVATE_HEADERS });
}

export function serverError(error: unknown): Response {
  console.error('[api]', error);
  return Response.json(
    { error: 'Something went wrong on our side.' },
    { status: 500, headers: PRIVATE_HEADERS },
  );
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as T) : null;
  } catch {
    return null;
  }
}
