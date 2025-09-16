'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    
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
          <Button onClick={() => setResetPasswordSuccess(false)} variant="outline" className="w-full bg-orange-600 hover:bg-orange-500">
            Back to sign in
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 text-white"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleForgotPassword}
          disabled={resetPasswordLoading}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resetPasswordLoading ? 'Sending...' : 'Forgot password?'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </Card>
  )
}
