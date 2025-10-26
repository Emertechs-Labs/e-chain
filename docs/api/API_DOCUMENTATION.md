# API Documentation

**Version**: 1.0.0-beta  
**Base URL**: `https://echain-eight.vercel.app/api`  
**Last Updated**: October 26, 2025

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Beta Management](#beta-management)
4. [Feedback](#feedback)
5. [Events](#events)
6. [Error Handling](#error-handling)

---

## Authentication

Most API endpoints are public during beta. Admin endpoints require authentication.

### Admin Authentication

```http
Authorization: Bearer YOUR_ADMIN_API_KEY
```

---

## Health Check

### GET /api/health

Check system health and status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T05:00:00.000Z",
  "uptime": 12345,
  "version": "abc123",
  "environment": "production",
  "checks": {
    "environment": {
      "status": "healthy",
      "message": "All required environment variables present",
      "responseTime": 2,
      "lastChecked": "2025-10-26T05:00:00.000Z"
    },
    "rpcProvider": {
      "status": "healthy",
      "message": "RPC provider accessible",
      "responseTime": 145
    },
    "contracts": {
      "status": "healthy",
      "message": "Contract configuration valid",
      "responseTime": 1
    }
  }
}
```

**Status Codes**:
- `200` - System healthy or degraded
- `503` - System unhealthy

---

## Beta Management

### POST /api/beta/register

Register for beta access.

**Request Body**:
```json
{
  "email": "user@example.com",
  "walletAddress": "0x1234...",
  "name": "John Doe",
  "role": "organizer",
  "experience": "intermediate",
  "interests": ["music", "technology"],
  "referralSource": "twitter",
  "agreedToTerms": true
}
```

**Required Fields**:
- `email` (string)
- `role` (enum: "organizer" | "attendee" | "both")
- `agreedToTerms` (boolean)

**Response**:
```json
{
  "success": true,
  "userId": "BETA-1234567890-abc123",
  "message": "Successfully registered for beta access!",
  "waitlistPosition": 42
}
```

**Status Codes**:
- `201` - Registration successful
- `400` - Invalid input
- `500` - Server error

---

### GET /api/beta/status

Check beta registration status.

**Query Parameters**:
- `userId` (required) - Beta user ID

**Request**:
```http
GET /api/beta/status?userId=BETA-1234567890-abc123
```

**Response**:
```json
{
  "success": true,
  "status": "pending",
  "waitlistPosition": 42,
  "registeredAt": "2025-10-26T05:00:00.000Z"
}
```

**Status Values**:
- `pending` - Awaiting approval
- `approved` - Beta access granted
- `rejected` - Application rejected

---

## Feedback

### POST /api/feedback

Submit beta feedback.

**Request Body**:
```json
{
  "type": "bug",
  "category": "ui",
  "severity": "high",
  "title": "Button not working",
  "description": "The submit button on event creation form doesn't respond to clicks",
  "steps": "1. Go to create event\n2. Fill form\n3. Click submit",
  "expected": "Form should submit",
  "actual": "Nothing happens",
  "screenshot": "data:image/png;base64,...",
  "url": "https://echain-eight.vercel.app/events/create",
  "walletAddress": "0x1234...",
  "email": "user@example.com"
}
```

**Required Fields**:
- `type` (enum: "bug" | "feature" | "improvement" | "general")
- `title` (string)
- `description` (string)

**Optional Fields**:
- `category` (enum: "ui" | "performance" | "functionality" | "documentation" | "other")
- `severity` (enum: "critical" | "high" | "medium" | "low")
- `steps` (string)
- `expected` (string)
- `actual` (string)
- `screenshot` (base64 string)
- `url` (string)
- `walletAddress` (string)
- `email` (string)

**Response**:
```json
{
  "success": true,
  "feedbackId": "FB-1234567890-abc123",
  "message": "Thank you for your feedback! We appreciate your input."
}
```

**Status Codes**:
- `201` - Feedback submitted
- `400` - Invalid input
- `500` - Server error

---

### GET /api/feedback

Get feedback statistics (Admin only).

**Headers**:
```http
Authorization: Bearer YOUR_ADMIN_API_KEY
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "total": 142,
    "byType": {
      "bug": 45,
      "feature": 67,
      "improvement": 23,
      "general": 7
    },
    "bySeverity": {
      "critical": 3,
      "high": 12,
      "medium": 45,
      "low": 82
    }
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

## Events

### Blockchain Events

Events are primarily managed through smart contracts. The API provides read-only access to indexed data.

**Note**: Event creation, ticket purchase, and POAP claiming happen directly on-chain through the frontend dApp.

**Contract Addresses** (Base Sepolia):
- EventFactory: `0xA97cB40548905B05A67fCD4765438aFBEA4030fc`
- EventTicket: `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C`
- POAPAttendance: `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33`

**Explorer**: https://sepolia.basescan.org/

---

## Error Handling

All API endpoints return consistent error responses.

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMIT | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Rate Limiting

**Limits**:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

**Rate Limit Response**:
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Request/Response Examples

### cURL Examples

**Health Check**:
```bash
curl https://echain-eight.vercel.app/api/health
```

**Beta Registration**:
```bash
curl -X POST https://echain-eight.vercel.app/api/beta/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "role": "organizer",
    "agreedToTerms": true
  }'
```

**Submit Feedback**:
```bash
curl -X POST https://echain-eight.vercel.app/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug",
    "title": "Issue with ticket purchase",
    "description": "Detailed description..."
  }'
```

### JavaScript/TypeScript Examples

**Fetch API**:
```typescript
// Health check
const health = await fetch('https://echain-eight.vercel.app/api/health');
const data = await health.json();

// Beta registration
const response = await fetch('https://echain-eight.vercel.app/api/beta/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'organizer',
    agreedToTerms: true,
  }),
});
const result = await response.json();

// Submit feedback
const feedback = await fetch('https://echain-eight.vercel.app/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'bug',
    title: 'Button not working',
    description: 'Submit button unresponsive',
  }),
});
```

---

## Webhooks

### Slack Integration

Feedback is automatically sent to Slack when configured.

**Setup**:
1. Create Slack webhook URL
2. Add to environment: `SLACK_FEEDBACK_WEBHOOK_URL`
3. Feedback will be posted to configured channel

**Payload Example**:
```json
{
  "text": "🐛 New Beta Feedback",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Button not working"
      }
    }
  ]
}
```

---

## SDK & Client Libraries

### TypeScript SDK (Coming Soon)

```typescript
import { EchainAPI } from '@echain/sdk';

const api = new EchainAPI({
  baseURL: 'https://echain-eight.vercel.app/api',
});

// Check health
const health = await api.health.check();

// Register for beta
const registration = await api.beta.register({
  email: 'user@example.com',
  role: 'organizer',
});

// Submit feedback
const feedback = await api.feedback.submit({
  type: 'bug',
  title: 'Issue found',
  description: 'Description here',
});
```

---

## Support

**Documentation**: https://github.com/echain/docs  
**Issues**: https://github.com/echain/issues  
**Email**: api@echain.xyz  
**Discord**: [Invite Link]

---

**API Version**: 1.0.0-beta  
**Last Updated**: October 26, 2025
