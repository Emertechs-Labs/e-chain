type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  error?: string;
}

class SecurityLogger {
  private static instance: SecurityLogger;

  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  private log(level: LogLevel, event: string, details?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      details,
      error: error?.message,
    };

    // In production, send to logging service (e.g., DataDog, CloudWatch)
    // For now, console.log with structured format
    const logMessage = `[${level.toUpperCase()}] ${event}`;
    const logData = { ...entry };

    switch (level) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'security':
        // Security events get special treatment
        console.warn(`🔒 SECURITY: ${logMessage}`, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  // Authentication events
  authAttempt(method: string, success: boolean, userId?: string, details?: Record<string, any>) {
    this.log('info', 'auth_attempt', {
      userId,
      method,
      success,
      ...details,
    });
  }

  authSuccess(method: string, userId: string, details?: Record<string, any>) {
    this.log('info', 'auth_success', {
      userId,
      method,
      ...details,
    });
  }

  authFailure(method: string, reason: string, details?: Record<string, any>) {
    this.log('warn', 'auth_failure', {
      method,
      reason,
      ...details,
    });
  }

  // Recovery events
  recoveryAttempt(farcasterUsername: string, fid: number, success: boolean, details?: Record<string, any>) {
    this.log('security', 'recovery_attempt', {
      farcasterUsername,
      fid,
      success,
      ...details,
    });
  }

  recoverySuccess(farcasterUsername: string, fid: number, recoveredAddress: string) {
    this.log('security', 'recovery_success', {
      farcasterUsername,
      fid,
      recoveredAddress,
    });
  }

  recoveryFailure(farcasterUsername: string, fid: number, reason: string) {
    this.log('security', 'recovery_failure', {
      farcasterUsername,
      fid,
      reason,
    });
  }

  // Frame events
  frameInteraction(frameId: string, action: string, userId?: string, details?: Record<string, any>) {
    this.log('info', 'frame_interaction', {
      frameId,
      action,
      userId,
      ...details,
    });
  }

  // Security events
  suspiciousActivity(activity: string, severity: 'low' | 'medium' | 'high', details?: Record<string, any>) {
    this.log('security', 'suspicious_activity', {
      activity,
      severity,
      ...details,
    });
  }

  rateLimitExceeded(endpoint: string, identifier: string, details?: Record<string, any>) {
    this.log('warn', 'rate_limit_exceeded', {
      endpoint,
      identifier,
      ...details,
    });
  }

  // General security monitoring
  securityEvent(event: string, details?: Record<string, any>) {
    this.log('security', event, details);
  }

  // Error logging
  error(context: string, error: Error, details?: Record<string, any>) {
    this.log('error', `error_in_${context}`, details, error);
  }
}

export const securityLogger = SecurityLogger.getInstance();