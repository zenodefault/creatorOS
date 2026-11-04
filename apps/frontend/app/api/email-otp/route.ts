import crypto from 'node:crypto';

import type { NextRequest } from 'next/server';

import { badRequest, json, readJson, serverError } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class DeliveryUnavailableError extends Error {}

function hashCode(code: string, salt: string): string {
  return crypto.scryptSync(code, salt, 32).toString('hex');
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function deliver(email: string, code: string): Promise<'resend' | 'console'> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new DeliveryUnavailableError(
        'Email delivery is not configured on this server. Set RESEND_API_KEY to send codes.',
      );
    }

    console.log(`[email-otp] code for ${email}: ${code}`);
    return 'console';
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Creator Mind <onboarding@resend.dev>',
    to: email,
    subject: 'Your Creator Mind verification code',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
             <h1 style="color:#111">Verify your email</h1>
             <p>Your verification code is <strong style="font-size:22px;letter-spacing:4px">${code}</strong></p>
             <p>It expires in 10 minutes.</p>
           </div>`,
  });

  if (error) throw new Error(error.message);

  return 'resend';
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJson<{ email?: string; code?: string }>(request);
    if (!body) return badRequest('Expected a JSON body.');

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_PATTERN.test(email)) return badRequest('Enter a valid email address.');

    const db = getDb();
    const submittedCode = typeof body.code === 'string' ? body.code.trim() : '';

    // No code supplied: issue a new one.
    if (!submittedCode) {
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
      const salt = crypto.randomBytes(16).toString('hex');
      const now = Date.now();

      db.prepare(
        `INSERT INTO email_codes (email, code_hash, expires_at, attempts, created_at)
         VALUES (?, ?, ?, 0, ?)
         ON CONFLICT(email) DO UPDATE SET
           code_hash = excluded.code_hash,
           expires_at = excluded.expires_at,
           attempts = 0,
           created_at = excluded.created_at`,
      ).run(email, `${salt}:${hashCode(code, salt)}`, now + CODE_TTL_MS, now);

      const channel = await deliver(email, code);

      return json({
        requested: true,
        delivery: channel,
        // Only surfaced when no mail provider is configured, so the local flow
        // can be completed without a key.
        devCode: channel === 'console' ? code : undefined,
        expiresInMinutes: CODE_TTL_MS / 60000,
      });
    }

    if (!/^\d{6}$/.test(submittedCode)) return badRequest('Enter the 6-digit code.');

    const row = db.prepare('SELECT * FROM email_codes WHERE email = ?').get(email) as
      | { code_hash: string; expires_at: number; attempts: number }
      | undefined;

    if (!row) return badRequest('Request a code first.');
    if (Date.now() > row.expires_at) {
      db.prepare('DELETE FROM email_codes WHERE email = ?').run(email);
      return badRequest('That code has expired. Request a new one.');
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      return Response.json(
        { error: 'Too many attempts. Request a new code.' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const [salt, expected] = row.code_hash.split(':');
    const matches = safeEqual(hashCode(submittedCode, salt), expected);

    if (!matches) {
      db.prepare('UPDATE email_codes SET attempts = attempts + 1 WHERE email = ?').run(email);
      return badRequest('That code does not match.');
    }

    db.prepare('DELETE FROM email_codes WHERE email = ?').run(email);

    return json({ verified: true });
  } catch (error) {
    if (error instanceof DeliveryUnavailableError) {
      return Response.json(
        { error: error.message },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return serverError(error);
  }
}
