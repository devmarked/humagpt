'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, Users, Zap } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/90">
        <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
          <span className="text-muted-foreground text-lg">Professional workspace background</span>
        </div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Ready to find your perfect freelancer?
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-8">
          Join thousands of clients who trust Huma GPT for their projects
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary px-8 py-4 text-lg"
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            Start Chatting
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg"
          >
            <Users className="w-6 h-6 mr-2" />
            Browse Freelancers
          </Button>
        </div>
        
        <div className="flex justify-center items-center space-x-8 text-primary-foreground/80">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Instant matching</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>10,000+ freelancers</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Built-in chat</span>
          </div>
        </div>
      </div>
    </section>
  )
}
