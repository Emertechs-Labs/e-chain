import { NextRequest, NextResponse } from 'next/server'

// Types for feedback data
interface FeedbackData {
  id: string
  timestamp: string
  rating: number
  category: string
  message: string
  userAgent: string
  url: string
  sessionId: string
  email?: string
  userId?: string
  metadata?: Record<string, any>
}

// Slack webhook notification
async function sendSlackNotification(feedback: FeedbackData) {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('SLACK_FEEDBACK_WEBHOOK_URL not configured, skipping Slack notification')
    return
  }

  const categoryEmojis = {
    ux: '🎨',
    bug: '🐛',
    feature: '💡',
    general: '💬'
  }

  const emoji = categoryEmojis[feedback.category as keyof typeof categoryEmojis] || '📝'

  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} New Beta Feedback Received`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Category:* ${feedback.category}`
          },
          {
            type: 'mrkdwn',
            text: `*Rating:* ${'⭐'.repeat(feedback.rating)}${feedback.rating < 5 ? '☆'.repeat(5 - feedback.rating) : ''}`
          },
          {
            type: 'mrkdwn',
            text: `*Time:* ${new Date(feedback.timestamp).toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*URL:* ${feedback.url}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n${feedback.message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Session: ${feedback.sessionId} | User Agent: ${feedback.userAgent.substring(0, 50)}...`
          }
        ]
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    })

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error)
  }
}

// Store feedback in Vercel Blob (for beta analytics)
async function storeFeedback(feedback: FeedbackData) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobToken) {
    console.warn('BLOB_READ_WRITE_TOKEN not configured, skipping feedback storage')
    return
  }

  try {
    // Create a unique filename
    const filename = `feedback/${feedback.timestamp.split('T')[0]}/${feedback.id}.json`

    // Store in Vercel Blob
    const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${blobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    })

    if (!response.ok) {
      console.error('Failed to store feedback in blob:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Error storing feedback:', error)
  }
}

// Validate feedback data
function validateFeedback(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.rating || typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be a number between 1 and 5')
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required')
  } else {
    const validCategories = ['ux', 'bug', 'feature', 'general']
    if (!validCategories.includes(data.category)) {
      errors.push('Category must be one of: ux, bug, feature, general')
    }
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters')
  }

  if (data.email && (typeof data.email !== 'string' || !data.email.includes('@'))) {
    errors.push('Email must be a valid email address')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isValid, errors } = validateFeedback(body)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Create feedback object
    const feedback: FeedbackData = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      rating: body.rating,
      category: body.category,
      message: body.message.trim(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      url: body.url || request.headers.get('referer') || 'Unknown',
      sessionId: body.sessionId || `session_${Date.now()}`,
      email: body.email,
      userId: body.userId,
      metadata: {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        ...body.metadata
      }
    }

    // Store feedback asynchronously (don't block response)
    Promise.all([
      sendSlackNotification(feedback),
      storeFeedback(feedback)
    ]).catch(error => {
      console.error('Error in feedback processing:', error)
    })

    // Log to console for development
    console.log('Beta feedback received:', {
      id: feedback.id,
      rating: feedback.rating,
      category: feedback.category,
      messageLength: feedback.message.length,
      hasEmail: !!feedback.email
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving feedback analytics (admin only)
export async function GET(request: NextRequest) {
  // This would be protected by authentication in production
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  // Simple token validation (use proper JWT in production)
  if (token !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    )
  }

  try {
    // In a real implementation, you'd fetch from your database/blob storage
    // For now, return mock analytics
    const analytics = {
      totalFeedback: 0,
      averageRating: 0,
      categories: {},
      recentFeedback: [],
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching feedback analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}