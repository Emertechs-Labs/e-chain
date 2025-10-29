import crypto from 'crypto';
import { blobHelpers } from './blob';

export interface WebhookVerificationOptions {
  rawBody: string;
  secret?: string;
  signature: string | null;
  timestamp?: string | null;
  toleranceMs?: number;
  algorithm?: 'sha256';
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
  status?: number;
  digest?: string;
}

export interface ParsedRequestBody<T = unknown> {
  rawBody: string;
  json: T | null;
  error?: string;
}

const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

export interface SignatureExtractionOptions {
  signatureHeaderNames?: string[];
  timestampHeaderNames?: string[];
  stripeHeaderName?: string;
}

export interface ExtractedSignature {
  signature: string | null;
  timestamp: string | null;
  rawHeader?: string | null;
}

export function extractSignatureFromHeaders(
  headers: Headers,
  options: SignatureExtractionOptions = {}
): ExtractedSignature {
  const {
    signatureHeaderNames = [],
    timestampHeaderNames = [],
    stripeHeaderName = 'stripe-signature',
  } = options;

  const combinedHeader = stripeHeaderName ? headers.get(stripeHeaderName) : null;

  if (combinedHeader) {
    const parsed = parseCombinedSignatureHeader(combinedHeader);
    if (parsed.signature) {
      return {
        signature: parsed.signature,
        timestamp: parsed.timestamp,
        rawHeader: combinedHeader,
      };
    }
  }

  const signature = getFirstMatchingHeader(headers, signatureHeaderNames);
  const timestamp = getFirstMatchingHeader(headers, timestampHeaderNames);

  return {
    signature,
    timestamp,
    rawHeader: combinedHeader,
  };
}

export async function readRequestBody<T = unknown>(request: Request): Promise<ParsedRequestBody<T>> {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return { rawBody: '', json: null };
    }

    try {
      const json = JSON.parse(rawBody) as T;
      return { rawBody, json };
    } catch (error) {
      return { rawBody, json: null, error: (error as Error).message };
    }
  } catch (error) {
    return { rawBody: '', json: null, error: (error as Error).message };
  }
}

export function verifyHmacSignature(options: WebhookVerificationOptions): WebhookVerificationResult {
  const {
    rawBody,
    secret,
    signature,
    timestamp,
    toleranceMs = DEFAULT_TOLERANCE_MS,
    algorithm = 'sha256',
  } = options;

  if (!secret) {
    return {
      valid: false,
      reason: 'Webhook secret not configured',
      status: 500,
    };
  }

  if (!signature) {
    return {
      valid: false,
      reason: 'Missing signature header',
      status: 400,
    };
  }

  if (!rawBody) {
    return {
      valid: false,
      reason: 'Empty request body',
      status: 400,
    };
  }

  if (timestamp) {
    const received = Date.now();
    const parsedTimestamp = Number(timestamp) || Date.parse(timestamp);
    if (!Number.isFinite(parsedTimestamp)) {
      return {
        valid: false,
        reason: 'Invalid timestamp header',
        status: 400,
      };
    }

    if (Math.abs(received - parsedTimestamp) > toleranceMs) {
      return {
        valid: false,
        reason: 'Timestamp outside allowed tolerance',
        status: 400,
      };
    }
  }

  try {
    const base = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(base);
    const digest = hmac.digest('hex');

    const normalizedSignature = normalizeSignature(signature);
    const normalizedDigest = normalizeSignature(digest);

    const signatureBuffer = Buffer.from(normalizedSignature, 'utf8');
    const digestBuffer = Buffer.from(normalizedDigest, 'utf8');

    if (signatureBuffer.length !== digestBuffer.length) {
      return {
        valid: false,
        reason: 'Signature length mismatch',
        status: 401,
      };
    }

    const valid = crypto.timingSafeEqual(signatureBuffer, digestBuffer);

    return valid
      ? { valid: true, digest: digest }
      : { valid: false, reason: 'Invalid signature', status: 401 };
  } catch (error) {
    return {
      valid: false,
      reason: (error as Error).message,
      status: 500,
    };
  }
}

export interface PersistWebhookOptions {
  source: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
}

export async function persistWebhookPayload(options: PersistWebhookOptions) {
  const { source, payload, metadata } = options;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  try {
    const entry = {
      source,
      receivedAt: new Date().toISOString(),
      metadata: metadata ?? {},
      payload,
    };
    const json = JSON.stringify(entry, null, 2);
    const file = new File([json], `${Date.now()}.json`, { type: 'application/json' });
    return await blobHelpers.uploadFile(file, `webhooks/${source}`);
  } catch (error) {
    console.warn('[webhooks] Failed to persist payload', {
      source,
      error: (error as Error).message,
    });
    return null;
  }
}

function normalizeSignature(signature: string): string {
  const cleaned = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  return cleaned.toLowerCase();
}

function getFirstMatchingHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name);
    if (value) {
      return value;
    }
  }
  return null;
}

function parseCombinedSignatureHeader(header: string): { signature: string | null; timestamp: string | null } {
  const parts = header.split(',');
  let signature: string | null = null;
  let timestamp: string | null = null;

  for (const part of parts) {
    const [rawKey, rawValue] = part.split('=').map((segment) => segment.trim());
    if (!rawKey || !rawValue) continue;

    const key = rawKey.toLowerCase();
    if (key === 't' || key === 'timestamp') {
      timestamp = rawValue;
    }
    if (key === 'v1' || key === 'signature') {
      signature = rawValue;
    }
  }

  return { signature, timestamp };
}
