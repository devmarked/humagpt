'use client'

import { MessageCircle, Search, CheckCircle, Users, Clock, DollarSign } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Describe your project needs",
      description: "Tell us what you need in natural language - skills, experience, budget, timeline, and timezone preferences."
    },
    {
      number: "2", 
      icon: <Search className="w-8 h-8" />,
      title: "AI finds perfect matches",
      description: "Our AI analyzes your requirements and instantly finds freelancers who match your criteria."
    },
    {
      number: "3",
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Connect and collaborate",
      description: "Review profiles, chat with freelancers, and hire the perfect match for your project."
    }
  ]

  return (
    <section className="py-16 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-powered matching, human collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-primary">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Example */}
          <div className="relative">
            <div className="bg-card rounded-2xl shadow-xl p-6">
              {/* Chat Interface Mockup */}
              <div className="w-80 mx-auto bg-foreground rounded-2xl p-4">
                <div className="bg-card rounded-xl p-4 h-96 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg text-sm">
                      Find a React developer with 8 years experience, available in PST timezone
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      I found 12 React developers matching your criteria. Here are the top 3:
                    </div>
                    
                    {/* Freelancer Cards */}
                    <div className="space-y-2">
                      <div className="bg-card border border-border rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-card-foreground">Sarah Chen</span>
                          <span className="text-yellow-500">★ 4.9</span>
                        </div>
                        <p className="text-muted-foreground">Senior React Developer • 8 years exp • PST</p>
                        <p className="text-primary font-semibold">$75/hour</p>
                      </div>
                      
                      <div className="bg-card border border-border rounded-lg p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-card-foreground">Marcus Johnson</span>
                          <span className="text-yellow-500">★ 4.8</span>
                        </div>
                        <p className="text-muted-foreground">Full Stack Developer • 9 years exp • PST</p>
                        <p className="text-primary font-semibold">$85/hour</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
