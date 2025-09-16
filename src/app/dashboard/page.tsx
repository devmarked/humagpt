'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useProfile } from '@/contexts/ProfileContext'
import { Header } from '@/components/dashboard/Header'
import { Overview } from '@/components/dashboard/Overview'

export default function Dashboard() {
  const { user, loading: authLoading } = useRequireAuth()
  const { profile, loading: profileLoading } = useProfile()

  const loading = authLoading || profileLoading

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth page
  }

  const userData = {
    name: profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: profile?.avatar_url || undefined,
    level: 1,
    points: 0
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <Header user={userData} />

        {/* Main Content */}
        <div className="mt-8">
          <Overview />
        </div>
      </div>
    </div>
  )
}
