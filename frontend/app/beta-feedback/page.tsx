'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface FeedbackItem {
  id: string
  timestamp: string
  rating: number
  category: string
  message: string
  userAgent: string
  url: string
  sessionId: string
  email?: string
}

interface FeedbackAnalytics {
  totalFeedback: number
  averageRating: number
  categories: Record<string, number>
  recentFeedback: FeedbackItem[]
  lastUpdated: string
}

const categoryConfig = {
  ux: { label: 'User Experience', icon: ThumbsUp, color: 'bg-blue-500' },
  bug: { label: 'Bug Report', icon: AlertTriangle, color: 'bg-red-500' },
  feature: { label: 'Feature Request', icon: Lightbulb, color: 'bg-green-500' },
  general: { label: 'General Feedback', icon: MessageSquare, color: 'bg-gray-500' }
}

export default function BetaFeedbackDashboard() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)

      // Get admin token from environment (in production, this would be from secure auth)
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'demo-token'

      const response = await fetch('/api/feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      const data = await response.json()
      setAnalytics(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      // Fallback to mock data for development
      const mockAnalytics: FeedbackAnalytics = {
        totalFeedback: 24,
        averageRating: 4.2,
        categories: {
          ux: 8,
          bug: 6,
          feature: 7,
          general: 3
        },
        recentFeedback: [
          {
            id: 'feedback_001',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            rating: 5,
            category: 'ux',
            message: 'Love the new wallet integration! So smooth and intuitive.',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            url: '/events/create',
            sessionId: 'session_123',
            email: 'user1@example.com'
          },
          {
            id: 'feedback_002',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            rating: 3,
            category: 'bug',
            message: 'Having issues connecting my wallet on mobile. Keeps timing out.',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            url: '/wallet/connect',
            sessionId: 'session_456'
          },
          {
            id: 'feedback_003',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            rating: 4,
            category: 'feature',
            message: 'Would love to see NFT badges for event attendance. Great for gamification!',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            url: '/events',
            sessionId: 'session_789',
            email: 'user2@example.com'
          }
        ],
        lastUpdated: new Date().toISOString()
      }

      setAnalytics(mockAnalytics)
      setError('Using demo data - API not available')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading beta feedback analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Beta Feedback Dashboard</h1>
              <p className="text-slate-400">Monitor user feedback and improve the Echain experience</p>
            </div>
            <Button
              onClick={fetchAnalytics}
              disabled={refreshing}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.totalFeedback || 0}</div>
              <p className="text-xs text-slate-400">Beta submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.averageRating?.toFixed(1) || '0.0'}</div>
              <p className="text-xs text-slate-400">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Top Category</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analytics?.categories ? Object.entries(analytics.categories).sort(([,a], [,b]) => b - a)[0]?.[0] : 'None'}
              </div>
              <p className="text-xs text-slate-400">Most feedback type</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Last Updated</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-white">
                {analytics?.lastUpdated ? formatTimeAgo(analytics.lastUpdated) : 'Never'}
              </div>
              <p className="text-xs text-slate-400">Auto-refresh</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Feedback Categories</CardTitle>
            <CardDescription>Breakdown of feedback types received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const count = analytics?.categories[key] || 0
                const percentage = analytics?.totalFeedback ? (count / analytics.totalFeedback * 100).toFixed(1) : '0'

                return (
                  <div key={key} className="text-center">
                    <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                      <config.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-lg font-semibold text-white">{count}</div>
                    <div className="text-sm text-slate-400">{config.label}</div>
                    <div className="text-xs text-slate-500">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Feedback</CardTitle>
            <CardDescription>Latest user feedback submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentFeedback?.map((feedback) => {
                const category = categoryConfig[feedback.category as keyof typeof categoryConfig]

                return (
                  <div key={feedback.id} className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {React.createElement(category.icon, { className: "w-3 h-3" })}
                          {category.label}
                        </Badge>
                        {renderStars(feedback.rating)}
                      </div>
                      <span className="text-xs text-slate-500">{formatTimeAgo(feedback.timestamp)}</span>
                    </div>

                    <p className="text-slate-300 mb-2">{feedback.message}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Session: {feedback.sessionId.slice(-8)}</span>
                      <span>{feedback.url}</span>
                    </div>

                    {feedback.email && (
                      <div className="mt-2 text-xs text-cyan-400">
                        From: {feedback.email}
                      </div>
                    )}
                  </div>
                )
              }) || (
                <div className="text-center py-8 text-slate-400">
                  No feedback received yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}