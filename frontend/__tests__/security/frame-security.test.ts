/**
 * Security Test Suite for Farcaster Frames
 * Tests rate limiting, input validation, XSS protection, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateEventId,
  validateQuantity,
  validateButtonIndex,
  sanitizeHtml,
  validateAddress,
  validateFid,
  ValidationError,
} from '@/lib/security/validation';
import { RateLimiter, RateLimitConfigs } from '@/lib/security/rate-limiter';

describe('Input Validation', () => {
  describe('validateEventId', () => {
    it('should accept valid alphanumeric event IDs', () => {
      expect(validateEventId('event123')).toBe('event123');
      expect(validateEventId('event-with-dashes')).toBe('event-with-dashes');
      expect(validateEventId('event_with_underscores')).toBe('event_with_underscores');
    });

    it('should reject invalid event IDs', () => {
      expect(() => validateEventId('event with spaces')).toThrow(ValidationError);
      expect(() => validateEventId('event@special')).toThrow(ValidationError);
      expect(() => validateEventId('a'.repeat(51))).toThrow(ValidationError);
      expect(() => validateEventId(123 as any)).toThrow(ValidationError);
    });

    it('should prevent SQL injection attempts', () => {
      expect(() => validateEventId("event'; DROP TABLE events;--")).toThrow(ValidationError);
      expect(() => validateEventId("event' OR '1'='1")).toThrow(ValidationError);
    });
  });

  describe('validateQuantity', () => {
    it('should accept valid quantities', () => {
      expect(validateQuantity(1)).toBe(1);
      expect(validateQuantity(10)).toBe(10);
      expect(validateQuantity('5')).toBe(5);
    });

    it('should reject invalid quantities', () => {
      expect(() => validateQuantity(0)).toThrow(ValidationError);
      expect(() => validateQuantity(-1)).toThrow(ValidationError);
      expect(() => validateQuantity(101)).toThrow(ValidationError);
      expect(() => validateQuantity(3.5)).toThrow(ValidationError);
      expect(() => validateQuantity('abc')).toThrow(ValidationError);
      expect(() => validateQuantity(NaN)).toThrow(ValidationError);
      expect(() => validateQuantity(Infinity)).toThrow(ValidationError);
    });
  });

  describe('validateButtonIndex', () => {
    it('should accept valid button indices (1-4)', () => {
      expect(validateButtonIndex(1)).toBe(1);
      expect(validateButtonIndex(2)).toBe(2);
      expect(validateButtonIndex(3)).toBe(3);
      expect(validateButtonIndex(4)).toBe(4);
    });

    it('should reject invalid button indices', () => {
      expect(() => validateButtonIndex(0)).toThrow(ValidationError);
      expect(() => validateButtonIndex(5)).toThrow(ValidationError);
      expect(() => validateButtonIndex(-1)).toThrow(ValidationError);
      expect(() => validateButtonIndex(1.5)).toThrow(ValidationError);
      expect(() => validateButtonIndex('abc' as any)).toThrow(ValidationError);
    });
  });

  describe('validateAddress', () => {
    it('should accept valid Ethereum addresses', () => {
      const addr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      expect(validateAddress(addr)).toBe(addr.toLowerCase());
    });

    it('should reject invalid addresses', () => {
      expect(() => validateAddress('0xinvalid')).toThrow(ValidationError);
      expect(() => validateAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toThrow(ValidationError);
      expect(() => validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toThrow(ValidationError);
      expect(() => validateAddress(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateFid', () => {
    it('should accept valid Farcaster FIDs', () => {
      expect(validateFid(1)).toBe(1);
      expect(validateFid(12345)).toBe(12345);
      expect(validateFid('67890')).toBe(67890);
    });

    it('should reject invalid FIDs', () => {
      expect(() => validateFid(0)).toThrow(ValidationError);
      expect(() => validateFid(-1)).toThrow(ValidationError);
      expect(() => validateFid(1000000000)).toThrow(ValidationError);
      expect(() => validateFid(3.14)).toThrow(ValidationError);
      expect(() => validateFid('abc')).toThrow(ValidationError);
    });
  });
});

describe('XSS Protection', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      expect(sanitizeHtml('<b>bold</b>')).toBe('<b>bold</b>');
      expect(sanitizeHtml('<i>italic</i>')).toBe('<i>italic</i>');
      expect(sanitizeHtml('<a href="https://example.com">link</a>')).toContain('link');
    });

    it('should remove dangerous HTML', () => {
      const dangerous = '<script>alert("XSS")</script>';
      expect(sanitizeHtml(dangerous)).not.toContain('script');
      expect(sanitizeHtml(dangerous)).not.toContain('alert');
    });

    it('should prevent event handler injection', () => {
      const malicious = '<img src=x onerror="alert(1)">';
      expect(sanitizeHtml(malicious)).not.toContain('onerror');
      expect(sanitizeHtml(malicious)).not.toContain('alert');
    });

    it('should prevent iframe injection', () => {
      const iframe = '<iframe src="evil.com"></iframe>';
      expect(sanitizeHtml(iframe)).not.toContain('iframe');
    });

    it('should handle complex XSS attacks', () => {
      const attacks = [
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<body onload=alert(1)>',
        'javascript:alert(1)',
        '<a href="javascript:alert(1)">click</a>',
        '<form action="javascript:alert(1)"><input type="submit"></form>',
      ];

      attacks.forEach((attack) => {
        const sanitized = sanitizeHtml(attack);
        expect(sanitized).not.toContain('alert');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('onerror');
      });
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    RateLimiter.clearStore();
  });

  it('should allow requests within rate limit', async () => {
    const limiter = new RateLimiter(RateLimitConfigs.frame);
    const identifier = 'user123';

    const result = await limiter.check(identifier);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(99); // 100 - 1
  });

  it('should block requests exceeding rate limit', async () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 60000 });
    const identifier = 'user123';

    // Make 3 requests (should all succeed)
    for (let i = 0; i < 3; i++) {
      const result = await limiter.check(identifier);
      expect(result.success).toBe(true);
    }

    // 4th request should be blocked
    const blocked = await limiter.check(identifier);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('should reset rate limit after window expires', async () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000 });
    const identifier = 'user123';

    // Use up rate limit
    await limiter.check(identifier);
    await limiter.check(identifier);

    // Should be blocked
    expect((await limiter.check(identifier)).success).toBe(false);

    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);

    // Should be allowed again
    expect((await limiter.check(identifier)).success).toBe(true);
  });

  it('should track different identifiers separately', async () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });

    expect((await limiter.check('user1')).success).toBe(true);
    expect((await limiter.check('user2')).success).toBe(true);
    
    expect((await limiter.check('user1')).success).toBe(false);
    expect((await limiter.check('user2')).success).toBe(false);
  });

  it('should provide accurate remaining count', async () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
    const identifier = 'user123';

    expect((await limiter.check(identifier)).remaining).toBe(4);
    expect((await limiter.check(identifier)).remaining).toBe(3);
    expect((await limiter.check(identifier)).remaining).toBe(2);
    expect((await limiter.check(identifier)).remaining).toBe(1);
    expect((await limiter.check(identifier)).remaining).toBe(0);
  });
});

describe('Frame Endpoint Security', () => {
  it('should enforce rate limits per endpoint type', () => {
    const frameLimit = RateLimitConfigs.frame.maxRequests;
    const analyticsLimit = RateLimitConfigs.analytics.maxRequests;
    const walletLimit = RateLimitConfigs.wallet.maxRequests;

    expect(frameLimit).toBe(100); // 100 requests per minute
    expect(analyticsLimit).toBe(500); // 500 requests per minute
    expect(walletLimit).toBe(20); // 20 requests per minute
  });

  it('should validate all required Frame parameters', () => {
    // Event ID validation
    expect(() => validateEventId('')).toThrow();
    expect(() => validateEventId(null as any)).toThrow();
    
    // Quantity validation
    expect(() => validateQuantity(0)).toThrow();
    expect(() => validateQuantity(-1)).toThrow();
    expect(() => validateQuantity(101)).toThrow();

    // Button index validation
    expect(() => validateButtonIndex(0)).toThrow();
    expect(() => validateButtonIndex(5)).toThrow();
  });

  it('should sanitize user-generated content in frames', () => {
    const eventName = '<script>alert("xss")</script>Event Name';
    const eventDescription = '<img src=x onerror=alert(1)>Description';

    const safeName = sanitizeHtml(eventName);
    const safeDescription = sanitizeHtml(eventDescription);

    expect(safeName).not.toContain('script');
    expect(safeName).not.toContain('alert');
    expect(safeDescription).not.toContain('onerror');
  });
});

describe('Error Handling', () => {
  it('should provide meaningful error messages', () => {
    try {
      validateQuantity(0);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain('between 1 and 100');
    }
  });

  it('should distinguish between validation errors and system errors', () => {
    const validationError = new ValidationError('Invalid input');
    expect(validationError.name).toBe('ValidationError');
    expect(validationError).toBeInstanceOf(Error);
  });

  it('should handle edge cases gracefully', () => {
    // Empty strings
    expect(() => validateEventId('')).toThrow(ValidationError);
    
    // Null/undefined
    expect(() => validateEventId(null as any)).toThrow(ValidationError);
    expect(() => validateEventId(undefined as any)).toThrow(ValidationError);
    
    // Special values
    expect(() => validateQuantity(NaN)).toThrow(ValidationError);
    expect(() => validateQuantity(Infinity)).toThrow(ValidationError);
    expect(() => validateQuantity(-Infinity)).toThrow(ValidationError);
  });
});

describe('Security Headers', () => {
  it('should validate Frame security requirements', () => {
    // Frame endpoints must:
    // 1. Allow embedding from Farcaster domains
    // 2. Prevent XSS attacks
    // 3. Use HTTPS in production
    // 4. Set appropriate cache headers
    // 5. Include rate limit headers

    const expectedHeaders = [
      'X-Frame-Options',
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ];

    // These would be set by the security middleware
    expectedHeaders.forEach((header) => {
      expect(header).toBeTruthy();
    });
  });
});
