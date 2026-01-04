'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserFeedbackCollector } from '@/components/analytics/UserFeedbackCollector'
import { MessageSquare, Bug, Lightbulb } from 'lucide-react'

interface FeedbackWidgetProps {
  variant?: 'floating' | 'inline'
  className?: string
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  variant = 'floating',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'floating') {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="sr-only">Give Feedback</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Your Beta Feedback</DialogTitle>
              <DialogDescription>
                Help us improve Echain! Your feedback is invaluable during our beta testing phase.
              </DialogDescription>
            </DialogHeader>
            <UserFeedbackCollector
              onSubmit={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">How are we doing?</h3>
        <p className="text-slate-400 text-sm">Your feedback helps us build a better Echain experience.</p>
      </div>
      <UserFeedbackCollector />
    </div>
  )
}

// Bug Report Widget
interface BugReportWidgetProps {
  page?: string
  className?: string
}

export const BugReportWidget: React.FC<BugReportWidgetProps> = ({
  page = 'current page',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outlined"
          size="small"
          className={`border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 ${className}`}
        >
          <Bug className="w-4 h-4 mr-2" />
          Report Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-400" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue on {page}? Help us fix it by providing details below.
          </DialogDescription>
        </DialogHeader>
        <UserFeedbackCollector
          onSubmit={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// Feature Request Widget
interface FeatureRequestWidgetProps {
  className?: string
}

export const FeatureRequestWidget: React.FC<FeatureRequestWidgetProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outlined"
          size="small"
          className={`border-green-500/20 text-green-400 hover:bg-green-500/10 hover:border-green-500/40 ${className}`}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Suggest Feature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-400" />
            Suggest a Feature
          </DialogTitle>
          <DialogDescription>
            Have an idea to make Echain better? We'd love to hear it!
          </DialogDescription>
        </DialogHeader>
        <UserFeedbackCollector
          onSubmit={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// Combined Feedback Actions Bar
interface FeedbackActionsBarProps {
  className?: string
}

export const FeedbackActionsBar: React.FC<FeedbackActionsBarProps> = ({
  className = ''
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <BugReportWidget />
      <FeatureRequestWidget />
    </div>
  )
}

export default FeedbackWidget