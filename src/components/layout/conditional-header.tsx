'use client'

import { usePathname } from 'next/navigation'
import Header from './header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on chat page
  if (pathname === '/chat') {
    return null
  }
  
  return <Header />
}
