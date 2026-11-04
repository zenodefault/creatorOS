export type OtpRequest = {
  requested: true;
  delivery: 'resend' | 'console';
  devCode?: string;
  expiresInMinutes: number;
};

async function postOtp(body: { email: string; code?: string }): Promise<Record<string, unknown>> {
  const response = await fetch('/api/email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : 'Verification failed.';
    throw new Error(message);
  }

  return payload ?? {};
}

export const requestEmailOtp = async (email: string): Promise<OtpRequest> => {
  const payload = await postOtp({ email });

  return {
    requested: true,
    delivery: payload.delivery === 'resend' ? 'resend' : 'console',
    devCode: typeof payload.devCode === 'string' ? payload.devCode : undefined,
    expiresInMinutes: typeof payload.expiresInMinutes === 'number' ? payload.expiresInMinutes : 10,
  };
};

export const verifyEmailOtp = async (email: string, code: string): Promise<boolean> => {
  const payload = await postOtp({ email, code });
  return payload.verified === true;
};
