/**
 * Enhanced Global Error Handler Middleware
 * Comprehensive error handling with retry logic, monitoring, and detailed error codes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

// Define Prisma error interface
interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

// Enhanced error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better classification
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  NETWORK = 'network'
}

// Comprehensive error codes
export enum ErrorCode {
  // Validation errors (4000-4099)
  VALIDATION_FAILED = 'E4000',
  INVALID_INPUT = 'E4001',
  MISSING_REQUIRED_FIELD = 'E4002',
  INVALID_FORMAT = 'E4003',
  
  // Authentication errors (4100-4199)
  INVALID_CREDENTIALS = 'E4100',
  TOKEN_EXPIRED = 'E4101',
  TOKEN_INVALID = 'E4102',
  WALLET_SIGNATURE_INVALID = 'E4103',
  AUTHENTICATION_REQUIRED = 'E4104',
  
  // Authorization errors (4200-4299)
  INSUFFICIENT_PERMISSIONS = 'E4200',
  ACCESS_DENIED = 'E4201',
  RESOURCE_FORBIDDEN = 'E4202',
  
  // Resource errors (4300-4399)
  RESOURCE_NOT_FOUND = 'E4300',
  RESOURCE_ALREADY_EXISTS = 'E4301',
  RESOURCE_CONFLICT = 'E4302',
  RESOURCE_LOCKED = 'E4303',
  
  // Business logic errors (4400-4499)
  EVENT_CAPACITY_EXCEEDED = 'E4400',
  TICKET_ALREADY_USED = 'E4401',
  EVENT_NOT_PUBLISHED = 'E4402',
  PAYMENT_FAILED = 'E4403',
  INSUFFICIENT_BALANCE = 'E4404',
  
  // Rate limiting (4290-4299)
  RATE_LIMIT_EXCEEDED = 'E4290',
  TOO_MANY_REQUESTS = 'E4291',
  
  // Server errors (5000-5999)
  INTERNAL_SERVER_ERROR = 'E5000',
  DATABASE_CONNECTION_ERROR = 'E5001',
  EXTERNAL_SERVICE_ERROR = 'E5002',
  BLOCKCHAIN_ERROR = 'E5003',
  PAYMENT_GATEWAY_ERROR = 'E5004',
  FILE_SYSTEM_ERROR = 'E5005',
  CONFIGURATION_ERROR = 'E5006'
}

// Enhanced AppError class
export class AppError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly isRetryable: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    public statusCode: number,
    public message: string,
    errorCode: ErrorCode,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isRetryable: boolean = false,
    context?: Record<string, any>,
    public isOperational = true
  ) {
    super(message);
    this.errorCode = errorCode;
    this.category = category;
    this.severity = severity;
    this.isRetryable = isRetryable;
    this.context = context;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Retry mechanism for retryable operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if it's not a retryable error
      if (error instanceof AppError && !error.isRetryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
        retryConfig.maxDelay
      );

      logger.warn(`Operation failed, retrying in ${delay}ms`, {
        attempt,
        maxAttempts: retryConfig.maxAttempts,
        error: error instanceof Error ? error.message : String(error)
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma errors
  const prismaErr = err as PrismaError;
  if (prismaErr.code) {
    // Unique constraint violation
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Resource already exists',
        field: prismaErr.meta?.target?.[0],
      });
    }

    // Record not found
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resource not found',
      });
    }
  }

  // Application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
