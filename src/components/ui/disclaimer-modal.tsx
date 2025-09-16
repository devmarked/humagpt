'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface DisclaimerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Small delay to ensure the element is in DOM before animation
      setTimeout(() => setIsVisible(true), 10)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    // Wait for exit animation to complete before calling onClose
    setTimeout(() => {
      setIsAnimating(false)
      onClose()
    }, 300)
  }

  if (!isOpen && !isAnimating) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
            isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/cta.png"
              alt="Background"
              fill
              className="object-cover opacity-10"
              unoptimized
            />
          </div>
          
          {/* Content */}
          <div className="relative p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to DobbyHub
              </h2>
              
              {/* Dobby Hi Image */}
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/dobby_hi.png"
                  alt="Dobby waving hi"
                  width={120}
                  height={120}
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                This is a community-made website by{' '}
                <span className="font-semibold text-orange-600">@cryptokramo</span>.{' '}
                Not officially affiliated with Sentient Foundation
              </p>
            </div>
            
            <Button 
              onClick={handleClose}
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-2 rounded-lg font-medium transition-colors"
            >
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useFirstVisitModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedBefore')
    
    if (!hasVisited) {
      setIsModalOpen(true)
    }
  }, [])

  const closeModal = () => {
    setIsModalOpen(false)
    localStorage.setItem('hasVisitedBefore', 'true')
  }

  return {
    isModalOpen,
    closeModal
  }
}
