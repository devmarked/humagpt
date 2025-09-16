'use client'

import { DisclaimerModal, useFirstVisitModal } from '@/components/ui/disclaimer-modal'
import HeroSection from '@/components/sections/HeroSection'
import PartnersSection from '@/components/sections/PartnersSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import CTASection from '@/components/sections/CTASection'

export default function Home() {
  const { isModalOpen, closeModal } = useFirstVisitModal()

  return (
    <div>
      <DisclaimerModal isOpen={isModalOpen} onClose={closeModal} />
      
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  )
}
