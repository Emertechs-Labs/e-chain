# Beta Feedback System

A comprehensive feedback collection and analytics system for the Echain Web3 event platform beta testing phase.

## Overview

The Beta Feedback System enables real-time collection of user feedback, bug reports, and feature requests during beta testing. It includes:

- **Feedback Widgets**: Floating and inline feedback collection components
- **API Endpoints**: RESTful API for feedback submission and analytics retrieval
- **Slack Integration**: Real-time notifications for new feedback
- **Analytics Dashboard**: Admin dashboard for monitoring feedback metrics
- **Data Storage**: Vercel Blob storage for feedback persistence

## Features

### 🎯 Feedback Collection
- **Rating System**: 1-5 star ratings
- **Categories**: UX, Bug Reports, Feature Requests, General Feedback
- **Rich Metadata**: User agent, URL, session tracking, optional email
- **Validation**: Comprehensive input validation and error handling

### 📊 Analytics Dashboard
- **Real-time Metrics**: Total feedback, average ratings, category breakdown
- **Recent Feedback**: Latest submissions with full details
- **Visual Analytics**: Charts and graphs for feedback trends
- **Admin Authentication**: Secure access to analytics data

### 🔧 Developer Tools
- **Widget Components**: Easy-to-integrate feedback widgets
- **API Endpoints**: RESTful API for custom integrations
- **Testing Scripts**: Automated testing for system validation
- **TypeScript Support**: Full type safety and IntelliSense

## Quick Start

### 1. Environment Setup

Ensure your `.env.local` file includes:

```bash
# Required for feedback storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Required for Slack notifications
SLACK_FEEDBACK_WEBHOOK_URL=your_slack_webhook_url

# Required for admin dashboard access
ADMIN_API_KEY=your_secure_admin_api_key
NEXT_PUBLIC_ADMIN_API_KEY=your_secure_admin_api_key
```

### 2. Add Feedback Widgets

#### Floating Widget (Recommended)
```tsx
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <FeedbackWidget variant="floating" />
    </div>
  )
}
```

#### Inline Widget
```tsx
<FeedbackWidget variant="inline" className="my-8" />
```

#### Action Buttons
```tsx
import { BugReportWidget, FeatureRequestWidget, FeedbackActionsBar } from '@/components/feedback/FeedbackWidget'

{/* Individual buttons */}
<BugReportWidget />
<FeatureRequestWidget />

{/* Combined actions bar */}
<FeedbackActionsBar />
```

### 3. Test the System

Run the automated test script:

```bash
cd frontend
node scripts/test-feedback-system.js
```

This will test:
- Feedback submission
- Input validation
- Analytics retrieval
- API endpoints

## API Reference

### POST /api/feedback

Submit new feedback.

**Request Body:**
```json
{
  "rating": 5,
  "category": "ux",
  "message": "Great user experience!",
  "email": "user@example.com", // optional
  "sessionId": "session_123", // optional
  "url": "/current-page", // optional
  "metadata": {} // optional additional data
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedbackId": "feedback_1234567890_abc123"
}
```

### GET /api/feedback

Retrieve feedback analytics (admin only).

**Headers:**
```
Authorization: Bearer your_admin_api_key
```

**Response:**
```json
{
  "totalFeedback": 24,
  "averageRating": 4.2,
  "categories": {
    "ux": 8,
    "bug": 6,
    "feature": 7,
    "general": 3
  },
  "recentFeedback": [...],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Components

### FeedbackWidget
Main feedback collection component with multiple variants.

**Props:**
- `variant`: `'floating' | 'inline'` - Widget style
- `className`: `string` - Additional CSS classes

### BugReportWidget
Specialized widget for bug reports.

**Props:**
- `page`: `string` - Current page context
- `className`: `string` - Additional CSS classes

### FeatureRequestWidget
Specialized widget for feature requests.

**Props:**
- `className`: `string` - Additional CSS classes

### FeedbackActionsBar
Combined action buttons for bug reports and feature requests.

**Props:**
- `className`: `string` - Additional CSS classes

## Configuration

### Slack Integration

1. Create a Slack webhook: https://api.slack.com/messaging/webhooks
2. Add to environment: `SLACK_FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/...`

### Vercel Blob Storage

1. Enable Vercel Blob: https://vercel.com/docs/storage/vercel-blob
2. Add token to environment: `BLOB_READ_WRITE_TOKEN=your_token`

### Admin Authentication

Generate a secure API key for admin dashboard access:

```bash
# Generate a secure random key
openssl rand -base64 32
```

Add to environment:
```bash
ADMIN_API_KEY=your_generated_key
NEXT_PUBLIC_ADMIN_API_KEY=your_generated_key
```

## Dashboard Access

Visit `/beta-feedback` to access the analytics dashboard. Requires admin authentication.

## Data Storage

Feedback is stored in Vercel Blob with the following structure:
```
feedback/
├── YYYY-MM-DD/
│   ├── feedback_{timestamp}_{random}.json
│   └── ...
└── ...
```

Each feedback file contains:
```json
{
  "id": "feedback_1234567890_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "rating": 5,
  "category": "ux",
  "message": "Great experience!",
  "userAgent": "Mozilla/5.0...",
  "url": "/events",
  "sessionId": "session_123",
  "email": "user@example.com",
  "metadata": {...}
}
```

## Security

- **Input Validation**: All inputs are validated server-side
- **Rate Limiting**: Consider implementing rate limiting for production
- **Authentication**: Admin endpoints require Bearer token authentication
- **Data Sanitization**: User inputs are sanitized before storage

## Monitoring

### Slack Notifications

New feedback triggers Slack notifications with:
- Category emoji and type
- Star rating display
- Full message content
- User context (session, URL, timestamp)

### Error Handling

- API errors are logged to console
- Failed Slack notifications don't block feedback submission
- Storage failures are logged but don't prevent success response

## Troubleshooting

### Common Issues

1. **"SLACK_FEEDBACK_WEBHOOK_URL not configured"**
   - Add the webhook URL to your environment variables

2. **"BLOB_READ_WRITE_TOKEN not configured"**
   - Set up Vercel Blob and add the token

3. **"Unauthorized" on dashboard**
   - Check ADMIN_API_KEY configuration

4. **Widgets not appearing**
   - Ensure components are properly imported
   - Check for CSS conflicts

### Testing

Run the test script to verify system functionality:

```bash
node scripts/test-feedback-system.js
```

Check browser console for client-side errors and server logs for API issues.

## Future Enhancements

- [ ] Email notifications for high-priority feedback
- [ ] Advanced analytics with charts and trends
- [ ] Feedback threading and responses
- [ ] Integration with issue tracking systems
- [ ] A/B testing for feedback prompts
- [ ] Mobile app feedback collection

## Contributing

When adding new feedback categories or modifying the system:

1. Update `categoryConfig` in dashboard
2. Add validation in API route
3. Update component props if needed
4. Test with the test script
5. Update this documentation

## Support

For issues with the feedback system:
1. Check the troubleshooting section
2. Run the test script to isolate problems
3. Check server logs for API errors
4. Verify environment configuration