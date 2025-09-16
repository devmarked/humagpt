'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { DeleteAccountSection } from '@/components/profile/DeleteAccountSection'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
            <Link href="/dashboard">
              <button className="text-blue-600 hover:text-blue-500 font-medium">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Form */}
          <ProfileForm />

          {/* Account Deletion */}
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  )
}
