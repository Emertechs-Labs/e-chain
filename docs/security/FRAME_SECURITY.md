# Frame Security Implementation

## Overview

Comprehensive security measures protecting Farcaster Frame endpoints from common web vulnerabilities including XSS attacks, rate limit abuse, SQL injection, and malicious input.

**Story**: Sprint 2, Story 5 - Security Review & Testing (7 points)  
**Status**: ✅ Complete

---

## Security Layers

### 1. Rate Limiting

**Implementation**: Token Bucket Algorithm with In-Memory Store

```typescript
import { withRateLimit, RateLimitConfigs } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  return await withRateLimit(request, RateLimitConfigs.frame, async () => {
    // Handler logic
  });
}
```

**Rate Limits**:
- Frame endpoints: 100 requests/minute
- Analytics endpoints: 500 requests/minute  
- Wallet operations: 20 requests/minute
- Public API: 1000 requests/minute

**Features**:
- Per-user rate limiting (via Farcaster FID or IP address)
- Automatic token refill based on time window
- Standard HTTP headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 429 status code with `Retry-After` header when limit exceeded
- Automatic cleanup of expired rate limit records every 60 seconds

**Production Scaling**:
```typescript
// TODO: Replace in-memory store with Redis for multi-instance deployment
const rateLimitStore = new RedisStore({
  client: redisClient,
  prefix: 'ratelimit:',
});
```

---

### 2. Input Validation

**Implementation**: Strict Type Validation with Custom Validators

```typescript
import { validateEventId, validateQuantity, validateButtonIndex } from '@/lib/security/validation';

// Validate event ID (alphanumeric, hyphens, underscores only)
const eventId = validateEventId(params.id); // Throws ValidationError if invalid

// Validate quantity (1-100, integer only)
const quantity = validateQuantity(inputText); // Throws ValidationError if invalid

// Validate button index (1-4 for Farcaster Frames)
const buttonIndex = validateButtonIndex(untrustedData.buttonIndex);
```

**Validators**:

| Validator | Valid Range | Purpose |
|-----------|-------------|---------|
| `validateEventId` | Alphanumeric + `-_`, max 50 chars | Prevent SQL injection, path traversal |
| `validateQuantity` | 1-100, integers only | Prevent overflow, negative values |
| `validateButtonIndex` | 1-4 integers | Farcaster Frame button spec |
| `validateAddress` | Ethereum address format | Validate wallet addresses |
| `validateFid` | 1-999,999,999 integers | Validate Farcaster user IDs |
| `validateTxHash` | 0x + 64 hex chars | Validate transaction hashes |
| `validatePrice` | 0-1M ETH, 18 decimals | Validate ETH amounts |
| `validateUrl` | HTTPS, whitelisted domains | Prevent open redirects |

**Error Handling**:
```typescript
try {
  const eventId = validateEventId(params.id);
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // System error (500)
}
```

---

### 3. XSS Protection

**Implementation**: DOMPurify HTML Sanitization

```typescript
import { sanitizeHtml } from '@/lib/security/validation';

// Sanitize user-generated content before rendering
const safeName = sanitizeHtml(event.name);
const safeDescription = sanitizeHtml(event.description);
```

**Allowed HTML Tags**: `b`, `i`, `em`, `strong`, `a`, `p`, `br`  
**Allowed Attributes**: `href`, `target`, `rel`

**Blocked Attacks**:
- `<script>alert('xss')</script>` → Empty string
- `<img src=x onerror="alert(1)">` → `<img src="x">`
- `<iframe src="evil.com">` → Empty string
- `<a href="javascript:alert(1)">` → Sanitized href

**CSP Headers** (Content Security Policy):
```typescript
import { withSecurityHeaders } from '@/lib/security/headers';

const response = new NextResponse(html);
return withSecurityHeaders(response, 'frame');
```

**Frame CSP**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: http:;
connect-src 'self' https: wss:;
frame-ancestors https://warpcast.com https://*.farcaster.xyz https://*.warpcast.com;
```

---

### 4. CORS Configuration

**Implementation**: Farcaster Domain Whitelist

```typescript
import { handleCors, FARCASTER_CORS_CONFIG } from '@/lib/security/headers';

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request, FARCASTER_CORS_CONFIG);
  if (corsResponse) return corsResponse; // Preflight request
  
  // Continue with handler
}
```

**Allowed Origins**:
- `https://warpcast.com`
- `https://www.warpcast.com`
- `https://client.warpcast.com`
- `https://farcaster.xyz`
- `https://www.farcaster.xyz`

**CORS Headers**:
```
Access-Control-Allow-Origin: https://warpcast.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Farcaster-FID
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

### 5. Security Headers

**Strict Headers** (Sensitive endpoints):
```typescript
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Frame Headers** (Allow Farcaster embedding):
```typescript
X-Frame-Options: ALLOW-FROM https://warpcast.com
X-Content-Type-Options: nosniff
Content-Security-Policy: [Frame CSP]
```

---

## Attack Prevention

### SQL Injection
**Vector**: Malicious event IDs like `'; DROP TABLE events;--`  
**Protection**: `validateEventId()` only allows alphanumeric + `-_`

```typescript
// ❌ Blocked
validateEventId("event'; DROP TABLE events;--"); // Throws ValidationError

// ✅ Allowed
validateEventId("event-2024-conference"); // Returns sanitized ID
```

---

### XSS (Cross-Site Scripting)
**Vector**: Malicious event names with embedded scripts  
**Protection**: `sanitizeHtml()` removes all script tags and event handlers

```typescript
// ❌ Blocked
const malicious = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
sanitizeHtml(malicious); // Returns empty string

// ✅ Allowed
const safe = '<b>Bold Event Name</b>';
sanitizeHtml(safe); // Returns '<b>Bold Event Name</b>'
```

---

### Rate Limit Abuse
**Vector**: Automated requests flooding the API  
**Protection**: Token bucket rate limiting per user

```typescript
// User makes 100 requests in 1 minute → 101st request blocked
// Response: 429 Too Many Requests
// Headers:
//   X-RateLimit-Limit: 100
//   X-RateLimit-Remaining: 0
//   X-RateLimit-Reset: 1735567200000
//   Retry-After: 45
```

---

### Integer Overflow
**Vector**: Extremely large quantities causing arithmetic errors  
**Protection**: `validateQuantity()` enforces 1-100 range

```typescript
// ❌ Blocked
validateQuantity(999999999); // Throws ValidationError
validateQuantity(-1); // Throws ValidationError

// ✅ Allowed
validateQuantity(10); // Returns 10
```

---

### Path Traversal
**Vector**: Event IDs like `../../etc/passwd`  
**Protection**: `validateEventId()` blocks special characters

```typescript
// ❌ Blocked
validateEventId('../../../etc/passwd'); // Throws ValidationError
validateEventId('event/../../admin'); // Throws ValidationError
```

---

### Open Redirects
**Vector**: Malicious URLs in frame metadata  
**Protection**: `validateUrl()` enforces domain whitelist and HTTPS

```typescript
// ❌ Blocked
validateUrl('http://evil.com'); // HTTP not allowed in production
validateUrl('https://evil.com/phishing'); // Domain not whitelisted

// ✅ Allowed
validateUrl('https://echain.app/events/123'); // Whitelisted domain
```

---

## Testing

**Test Suite**: `frontend/__tests__/security/frame-security.test.ts`

**Coverage**:
- ✅ Input validation (event IDs, quantities, button indices, addresses, FIDs)
- ✅ XSS protection (script tags, event handlers, iframes, complex attacks)
- ✅ Rate limiting (requests within limit, exceeding limit, window reset, per-user tracking)
- ✅ Error handling (meaningful messages, validation vs system errors, edge cases)
- ✅ Security headers (CSP, X-Frame-Options, rate limit headers)

**Run Tests**:
```bash
npm run test -- frame-security.test.ts
```

**Expected Results**:
- All input validation tests pass
- XSS sanitization removes malicious code
- Rate limiter blocks requests after threshold
- Proper error messages returned

---

## Production Checklist

### Before Deploying to Base Mainnet

- [x] Rate limiting implemented with token bucket algorithm
- [x] Input validation for all user inputs
- [x] XSS protection with DOMPurify
- [x] CORS configured for Farcaster domains
- [x] Security headers (CSP, X-Frame-Options, HSTS)
- [x] Comprehensive test suite (100+ test cases)
- [ ] Replace in-memory rate limit store with Redis
- [ ] Enable Farcaster Hub API frame message verification
- [ ] Set up error monitoring (Sentry)
- [ ] Configure WAF rules (Cloudflare/Vercel)
- [ ] Enable DDoS protection
- [ ] Set up security alerting (rate limit breaches, validation errors)

---

## Monitoring

### Security Metrics to Track

**Rate Limiting**:
- Total requests per endpoint
- Rate limit violations per hour
- Top violators by FID/IP

**Validation Errors**:
- Invalid input attempts per endpoint
- Most common validation failures
- Potential attack patterns

**Response Times**:
- P50/P99 latency for secured endpoints
- Impact of rate limiting on performance
- Cache hit rates

**Alerts**:
- Rate limit violations > 100/hour
- Validation errors > 50/minute
- Unusual traffic patterns
- CSP violations

---

## API Examples

### Protected Frame Endpoint

```typescript
// frontend/app/api/frames/events/[id]/route.ts
export async function GET(request: NextRequest, { params }) {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(request, FARCASTER_CORS_CONFIG);
  if (corsResponse) return corsResponse;

  // 2. Rate limiting wrapper
  return await withRateLimit(request, RateLimitConfigs.frame, async () => {
    try {
      // 3. Validate input
      const eventId = validateEventId(params.id);

      // 4. Fetch and sanitize data
      const event = await fetchEventDetails(eventId);
      const safeName = sanitizeHtml(event.name);

      // 5. Generate response
      const html = generateFrameHTML(safeName, ...);

      // 6. Apply security headers
      const response = new NextResponse(html, { headers: {...} });
      return withSecurityHeaders(response, 'frame');
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  });
}
```

### Client-Side Usage

```typescript
// Safe frame interaction
const response = await fetch(`/api/frames/events/${eventId}`);

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry in ${retryAfter} seconds`);
  return;
}

if (response.status === 400) {
  const { error } = await response.json();
  console.error('Validation error:', error);
  return;
}

const html = await response.text();
// Render frame
```

---

## Security Best Practices

### Developer Guidelines

1. **Always Validate Input**: Use provided validators for all user inputs
2. **Sanitize Output**: Use `sanitizeHtml()` for any user-generated content in HTML
3. **Check Rate Limits**: Wrap all API routes with `withRateLimit()`
4. **Apply Security Headers**: Use `withSecurityHeaders()` on all responses
5. **Handle CORS**: Use `handleCors()` for cross-origin requests
6. **Catch Validation Errors**: Distinguish `ValidationError` from system errors
7. **Test Security**: Add test cases for each new input field
8. **Monitor Metrics**: Track rate limit violations and validation errors

### Common Pitfalls

❌ **Don't**: Trust user input directly  
✅ **Do**: Validate with strict schemas

❌ **Don't**: Concatenate user input into HTML  
✅ **Do**: Use `sanitizeHtml()` before rendering

❌ **Don't**: Skip rate limiting for "trusted" endpoints  
✅ **Do**: Apply rate limits to all public APIs

❌ **Don't**: Return sensitive error details to users  
✅ **Do**: Log details, return generic messages

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Farcaster Frame Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Last Updated**: 2025-01-30  
**Security Audit**: Pending professional security audit before mainnet launch
