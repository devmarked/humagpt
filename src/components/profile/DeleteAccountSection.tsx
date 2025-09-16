'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/contexts/ProfileContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function DeleteAccountSection() {
  const { deleteAccount } = useProfile()
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteAccount = async () => {
    if (!user || confirmationText !== 'DELETE') {
      setError('Please type &quot;DELETE&quot; to confirm')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      // First sign out the user
      await signOut()
      
      // Then delete the account
      const { error } = await deleteAccount()

      if (error) {
        setError(error.message)
        setIsDeleting(false)
      } else {
        // Redirect to home page after successful deletion
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsDeleting(false)
    }
  }

  const resetConfirmation = () => {
    setShowConfirmation(false)
    setConfirmationText('')
    setError('')
  }

  return (
    <Card className="p-6 border-red-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
        <p className="text-red-700 mt-1">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>

      {!showConfirmation ? (
        <div>
          <p className="text-gray-600 mb-4">
            Deleting your account will permanently remove all your data, including:
          </p>
          <ul className="text-gray-600 mb-6 ml-4 space-y-1">
            <li>• Your profile information</li>
            <li>• All your uploaded content</li>
            <li>• Your account history</li>
            <li>• Any associated data</li>
          </ul>
          <Button
            variant="outline"
            onClick={() => setShowConfirmation(true)}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Delete Account
          </Button>
        </div>
      ) : (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  This action cannot be undone
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    This will permanently delete your account and all associated data.
                    Type <strong>DELETE</strong> in the field below to confirm.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              Type &quot;DELETE&quot; to confirm:
            </label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="border-red-300 focus-visible:ring-red-500"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
            </Button>
            <Button
              variant="outline"
              onClick={resetConfirmation}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
