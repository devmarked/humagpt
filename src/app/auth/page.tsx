'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

// Component that uses useSearchParams - needs to be wrapped in Suspense
function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  // Check if this is a recovery session by looking for recovery URL parameters
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const isRecoveryFlow = mode === 'reset' || (token && type === 'recovery')

  useEffect(() => {
    // Don't redirect if we're in recovery flow
    if (isRecoveryFlow) {
      return
    }
    
    // If user is already logged in, redirect to dashboard 
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router, isRecoveryFlow])

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  const handleBackToLogin = () => {
    // Clear the mode parameter and go back to login
    router.push('/auth')
    setIsLogin(true)
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle reset password mode (either via mode=reset or recovery URL parameters)
  if (isRecoveryFlow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Dobby Login Image */}
          <div className="text-center">
            <Image 
              src="/images/dobby_login.png" 
              alt="Dobby Login" 
              width={128}
              height={128}
              className="mx-auto h-32 w-auto"
              priority
            />
          </div>
          
          <ResetPasswordForm onBackToLogin={handleBackToLogin} />
        </div>
      </div>
    )
  }

  // Don't render the auth forms if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Dobby Login Image */}
        <div className="text-center">
          <Image 
            src="/images/dobby_login.png" 
            alt="Dobby Login" 
            width={128}
            height={128}
            className="mx-auto h-32 w-auto"
            priority
          />
        </div>
        
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
}

// Main component that wraps AuthContent in Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  )
}
