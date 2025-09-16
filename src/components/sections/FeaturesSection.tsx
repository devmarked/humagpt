'use client'

import { Users, Shield, Zap, Clock, DollarSign, MessageCircle } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "10,000+ verified freelancers",
      description: "Access to a global network of skilled professionals across all industries and timezones."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI-powered matching", 
      description: "Our advanced AI analyzes your requirements and matches you with the perfect freelancer."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant results",
      description: "Get matched with qualified freelancers in seconds, not hours of searching."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Timezone-aware matching",
      description: "Find freelancers available in your preferred timezone for seamless collaboration."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Transparent pricing",
      description: "Clear, upfront pricing with no hidden fees. Pay only for the work you need."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Built-in chat platform",
      description: "Communicate directly with freelancers through our integrated chat system."
    }
  ]

  return (
    <section className="py-16 px-6 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Why choose Huma GPT?
          </h2>
          <p className="text-xl text-primary-foreground/80">
            The most intelligent way to find and hire freelancers
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 text-primary-foreground">
              <div className="text-primary-foreground mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-primary-foreground/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
