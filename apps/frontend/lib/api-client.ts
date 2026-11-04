'use client';

import { auth } from './firebase/init';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function authorizationHeaders(): Promise<Record<string, string>> {
  // On a hard page load Firebase has not restored the session yet, so wait for
  // the first auth state before deciding the caller is signed out.
  await auth.authStateReady();

  const currentUser = auth.currentUser;
  if (!currentUser) throw new ApiError('Sign in to continue.', 401);

  const token = await currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authorizationHeaders()),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(path, { ...init, headers, cache: 'no-store' });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export function apiSend<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
