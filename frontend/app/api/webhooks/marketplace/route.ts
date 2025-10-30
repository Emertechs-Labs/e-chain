import { NextResponse } from 'next/server';
import { extractSignatureFromHeaders, persistWebhookPayload, readRequestBody, verifyHmacSignature } from '@/lib/webhooks';
import { trackMessage } from '@/lib/sentry.config';

export const runtime = 'nodejs';

interface MarketplaceWebhookPayload {
  event?: string;
  listingId?: string;
  ticketId?: string;
  previousOwner?: string;
  newOwner?: string;
  price?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    console.warn('[webhooks/marketplace] Unsupported content type', { contentType });
    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
  }

  const { rawBody, json, error: parseError } = await readRequestBody<MarketplaceWebhookPayload>(request);
  if (parseError) {
    console.warn('[webhooks/marketplace] Failed to parse body', { error: parseError });
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const secret = process.env.BASE_WEBHOOK_SECRET;
  const { signature, timestamp } = extractSignatureFromHeaders(request.headers, {
    signatureHeaderNames: ['x-base-signature', 'x-webhook-signature', 'x-signature'],
    timestampHeaderNames: ['x-webhook-timestamp', 'x-signature-timestamp'],
    stripeHeaderName: undefined,
  });

  const verification = verifyHmacSignature({ rawBody, secret, signature, timestamp });
  if (!verification.valid) {
    const status = verification.status ?? 401;
    console.warn('[webhooks/marketplace] Signature verification failed', {
      status,
      reason: verification.reason,
    });
    trackMessage('webhook.verification_failed', 'warning');
    return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status });
  }

  const payload: MarketplaceWebhookPayload | string = json ?? rawBody;
  const stored = await persistWebhookPayload({
    source: 'marketplace',
    payload,
    metadata: {
      digest: verification.digest,
      timestamp,
    },
  });

  const eventName = json?.event ?? 'unknown';
  trackMessage('webhook.marketplace.received', 'info');

  console.info('[webhooks/marketplace] Payload received', {
    event: eventName,
    listingId: json?.listingId,
    ticketId: json?.ticketId,
    persisted: Boolean(stored),
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
