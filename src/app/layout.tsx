import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
import { AuthProvider } from '@/contexts/AuthContext'
import { ProfileProvider } from '@/contexts/ProfileContext'

import ConditionalHeader from '../components/layout/conditional-header'
import FooterWrapper from '@/components/layout/footerWrapper'

export const metadata: Metadata = {
  title: 'Starter Template',
  description: 'A modern starter template built with Next.js, TypeScript, Tailwind CSS, Supabase, and Shadcn UI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <ProfileProvider>
            <ConditionalHeader />
            <main className="flex-1">
              {children}
            </main>
            <FooterWrapper />
          </ProfileProvider>
        </AuthProvider> 
      </body>
    </html>
  )
}
