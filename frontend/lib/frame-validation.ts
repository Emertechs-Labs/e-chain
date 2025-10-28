import { NextRequest, NextResponse } from 'next/server';
import { securityLogger } from './security-logger';

export interface FrameData {
  fid?: number;
  url?: string;
  messageHash?: string;
  timestamp?: number;
  network?: number;
  buttonIndex?: number;
  castId?: {
    fid: number;
    hash: string;
  };
  inputText?: string;
}

export function validateFrameData(data: any): { isValid: boolean; errors: string[]; sanitizedData?: FrameData } {
  const errors: string[] = [];
  const sanitizedData: FrameData = {};

  // Validate FID
  if (data.fid !== undefined) {
    const fid = parseInt(data.fid);
    if (isNaN(fid) || fid <= 0) {
      errors.push('Invalid FID');
    } else {
      sanitizedData.fid = fid;
    }
  }

  // Validate URL
  if (data.url) {
    try {
      const url = new URL(data.url);
      // Only allow HTTPS URLs
      if (url.protocol !== 'https:') {
        errors.push('URL must use HTTPS protocol');
      } else {
        sanitizedData.url = data.url;
      }
    } catch {
      errors.push('Invalid URL format');
    }
  }

  // Validate message hash (should be 0x + 64 hex chars)
  if (data.messageHash) {
    if (!/^0x[a-fA-F0-9]{64}$/.test(data.messageHash)) {
      errors.push('Invalid message hash format');
    } else {
      sanitizedData.messageHash = data.messageHash;
    }
  }

  // Validate timestamp
  if (data.timestamp !== undefined) {
    const timestamp = parseInt(data.timestamp);
    const now = Date.now();
    // Allow timestamps within 5 minutes of current time
    if (isNaN(timestamp) || Math.abs(now - timestamp) > 5 * 60 * 1000) {
      errors.push('Invalid or expired timestamp');
    } else {
      sanitizedData.timestamp = timestamp;
    }
  }

  // Validate network
  if (data.network !== undefined) {
    const network = parseInt(data.network);
    // Allow Base mainnet (8453) and testnet (84532)
    if (isNaN(network) || ![8453, 84532].includes(network)) {
      errors.push('Invalid network ID');
    } else {
      sanitizedData.network = network;
    }
  }

  // Validate button index
  if (data.buttonIndex !== undefined) {
    const buttonIndex = parseInt(data.buttonIndex);
    if (isNaN(buttonIndex) || buttonIndex < 1 || buttonIndex > 4) {
      errors.push('Invalid button index');
    } else {
      sanitizedData.buttonIndex = buttonIndex;
    }
  }

  // Validate cast ID
  if (data.castId) {
    if (typeof data.castId !== 'object' ||
        typeof data.castId.fid !== 'number' ||
        typeof data.castId.hash !== 'string') {
      errors.push('Invalid cast ID structure');
    } else {
      const fid = parseInt(data.castId.fid);
      if (isNaN(fid) || fid <= 0 || !/^0x[a-fA-F0-9]{64}$/.test(data.castId.hash)) {
        errors.push('Invalid cast ID values');
      } else {
        sanitizedData.castId = {
          fid,
          hash: data.castId.hash,
        };
      }
    }
  }

  // Validate input text (limit length and sanitize)
  if (data.inputText) {
    if (typeof data.inputText !== 'string') {
      errors.push('Input text must be a string');
    } else if (data.inputText.length > 1000) {
      errors.push('Input text too long (max 1000 characters)');
    } else {
      // Basic sanitization - remove potentially dangerous characters
      const sanitized = data.inputText.replace(/[<>\"'&]/g, '');
      sanitizedData.inputText = sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

export function createFrameValidationMiddleware() {
  return async function frameValidationMiddleware(
    request: NextRequest,
    handler: (validatedData: FrameData) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validation = validateFrameData(body);

      if (!validation.isValid) {
        securityLogger.securityEvent('frame_validation_failed', {
          errors: validation.errors,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent'),
        });

        return NextResponse.json(
          { error: 'Invalid frame data', details: validation.errors },
          { status: 400 }
        );
      }

      // Log successful validation
      securityLogger.frameInteraction('frame_request', 'validation_success', undefined, {
        fid: validation.sanitizedData?.fid,
        buttonIndex: validation.sanitizedData?.buttonIndex,
      });

      return handler(validation.sanitizedData!);
    } catch (error) {
      securityLogger.error('frame_validation_middleware', error as Error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
  };
}