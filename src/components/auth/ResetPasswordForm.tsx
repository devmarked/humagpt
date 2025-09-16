'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface ResetPasswordFormProps {
  onBackToLogin: () => void
}

export function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
      }
    })

    // Also check if we have recovery parameters in the URL
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    const mode = searchParams.get('mode')
    
    // If we're on this form, we should have either recovery URL params or mode=reset
    if (token && type === 'recovery') {
      setIsRecoverySession(true)
    } else if (mode === 'reset') {
      setIsRecoverySession(true)
    } else {
      // No recovery indicators at all
      setError('Invalid reset link. Please request a new password reset.')
    }

    return () => subscription.unsubscribe()
  }, [searchParams, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // Check if we have a valid recovery session
      if (!isRecoverySession) {
        setError('Invalid reset link. Please request a new password reset.')
        setLoading(false)
        return
      }

      // Update password using the recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You will be redirected to your dashboard shortly.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
            Go to Dashboard
          </Button>
        </div>
      </Card>
    )
  }

  // Show loading while we wait for recovery session detection
  if (!isRecoverySession && !error) {
    return (
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Reset Link</h2>
          <p className="text-gray-600">Please wait while we verify your password reset link...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your new password"
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your new password"
            minLength={6}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBackToLogin}
          className="text-sm text-gray-600 hover:text-gray-500"
        >
          Back to sign in
        </button>
      </div>
    </Card>
  )
}
