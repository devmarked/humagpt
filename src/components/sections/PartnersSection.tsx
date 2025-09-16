'use client'

import { Code, Palette, PenTool, BarChart3, Camera, Headphones } from 'lucide-react'

export default function PartnersSection() {
  const freelancerCategories = [
    { 
      name: "Web Development", 
      icon: <Code className="w-8 h-8" />, 
      count: "2,500+",
      color: "bg-blue-100 text-blue-600"
    },
    { 
      name: "UI/UX Design", 
      icon: <Palette className="w-8 h-8" />, 
      count: "1,800+",
      color: "bg-purple-100 text-purple-600"
    },
    { 
      name: "Content Writing", 
      icon: <PenTool className="w-8 h-8" />, 
      count: "3,200+",
      color: "bg-green-100 text-green-600"
    },
    { 
      name: "Digital Marketing", 
      icon: <BarChart3 className="w-8 h-8" />, 
      count: "1,900+",
      color: "bg-orange-100 text-orange-600"
    },
    { 
      name: "Photography", 
      icon: <Camera className="w-8 h-8" />, 
      count: "1,100+",
      color: "bg-pink-100 text-pink-600"
    },
    { 
      name: "Audio/Video", 
      icon: <Headphones className="w-8 h-8" />, 
      count: "800+",
      color: "bg-indigo-100 text-indigo-600"
    }
  ]

  const topFreelancers = [
    { name: "Sarah Chen", title: "Senior React Developer", rating: 4.9, projects: 150, avatar: "SC" },
    { name: "Marcus Johnson", title: "UI/UX Designer", rating: 4.8, projects: 89, avatar: "MJ" },
    { name: "Elena Rodriguez", title: "Content Writer", rating: 4.9, projects: 200, avatar: "ER" },
    { name: "David Kim", title: "Full Stack Developer", rating: 4.7, projects: 120, avatar: "DK" },
    { name: "Lisa Wang", title: "Digital Marketer", rating: 4.8, projects: 95, avatar: "LW" },
    { name: "Alex Thompson", title: "Video Editor", rating: 4.9, projects: 75, avatar: "AT" }
  ]

  return (
    <div className="py-16 px-6">
      {/* Freelancer Categories Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore freelancer categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Find skilled professionals across all major industries
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {freelancerCategories.map((category, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} freelancers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Freelancers Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet our top-rated freelancers
          </h2>
          <p className="text-lg text-muted-foreground">
            Verified professionals ready to work on your projects
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {topFreelancers.map((freelancer, index) => (
            <div key={index} className="text-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                {freelancer.avatar}
              </div>
              <h3 className="font-semibold text-card-foreground text-sm mb-1">{freelancer.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{freelancer.title}</p>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-yellow-500">★</span>
                <span className="text-xs text-muted-foreground">{freelancer.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{freelancer.projects} projects</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
