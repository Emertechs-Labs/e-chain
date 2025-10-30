import { NextResponse } from 'next/server';
import { extractSignatureFromHeaders, persistWebhookPayload, readRequestBody, verifyHmacSignature } from '@/lib/webhooks';
import { trackMessage } from '@/lib/sentry.config';

export const runtime = 'nodejs';

interface PinataWebhookPayload {
  IpfsHash?: string;
  PinSize?: number;
  Timestamp?: string;
  isDuplicate?: boolean;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    console.warn('[webhooks/pinata] Unsupported content type', { contentType });
    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
  }

  const { rawBody, json, error: parseError } = await readRequestBody<PinataWebhookPayload>(request);

  if (parseError) {
    console.warn('[webhooks/pinata] Failed to parse body', { error: parseError });
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const secret = process.env.PINATA_WEBHOOK_SECRET;
  const { signature, timestamp } = extractSignatureFromHeaders(request.headers, {
    signatureHeaderNames: ['x-pinata-signature', 'x-webhook-signature'],
    timestampHeaderNames: ['x-pinata-signature-timestamp', 'x-webhook-timestamp'],
    stripeHeaderName: undefined,
  });

  const verification = verifyHmacSignature({ rawBody, secret, signature, timestamp });
  if (!verification.valid) {
    const status = verification.status ?? 401;
    console.warn('[webhooks/pinata] Signature verification failed', {
      status,
      reason: verification.reason,
    });
    trackMessage('webhook.verification_failed', 'warning');
    return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status });
  }

  const payload: PinataWebhookPayload | string = json ?? rawBody;
  const stored = await persistWebhookPayload({
    source: 'pinata',
    payload,
    metadata: {
      digest: verification.digest,
      timestamp,
    },
  });

  trackMessage('webhook.pinata.received', 'info');

  console.info('[webhooks/pinata] Webhook received', {
    hash: json?.IpfsHash,
    size: json?.PinSize,
    persisted: Boolean(stored),
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
