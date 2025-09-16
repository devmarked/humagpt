'use client'

import { usePathname } from 'next/navigation'
import Footer from './footer'

export default function FooterWrapper() {
  const pathname = usePathname()
  
  // Don't render footer on chat page
  if (pathname === '/chat') {
    return null
  }
  
  return <Footer />
}
