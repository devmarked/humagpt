'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Heart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ChatInput from '@/components/chat/ChatInput'
import { RightDrawer } from '@/components/ui/right-drawer'
import FreelancerProfile from '@/components/freelancer/FreelancerProfile'
import { searchFreelancersHybrid, searchFreelancersSimplified } from '@/app/actions/hybrid-search'
import type { FreelancerWithScore } from '@/types'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface FreelancerCard {
  id: string
  name: string
  title: string
  location: string
  skills: string[]
  rating: number
  hourlyRate: string
  image: string
  verified: boolean
}

interface SearchState {
  isSearching: boolean
  results: FreelancerWithScore[]
  error: string | null
  hasSearched: boolean
  analysis?: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m Huma GPT, your AI assistant for finding the perfect freelancers. I can understand natural language queries like "Senior React developer with $80/hr rate in San Francisco" or "Entry-level UI designer for mobile apps". What are you looking for?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])

  const [isTyping, setIsTyping] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerWithScore | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    results: [],
    error: null,
    hasSearched: false
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Helper function to format freelancer data for display
  const formatFreelancerForDisplay = (freelancer: FreelancerWithScore): FreelancerCard => {
    const formatRate = (min: number | null, max: number | null) => {
      if (min && max) {
        return `$${Math.floor(min / 100)}-${Math.floor(max / 100)}/hr`
      } else if (min) {
        return `$${Math.floor(min / 100)}+/hr`
      } else {
        return 'Rate negotiable'
      }
    }

    return {
      id: freelancer.id,
      name: freelancer.title, // Using title as name since we don't have separate name field
      title: freelancer.title,
      location: freelancer.location || 'Remote',
      skills: freelancer.skills.slice(0, 6), // Limit skills shown
      rating: freelancer.rating,
      hourlyRate: formatRate(freelancer.hourly_rate_min, freelancer.hourly_rate_max),
      image: '/images/prof.png', // Default image
      verified: freelancer.is_verified
    }
  }

  // Helper function to format freelancer data for the profile drawer
  const formatFreelancerForProfile = (freelancer: FreelancerWithScore) => {
    const formatRate = (min: number | null, max: number | null) => {
      if (min && max) {
        return `$${Math.floor(min / 100)}-${Math.floor(max / 100)}/hr`
      } else if (min) {
        return `$${Math.floor(min / 100)}+/hr`
      } else {
        return 'Rate negotiable'
      }
    }

    return {
      id: freelancer.id,
      name: freelancer.title,
      title: freelancer.title,
      location: freelancer.location || 'Remote',
      skills: freelancer.skills,
      rating: freelancer.rating,
      hourlyRate: formatRate(freelancer.hourly_rate_min, freelancer.hourly_rate_max),
      image: '/images/prof.png',
      verified: freelancer.is_verified,
      // Pass raw database-aligned fields for the profile component mapping
      description: freelancer.description,
      experience_level: freelancer.experience_level,
      languages: freelancer.languages,
      availability_hours_per_week: freelancer.availability_hours_per_week ?? undefined,
      responseTime: `${freelancer.response_time_hours}h`,
      completedProjects: freelancer.projects_completed,
      portfolio: freelancer.portfolio_url ? [freelancer.portfolio_url] : undefined,
      timezone: freelancer.timezone || undefined,
      linkedin: freelancer.linkedin_url || undefined,
      github: freelancer.github_url || undefined,
      website: freelancer.portfolio_url || undefined,
      reviews: [] // No reviews data in our schema yet
    }
  }


  const handleSendMessage = async (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages([...messages, newMessage])
    
    // Show typing indicator and start search
    setIsTyping(true)
    setSearchState(prev => ({ ...prev, isSearching: true, error: null }))
    
    try {
      // AI response acknowledging the search
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Perfect! I'm analyzing: "${message}". Using hybrid AI search (semantic understanding + smart filtering) to find the best matches...`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      
      // Perform the enhanced search
      const searchResult = await searchFreelancersSimplified(message, {
        available_only: true,
        limit: 12
      })
      
      setIsTyping(false)
      
      if (searchResult.success && searchResult.data) {
        setSearchState({
          isSearching: false,
          results: searchResult.data,
          error: null,
          hasSearched: true,
          analysis: searchResult.analysis
        })
        
        // Create a response based on hybrid search results
        let responseText = `Great! I found ${searchResult.data.length} freelancer${searchResult.data.length !== 1 ? 's' : ''} using hybrid search.`
        
        if (searchResult.analysis) {
          const analysis = searchResult.analysis
          
          responseText += ` Used ${analysis.searchMethod} in ${analysis.processingTimeMS}ms.`
          
          if (analysis.aiUsed) {
            responseText += ` AI enhanced query from "${analysis.originalQuery}" to "${analysis.cleanQuery}".`
          }
          
          if (analysis.extractedFilters && Object.keys(analysis.extractedFilters).length > 0) {
            responseText += ` Applied smart filters automatically.`
          }
        }
        
        responseText += ' Check out their profiles below!'
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: responseText,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
      } else {
        setSearchState({
          isSearching: false,
          results: [],
          error: searchResult.error || 'Failed to search freelancers',
          hasSearched: true
        })
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: 'I\'m sorry, I couldn\'t find any freelancers matching your specific requirements right now. Try adjusting your criteria or using more general terms.',
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      setIsTyping(false)
      setSearchState({
        isSearching: false,
        results: [],
        error: 'An unexpected error occurred',
        hasSearched: true
      })
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'I\'m sorry, something went wrong while searching for freelancers. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleFreelancerClick = (freelancer: FreelancerWithScore) => {
    setSelectedFreelancer(freelancer)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedFreelancer(null)
  }


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Huma GPT</h1>
                <p className="text-xs text-gray-600">Your freelancer GPT from finding to managing your projects</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Liked freelancers</span>
              <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">2</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto py-6 pb-24">
          <div className="max-w-4xl mx-auto px-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">H</span>
                    </div>
                    <span className="text-md font-medium text-gray-700">Huma GPT</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-md leading-relaxed">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <div className="flex items-center space-x-2 mt-2 order-1">
                    <span className="text-xs text-gray-500">You</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Huma GPT</span>
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Examples Section */}
          {!searchState.hasSearched && messages.length === 1 && (
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Try these hybrid search examples:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                  {[
                    'Senior React developer with TypeScript',
                    'Experienced Python developer for ML projects',
                    'Creative UI designer for mobile apps',
                    'Full stack developer familiar with Node.js',
                    'Blockchain expert with Solidity experience',
                    'Technical content writer for SaaS'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(example)}
                      className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all text-gray-700 hover:text-gray-900"
                      disabled={isTyping || searchState.isSearching}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">🧠</span>
                        <span className="text-sm">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Freelancer Results Section */}
          {searchState.hasSearched && (
            <div className="space-y-6 mt-8">
              {searchState.isSearching && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-gray-600">Searching with hybrid AI (semantic + filtering)...</p>
                  </div>
                </div>
              )}

              {searchState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{searchState.error}</p>
                </div>
              )}

              {searchState.results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Smart Search Results</h2>
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">{searchState.results.length}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">AI-powered matches with natural language understanding.</p>
                  
                  {/* Freelancer Cards */}
                  <div className="flex space-x-4 overflow-x-auto pb-4">
                    {searchState.results.map((freelancer) => {
                      const displayFreelancer = formatFreelancerForDisplay(freelancer)
                      return (
                        <Card 
                          key={freelancer.id} 
                          className="min-w-[280px] p-4 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleFreelancerClick(freelancer)}
                        >
                          <div className="relative">
                            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">
                                  {freelancer.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <Heart className="absolute top-2 right-2 w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                            {freelancer.similarity_score && freelancer.similarity_score > 0 && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                {Math.round(freelancer.similarity_score * 100)}% match
                              </div>
                            )}
                            {freelancer.is_verified && (
                              <div className="absolute bottom-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{freelancer.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 capitalize">{freelancer.experience_level}</p>
                          <p className="text-xs text-gray-500 mb-3">{freelancer.location || 'Remote'}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {freelancer.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {freelancer.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{freelancer.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {freelancer.rating > 0 ? (
                                <span className="text-sm font-medium text-gray-900">★ {freelancer.rating.toFixed(1)}</span>
                              ) : (
                                <span className="text-sm text-gray-500">New</span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-primary">{displayFreelancer.hourlyRate}</span>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {searchState.results.length === 0 && !searchState.isSearching && !searchState.error && (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                  <p className="text-gray-500">
                    Try adjusting your criteria or using more general terms.
                  </p>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10">
        <ChatInput 
          onSendMessage={handleSendMessage}
          placeholder="Try: 'Senior React developer with TypeScript' or 'Creative UI designer for mobile apps'"
          disabled={isTyping || searchState.isSearching}
        />
      </div>

      {/* Freelancer Detail Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Freelancer Profile"
      >
        {selectedFreelancer && (
          <FreelancerProfile freelancer={formatFreelancerForProfile(selectedFreelancer)} />
        )}
      </RightDrawer>
    </div>
  )
}
