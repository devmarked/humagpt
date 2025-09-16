'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProfile } from '@/contexts/ProfileContext'
import { useAuth } from '@/contexts/AuthContext'

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Australia', 'New Zealand', 'Japan',
  'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico', 'Argentina', 'Other'
]

export function ProfileForm() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    country: profile?.country || '',
    bio: profile?.bio || '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    const { error } = await updateProfile(formData)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }

    setIsSubmitting(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    setError('')

    const { error } = await uploadAvatar(file)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile picture updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }

    setIsUploadingAvatar(false)
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-2">JPG, PNG or GIF. Max size 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? 'Uploading...' : 'Change Picture'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Messages */}
      {message && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <option value="">Select your country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
