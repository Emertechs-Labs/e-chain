import { NextResponse } from 'next/server';
import { extractSignatureFromHeaders, persistWebhookPayload, readRequestBody, verifyHmacSignature } from '@/lib/webhooks';
import { trackMessage } from '@/lib/sentry.config';

export const runtime = 'nodejs';

interface PaymentWebhookPayload {
  type?: string;
  data?: Record<string, unknown>;
  id?: string;
  created?: number;
  livemode?: boolean;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    console.warn('[webhooks/payments] Unsupported content type', { contentType });
    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
  }

  const { rawBody, json, error: parseError } = await readRequestBody<PaymentWebhookPayload>(request);
  if (parseError) {
    console.warn('[webhooks/payments] Failed to parse body', { error: parseError });
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const { signature, timestamp, rawHeader } = extractSignatureFromHeaders(request.headers, {
    signatureHeaderNames: ['stripe-signature', 'x-paystack-signature', 'x-signature'],
    timestampHeaderNames: ['x-paystack-timestamp', 'x-signature-timestamp'],
  });

  const verification = verifyHmacSignature({ rawBody, secret, signature, timestamp });
  if (!verification.valid) {
    const status = verification.status ?? 401;
    console.warn('[webhooks/payments] Signature verification failed', {
      status,
      reason: verification.reason,
    });
    trackMessage('webhook.verification_failed', 'warning');
    return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status });
  }

  const payload: PaymentWebhookPayload | string = json ?? rawBody;
  const stored = await persistWebhookPayload({
    source: 'payments',
    payload,
    metadata: {
      digest: verification.digest,
      timestamp,
      rawHeader,
    },
  });

  const eventType = json?.type ?? 'unknown';
  trackMessage('webhook.payments.received', 'info');

  console.info('[webhooks/payments] Payload received', {
    id: json?.id,
    type: eventType,
    persisted: Boolean(stored),
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
