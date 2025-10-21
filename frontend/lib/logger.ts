/**
 * Centralized Logging System for Echain
 * 
 * Replaces console.log/error/warn with structured logging
 * that can be disabled in production and integrated with monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isEnabled: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING !== 'false';
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.isEnabled) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (this.isEnabled) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    if (this.isEnabled) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Error level logging - always enabled
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...context,
    });

    // In production, send to monitoring service (e.g., Sentry)
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Integrate with Sentry or similar service
      // Sentry.captureException(error, { extra: context });
    }
  }

  /**
   * Transaction logging with structured data
   */
  transaction(action: string, data: {
    txHash?: string;
    from?: string;
    to?: string;
    value?: string;
    status?: 'pending' | 'success' | 'failed';
    [key: string]: any;
  }): void {
    this.info(`Transaction: ${action}`, data);
  }

  /**
   * Contract interaction logging
   */
  contract(method: string, data: {
    contract?: string;
    args?: any[];
    result?: any;
    error?: Error;
    [key: string]: any;
  }): void {
    if (data.error) {
      this.error(`Contract call failed: ${method}`, data.error, data);
    } else {
      this.debug(`Contract call: ${method}`, data);
    }
  }

  /**
   * API request logging
   */
  api(endpoint: string, data: {
    method?: string;
    status?: number;
    duration?: number;
    error?: Error;
    [key: string]: any;
  }): void {
    if (data.error || (data.status && data.status >= 400)) {
      this.error(`API error: ${endpoint}`, data.error, data);
    } else {
      this.debug(`API call: ${endpoint}`, data);
    }
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      this.debug(`Performance: ${label} took ${duration}ms`, context);
    }
  }

  /**
   * User action logging for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, context);
    
    // In production, send to analytics service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Integrate with analytics service
      // analytics.track(action, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function for performance measurement
export function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logger.performance(label, duration);
    }) as Promise<T>;
  } else {
    const duration = performance.now() - start;
    logger.performance(label, duration);
    return result;
  }
}

// Type-safe error logging helper
export function logError(message: string, error: unknown, context?: LogContext): void {
  if (error instanceof Error) {
    logger.error(message, error, context);
  } else {
    logger.error(message, new Error(String(error)), context);
  }
}
