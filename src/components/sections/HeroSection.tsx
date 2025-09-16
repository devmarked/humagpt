'use client'

import { Button } from '@/components/ui/button'
import { Search, Play, Users, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  const suggestedQueries = [
    "Find a React developer with 5+ years experience",
    "Need a Python freelancer available in EST timezone", 
    "Looking for a UI/UX designer for mobile app",
    "Find a content writer with SEO expertise"
  ]

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Find the perfect freelancer
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Huma GPT - Your intelligent freelancer matching platform
            </p>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-muted-foreground">10,000+ verified freelancers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-muted-foreground">AI-powered matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-muted-foreground">Instant results</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Find a freelancer with 8 years experience in React, available in PST timezone"
                className="w-full px-6 py-4 text-lg border-2 border-input rounded-lg focus:outline-none focus:border-primary"
              />
              <Link href="/chat" tabIndex={-1} className="absolute right-2 top-2">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
                  asChild
                >
                  <span>
                    <Search className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Suggested Queries */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              >
                {query}
              </Button>
            ))}
          </div>

          {/* Learn More Link */}
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <span>Learn more about Huma GPT</span>
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm">+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
