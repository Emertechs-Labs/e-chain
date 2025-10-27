'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Send, ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react'

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
}

interface BetaAnalytics {
  totalFeedback: number
  averageRating: number
  categoryBreakdown: Record<string, number>
  feedbackTrend: FeedbackData[]
  lastUpdated: string
}

// Hook for beta analytics
const useBetaAnalytics = () => {
  const [analytics, setAnalytics] = useState<BetaAnalytics>({
    totalFeedback: 0,
    averageRating: 0,
    categoryBreakdown: {},
    feedbackTrend: [],
    lastUpdated: new Date().toISOString()
  })

  const updateAnalytics = (newFeedback: FeedbackData) => {
    setAnalytics(prev => {
      const newTrend = [...prev.feedbackTrend, newFeedback].slice(-50) // Keep last 50
      const totalFeedback = newTrend.length
      const averageRating = newTrend.reduce((sum, f) => sum + f.rating, 0) / totalFeedback

      const categoryBreakdown: Record<string, number> = {}
      newTrend.forEach(f => {
        categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1
      })

      return {
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        categoryBreakdown,
        feedbackTrend: newTrend,
        lastUpdated: new Date().toISOString()
      }
    })
  }

  return { analytics, updateAnalytics }
}

// Main component
interface UserFeedbackCollectorProps {
  onSubmit?: (feedback: Omit<FeedbackData, 'id' | 'timestamp' | 'userAgent' | 'url' | 'sessionId'>) => void;
  className?: string;
}

export const UserFeedbackCollector: React.FC<UserFeedbackCollectorProps> = ({
  onSubmit,
  className = ''
}: UserFeedbackCollectorProps) => {
  const [rating, setRating] = useState<number>(0)
  const [category, setCategory] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const { analytics, updateAnalytics } = useBetaAnalytics()

  // Load analytics from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('echain-beta-analytics')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Update analytics state with stored data
        // This would normally come from a proper analytics service
      } catch (error) {
        console.error('Error loading beta analytics:', error)
      }
    }
  }, [])

  // Save analytics to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('echain-beta-analytics', JSON.stringify(analytics))
  }, [analytics])

  const categories = [
    { value: 'ux', label: 'User Experience', icon: ThumbsUp },
    { value: 'bug', label: 'Bug Report', icon: AlertTriangle },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb },
    { value: 'general', label: 'General Feedback', icon: MessageSquare }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!rating || !category || !message.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData = {
        rating,
        category,
        message: message.trim(),
        url: window.location.href,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Submit to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      })

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`)
      }

      const result = await response.json()

      // Update local analytics
      const fullFeedbackData: FeedbackData = {
        id: result.feedbackId || `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        rating,
        category,
        message: message.trim(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: feedbackData.sessionId
      }

      updateAnalytics(fullFeedbackData)

      // Call onSubmit prop if provided
      if (onSubmit) {
        onSubmit({
          rating: feedbackData.rating,
          category: feedbackData.category,
          message: feedbackData.message
        })
      }

      // Reset form
      setRating(0)
      setCategory('')
      setMessage('')
      setSubmitted(true)

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)

    } catch (error) {
      console.error('Error submitting feedback:', error)
      // In a real app, you'd show an error message to the user
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (submitted) {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600">Your input helps us improve Echain for everyone.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Beta Feedback
        </CardTitle>
        <CardDescription>
          Help us improve Echain! Share your experience during beta testing.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How would you rate your experience? *
            </label>
            {renderStars()}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What type of feedback is this? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`flex items-center gap-2 p-3 border rounded-lg text-sm transition-colors ${
                    category === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tell us more *
            </label>
            <Textarea
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Share your thoughts, suggestions, or report any issues..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!rating || !category || !message.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>

        {/* Analytics Summary */}
        {analytics.totalFeedback > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Beta Analytics Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Feedback</div>
                <div className="font-semibold">{analytics.totalFeedback}</div>
              </div>
              <div>
                <div className="text-gray-600">Average Rating</div>
                <div className="font-semibold">{analytics.averageRating}/5</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-gray-600 text-xs mb-1">Categories:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserFeedbackCollector