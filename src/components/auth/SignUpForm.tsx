'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userExists, setUserExists] = useState(false)
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
  const { signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

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

    const { error } = await signUp(email, password)

    if (error) {
      // Check if the error indicates user already exists
      if (error.message.includes('User already registered') || 
          error.message.includes('already been registered') ||
          error.message.includes('already registered')) {
        setUserExists(true)
      } else {
        setError(error.message)
      }
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setResetPasswordLoading(true)
    setError('')
    
    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error.message)
    } else {
      setResetPasswordSuccess(true)
    }
    
    setResetPasswordLoading(false)
  }

  if (resetPasswordSuccess) {
    return (
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <Button onClick={() => setResetPasswordSuccess(false)} variant="outline" className="w-full">
            Back
          </Button>
        </div>
      </Card>
    )
  }

  if (userExists) {
    return (
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User exists with this email</h2>
          <p className="text-gray-600 mb-6">
            An account with <strong>{email}</strong> already exists.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={onToggleMode} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
            <Button 
              onClick={handleForgotPassword}
              variant="outline" 
              className="w-full"
              disabled={resetPasswordLoading}
            >
              {resetPasswordLoading ? 'Sending...' : 'Forgot Password'}
            </Button>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => {
                setUserExists(false)
                setError('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Try a different email
            </button>
          </div>
        </div>
      </Card>
    )
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent you a confirmation link at <strong>{email}</strong>
          </p>
          <Button onClick={onToggleMode} variant="outline" className="w-full">
            Back to sign in
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="text-gray-600 mt-2">Sign up for a new account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a password"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 text-white"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}
