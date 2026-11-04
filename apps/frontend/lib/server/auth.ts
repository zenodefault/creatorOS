import crypto from 'node:crypto';

import firebaseConfig from '../firebase/config';

/**
 * Firebase ID tokens are verified against Google's rotating signing
 * certificates. That gives the API a cryptographically verified identity
 * without storing a service-account secret in the repository.
 */
const projectId = firebaseConfig.projectId;

const CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CLOCK_SKEW_SECONDS = 60;

type CertificateCache = { certificates: Record<string, string>; expiresAt: number };

const globalForCerts = globalThis as unknown as { __creatorOsCertificateCache?: CertificateCache };

export type AuthUser = { uid: string; email: string | null };

async function getCertificates(): Promise<Record<string, string>> {
  const cached = globalForCerts.__creatorOsCertificateCache;
  if (cached && cached.expiresAt > Date.now()) return cached.certificates;

  const response = await fetch(CERT_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load Google signing certificates (${response.status})`);
  }

  const certificates = (await response.json()) as Record<string, string>;
  const maxAge = /max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '');
  const ttlMs = (maxAge ? Number(maxAge[1]) : 3600) * 1000;

  globalForCerts.__creatorOsCertificateCache = {
    certificates,
    expiresAt: Date.now() + ttlMs,
  };

  return certificates;
}

function decodeSegment(segment: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as Record<string, unknown>;
}

export async function verifyIdToken(token: string): Promise<AuthUser | null> {
  if (!projectId) throw new Error('Firebase projectId is missing from lib/firebase/config.ts');

  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [headerSegment, payloadSegment, signatureSegment] = segments;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = decodeSegment(headerSegment);
    payload = decodeSegment(payloadSegment);
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null;

  const certificates = await getCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) return null;

  const publicKey = new crypto.X509Certificate(certificate).publicKey;
  const signatureValid = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${headerSegment}.${payloadSegment}`),
    publicKey,
    Buffer.from(signatureSegment, 'base64url'),
  );

  if (!signatureValid) return null;

  const now = Math.floor(Date.now() / 1000);

  if (payload.aud !== projectId) return null;
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (typeof payload.exp !== 'number' || payload.exp + CLOCK_SKEW_SECONDS < now) return null;
  if (typeof payload.iat === 'number' && payload.iat - CLOCK_SKEW_SECONDS > now) return null;

  const uid =
    typeof payload.sub === 'string'
      ? payload.sub
      : typeof payload.user_id === 'string'
        ? payload.user_id
        : null;

  if (!uid) return null;

  return { uid, email: typeof payload.email === 'string' ? payload.email : null };
}

export async function requireUser(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/.exec(header.trim());
  if (!match) return null;

  try {
    return await verifyIdToken(match[1]);
  } catch (error) {
    console.error('[auth] token verification failed:', error);
    return null;
  }
}
