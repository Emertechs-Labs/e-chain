'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Mail, Wallet, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface BetaRegistrationForm {
  email: string
  name: string
  walletAddress: string
  accessCode: string
}

export default function BetaRegistrationPage() {
  const [formData, setFormData] = useState<BetaRegistrationForm>({
    email: '',
    name: '',
    walletAddress: '',
    accessCode: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean
    message: string
    user?: any
  } | null>(null)

  const handleInputChange = (field: keyof BetaRegistrationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setRegistrationResult(null)

    try {
      const response = await fetch('/api/beta-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setRegistrationResult({
          success: true,
          message: result.message,
          user: result.user
        })
        // Reset form on success
        setFormData({
          email: '',
          name: '',
          walletAddress: '',
          accessCode: ''
        })
      } else {
        setRegistrationResult({
          success: false,
          message: result.error || 'Registration failed'
        })
      }
    } catch (error) {
      setRegistrationResult({
        success: false,
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.email && formData.accessCode

  if (registrationResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-md mx-auto pt-20">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Echain Beta!</h2>
                <p className="text-slate-400 mb-4">
                  Your registration has been submitted successfully.
                </p>

                {registrationResult.user && (
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-slate-300 space-y-1">
                      <div><strong>Beta ID:</strong> {registrationResult.user.id}</div>
                      <div><strong>Email:</strong> {registrationResult.user.email}</div>
                      <div><strong>Status:</strong> <Badge variant="secondary">{registrationResult.user.status}</Badge></div>
                    </div>
                  </div>
                )}

                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    We'll review your application within 24 hours and send you access instructions.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => setRegistrationResult(null)}
                  variant="outlined"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Register Another User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-md mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Echain Beta</h1>
          <p className="text-slate-400">
            Be among the first to experience blockchain-powered event ticketing
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Beta Registration
            </CardTitle>
            <CardDescription>
              Register for early access to Echain's beta testing program
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-slate-300">
                  Full Name (Optional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Wallet Address */}
              <div>
                <Label htmlFor="walletAddress" className="text-slate-300">
                  Wallet Address (Optional)
                </Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="walletAddress"
                    type="text"
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  We'll use this to send you test tokens and POAPs
                </p>
              </div>

              {/* Access Code */}
              <div>
                <Label htmlFor="accessCode" className="text-slate-300">
                  Beta Access Code *
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="accessCode"
                    type="password"
                    placeholder="Enter beta access code"
                    value={formData.accessCode}
                    onChange={(e) => handleInputChange('accessCode', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contact the Echain team for access codes
                </p>
              </div>

              {/* Error Message */}
              {registrationResult && !registrationResult.success && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{registrationResult.message}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Join Beta Program'
                )}
              </Button>
            </form>

            {/* Beta Benefits */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-white mb-3">Beta Benefits:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>• Early access to features</div>
                <div>• Shape product development</div>
                <div>• Exclusive NFT rewards</div>
                <div>• Direct team communication</div>
                <div>• Priority support</div>
                <div>• Beta tester recognition</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Questions? Contact us at{' '}
            <a href="mailto:beta@echain.app" className="text-cyan-400 hover:text-cyan-300">
              beta@echain.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}