'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              Huma GPT
            </Link>
            <p className="text-sm text-muted-foreground">AI-powered freelancer matching platform</p>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
            <Link href="/chat" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
              Find Freelancers
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}
