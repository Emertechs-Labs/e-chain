import { NextRequest, NextResponse } from 'next/server'

// Types for beta user data
interface BetaUser {
  id: string
  email: string
  name?: string
  walletAddress?: string
  registrationDate: string
  accessCode?: string
  status: 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, any>
}

// In-memory storage for beta users (use database in production)
let betaUsers: BetaUser[] = []

// Validate beta access code
function validateAccessCode(code: string): boolean {
  const validCodes = [
    process.env.BETA_ACCESS_CODE || 'echain-beta-2025',
    process.env.ADMIN_ACCESS_CODE || 'echain-admin-2025'
  ]
  return validCodes.includes(code)
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, walletAddress, accessCode } = body

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!accessCode || !validateAccessCode(accessCode)) {
      return NextResponse.json(
        { error: 'Invalid beta access code' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = betaUsers.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        {
          message: 'Already registered for beta',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            status: existingUser.status,
            registrationDate: existingUser.registrationDate
          }
        },
        { status: 200 }
      )
    }

    // Create new beta user
    const newUser: BetaUser = {
      id: `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      walletAddress,
      registrationDate: new Date().toISOString(),
      accessCode,
      status: 'pending',
      metadata: {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer')
      }
    }

    // Add to storage
    betaUsers.push(newUser)

    // Send welcome email (if configured)
    if (process.env.RESEND_API_KEY && process.env.BETA_FEEDBACK_EMAIL_ENABLED === 'true') {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@echain.app',
            to: email,
            subject: 'Welcome to Echain Beta! 🎉',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Welcome to Echain Beta!</h1>
                <p>Thank you for joining our beta testing program. Your feedback will help us build the best blockchain event platform.</p>

                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>What happens next?</h3>
                  <ul>
                    <li>We'll review your application within 24 hours</li>
                    <li>You'll receive access instructions via email</li>
                    <li>Start exploring and providing feedback!</li>
                  </ul>
                </div>

                <p><strong>Your Beta ID:</strong> ${newUser.id}</p>

                <a href="https://echain-eight.vercel.app" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                  Access Echain Beta
                </a>

                <p style="color: #6b7280; font-size: 14px;">
                  Questions? Reply to this email or join our Discord community.
                </p>
              </div>
            `
          })
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the registration if email fails
      }
    }

    // Send Discord notification
    if (process.env.BETA_FEEDBACK_DISCORD_WEBHOOK) {
      try {
        await fetch(process.env.BETA_FEEDBACK_DISCORD_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            embeds: [{
              title: '🎉 New Beta User Registration',
              color: 0x2563eb,
              fields: [
                { name: 'Email', value: email, inline: true },
                { name: 'Name', value: name || 'Not provided', inline: true },
                { name: 'Wallet', value: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not provided', inline: true },
                { name: 'Status', value: 'Pending Review', inline: true },
                { name: 'Beta ID', value: newUser.id, inline: true }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        })
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError)
      }
    }

    console.log('New beta user registered:', {
      id: newUser.id,
      email,
      status: newUser.status
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for beta access',
      user: {
        id: newUser.id,
        email,
        status: newUser.status,
        registrationDate: newUser.registrationDate
      }
    })

  } catch (error) {
    console.error('Error registering beta user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving beta users (admin only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  // Simple token validation (use proper JWT in production)
  if (token !== process.env.ADMIN_ACCESS_CODE) {
    return NextResponse.json(
      { error: 'Invalid admin token' },
      { status: 403 }
    )
  }

  try {
    const analytics = {
      totalUsers: betaUsers.length,
      pendingUsers: betaUsers.filter(u => u.status === 'pending').length,
      approvedUsers: betaUsers.filter(u => u.status === 'approved').length,
      rejectedUsers: betaUsers.filter(u => u.status === 'rejected').length,
      recentUsers: betaUsers.slice(-10).reverse(),
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      users: betaUsers,
      analytics
    })
  } catch (error) {
    console.error('Error fetching beta users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beta users' },
      { status: 500 }
    )
  }
}