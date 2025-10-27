// Sentry Configuration for Echain Frontend
// =========================================
// Complete error tracking and performance monitoring setup

import * as Sentry from '@sentry/nextjs';

// Sentry DSN - get from https://sentry.io/
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Environment configuration
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';
const release = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local';

type SentryTarget = 'client' | 'server' | 'edge';

const ENABLED_ENVIRONMENTS = new Set(['production', 'preview']);
const shouldInitSentry = Boolean(SENTRY_DSN) && ENABLED_ENVIRONMENTS.has(environment);
const initializedTargets = new Set<SentryTarget>();

type InitOptions = Parameters<typeof Sentry.init>[0];
type BeforeSend = NonNullable<InitOptions['beforeSend']>;
type BeforeBreadcrumb = NonNullable<InitOptions['beforeBreadcrumb']>; // eslint-disable-line @typescript-eslint/ban-types
type CaptureMessageLevel = Parameters<typeof Sentry.captureMessage>[1];

function beforeSend(event: Parameters<BeforeSend>[0], hint: Parameters<BeforeSend>[1]) {
  if (event.request) {
    if (event.request.url) {
      try {
        const url = new URL(event.request.url);
        url.searchParams.delete('token');
        url.searchParams.delete('key');
        url.searchParams.delete('secret');
        event.request.url = url.toString();
      } catch {
        // ignore parsing issues
      }
    }

    if (event.request.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.Cookie;
    }
  }

  if (environment === 'production') {
    const originalError = hint.originalException as Error | undefined;
    const message = originalError?.message ?? event.message;

    if (message) {
      const normalized = message.toLowerCase();
      if (
        normalized.includes('wallet') ||
        normalized.includes('walletconnect') ||
        normalized.includes('user rejected') ||
        normalized.includes('user denied') ||
        normalized.includes('networkerror') ||
        normalized.includes('failed to fetch')
      ) {
        return null;
      }
    }
  }

  return event;
}

function beforeBreadcrumb(breadcrumb: Parameters<BeforeBreadcrumb>[0]) {
  if (environment === 'production' && breadcrumb.category === 'console') {
    return null;
  }

  if (breadcrumb.data?.url) {
    try {
      const url = new URL(breadcrumb.data.url);
      url.searchParams.delete('token');
      url.searchParams.delete('key');
      breadcrumb.data.url = url.toString();
    } catch {
      // ignore parsing errors
    }
  }

  return breadcrumb;
}

type IntegrationArray = Extract<InitOptions['integrations'], unknown[]>;

function buildIntegrations(target: SentryTarget): IntegrationArray {
  const integrations: unknown[] = [];

  if (target === 'client') {
    integrations.push(Sentry.browserTracingIntegration());
    integrations.push(Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
      errorSampleRate: 1.0,
    }));
    integrations.push(Sentry.browserProfilingIntegration());
  }

  return integrations as IntegrationArray;
}

export function initSentry(target: SentryTarget) {
  if (!shouldInitSentry || initializedTargets.has(target)) {
    return;
  }

  const options: InitOptions = {
    dsn: SENTRY_DSN,
    environment,
    release: `echain-frontend@${release}`,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment === 'development',
    integrations: buildIntegrations(target),
    beforeSend,
    beforeBreadcrumb,
    sampleRate: 1.0,
    autoSessionTracking: true,
    attachStacktrace: true,
    sendDefaultPii: false,
  };

  Sentry.init(options);

  Sentry.setContext('app', {
    name: 'Echain',
    version: release,
    environment,
  });

  Sentry.setTags({
    deployment: environment,
    network: process.env.NEXT_PUBLIC_ACTIVE_NETWORK || 'sepolia',
  });

  initializedTargets.add(target);
}

function detectTarget(): SentryTarget {
  if (typeof window !== 'undefined') {
    return 'client';
  }

  if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
    return 'edge';
  }

  return 'server';
}

function ensureInitialized() {
  if (!shouldInitSentry) {
    return false;
  }

  const target = detectTarget();
  initSentry(target);
  return true;
}

// Custom error tracking utilities
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (!ensureInitialized()) {
    console.error('Error:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

export const trackMessage = (message: string, level: CaptureMessageLevel = 'info') => {
  if (!ensureInitialized()) {
    console.log(`[${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
};

// Performance monitoring
type SpanLike = {
  setStatus?: (status: string) => void;
  finish?: () => void;
  end?: () => void;
};

export const startTransaction = (name: string, op: string): SpanLike | null => {
  if (!ensureInitialized()) return null;

  const startSpanManual = (Sentry as unknown as { startSpanManual?: (config: { name: string; op?: string }) => SpanLike }).startSpanManual;
  if (typeof startSpanManual === 'function') {
    return startSpanManual({ name, op });
  }

  const startTransactionFn = (Sentry as unknown as { startTransaction?: (config: { name: string; op?: string }) => SpanLike }).startTransaction;
  if (typeof startTransactionFn === 'function') {
    return startTransactionFn({ name, op });
  }

  return {
    setStatus: () => undefined,
    finish: () => undefined,
  };
};

// Blockchain-specific error tracking
export const trackContractError = (
  contractName: string,
  method: string,
  error: Error,
  context?: Record<string, any>
) => {
  if (!ensureInitialized()) {
    console.error(`Contract Error [${contractName}.${method}]:`, error, context);
    return;
  }

  Sentry.captureException(error, {
    tags: {
      contract: contractName,
      method,
      errorType: 'contract',
    },
    extra: context,
  });
};

// Transaction error tracking
export const trackTransactionError = (
  txHash: string | undefined,
  error: Error,
  context?: Record<string, any>
) => {
  if (!ensureInitialized()) {
    console.error('Transaction Error:', error, { txHash, ...context });
    return;
  }

  Sentry.captureException(error, {
    tags: {
      transactionHash: txHash || 'unknown',
      errorType: 'transaction',
    },
    extra: context,
  });
};

// Wallet connection error tracking
export const trackWalletError = (
  walletType: string,
  error: Error,
  context?: Record<string, any>
) => {
  if (!ensureInitialized()) {
    console.error(`Wallet Error [${walletType}]:`, error, context);
    return;
  }

  // Only track if it's not user rejection
  if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
    return; // Don't track user-initiated cancellations
  }

  Sentry.captureException(error, {
    tags: {
      wallet: walletType,
      errorType: 'wallet',
    },
    extra: context,
  });
};

// Performance measurement
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const transaction = startTransaction(operation, 'function');
  
  try {
    const result = await fn();
    transaction?.setStatus?.('ok');
    return result;
  } catch (error) {
    transaction?.setStatus?.('internal_error');
    throw error;
  } finally {
    transaction?.finish?.();
    transaction?.end?.();
  }
};

export default Sentry;
