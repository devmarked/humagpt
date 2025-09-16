import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  MessageCircle, 
  Heart,
  Award,
  Users,
  Calendar,
  Globe,
  Phone,
  Mail,
  Linkedin,
  Github
} from "lucide-react"

interface FreelancerProfileProps {
  freelancer: {
    id: string
    name: string
    title: string
    location: string
    skills: string[]
    rating: number
    hourlyRate: string
    image: string
    verified: boolean
    // Database fields
    description?: string
    experience_level?: string
    languages?: string[]
    availability_hours_per_week?: number
    // Extended data for detailed view
    responseTime?: string
    completedProjects?: number
    totalEarnings?: string
    portfolio?: string[]
    certifications?: string[]
    education?: string
    timezone?: string
    phone?: string
    email?: string
    linkedin?: string
    github?: string
    website?: string
    reviews?: Array<{
      id: string
      client: string
      rating: number
      comment: string
      project: string
      date: string
    }>
  }
}

export default function FreelancerProfile({ freelancer }: FreelancerProfileProps) {
  // Map database fields to display properties
  const extendedFreelancer = {
    ...freelancer,
    // Use actual database fields
    description: freelancer.description || "No description provided.",
    experience: freelancer.experience_level || "Not specified",
    availability: freelancer.availability_hours_per_week 
      ? `${freelancer.availability_hours_per_week} hours/week` 
      : "Not specified",
    // Fallback data for fields not yet in database
    responseTime: freelancer.responseTime || "Within 24 hours",
    completedProjects: freelancer.completedProjects || 0,
    totalEarnings: freelancer.totalEarnings || "Not disclosed",
    portfolio: freelancer.portfolio || [],
    certifications: freelancer.certifications || [],
    education: freelancer.education || "Not specified",
    timezone: freelancer.timezone || "Not specified",
    phone: freelancer.phone || "Not provided",
    email: freelancer.email || "Not provided",
    linkedin: freelancer.linkedin || "Not provided",
    github: freelancer.github || "Not provided",
    website: freelancer.website || "Not provided",
    reviews: freelancer.reviews || []
  }

  return (
    <div className="space-y-6 p-6 pb-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <img 
            src={extendedFreelancer.image} 
            alt={extendedFreelancer.name}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white"
          />
          {extendedFreelancer.verified && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{extendedFreelancer.name}</h1>
          <p className="text-lg text-gray-600">{extendedFreelancer.title}</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">{extendedFreelancer.location}</span>
          </div>
        </div>

        {/* Rating and Stats */}
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-semibold text-gray-900">{extendedFreelancer.rating}</span>
            <span className="text-sm text-gray-500">(127 reviews)</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{extendedFreelancer.completedProjects}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{extendedFreelancer.totalEarnings}</div>
            <div className="text-xs text-gray-500">Earnings</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button className="flex-1">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact
        </Button>
        <Button variant="outline" className="flex-1">
          <Heart className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* About / Description */}
      {extendedFreelancer.description && extendedFreelancer.description !== "No description provided." && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{extendedFreelancer.description}</p>
        </Card>
      )}

      {/* Skills */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Skills & Technologies</h3>
        <div className="flex flex-wrap gap-2">
          {extendedFreelancer.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-sm">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Experience & Availability */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium text-gray-900">Experience</h4>
          </div>
          <p className="text-sm text-gray-600">{extendedFreelancer.experience}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-500" />
            <h4 className="font-medium text-gray-900">Availability</h4>
          </div>
          <p className="text-sm text-gray-600">{extendedFreelancer.availability}</p>
        </Card>
      </div>

      {/* Pricing */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <h4 className="font-medium text-gray-900">Pricing</h4>
        </div>
        <div className="text-2xl font-bold text-gray-900">{extendedFreelancer.hourlyRate}</div>
        <p className="text-sm text-gray-500">Response time: {extendedFreelancer.responseTime}</p>
      </Card>

      {/* Languages */}
      {extendedFreelancer.languages && extendedFreelancer.languages.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
          <div className="space-y-2">
            {extendedFreelancer.languages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{language}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {extendedFreelancer.certifications && extendedFreelancer.certifications.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
          <div className="space-y-2">
            {extendedFreelancer.certifications.map((cert) => (
              <div key={cert} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{cert}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Education */}
      {extendedFreelancer.education && extendedFreelancer.education !== "Not specified" && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
          <p className="text-sm text-gray-600">{extendedFreelancer.education}</p>
        </Card>
      )}

      {/* Contact Information */}
      {(extendedFreelancer.phone !== "Not provided" || 
        extendedFreelancer.email !== "Not provided" || 
        extendedFreelancer.website !== "Not provided" ||
        extendedFreelancer.linkedin !== "Not provided" ||
        extendedFreelancer.github !== "Not provided") && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-2">
            {extendedFreelancer.phone !== "Not provided" && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{extendedFreelancer.phone}</span>
              </div>
            )}
            {extendedFreelancer.email !== "Not provided" && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{extendedFreelancer.email}</span>
              </div>
            )}
            {extendedFreelancer.website !== "Not provided" && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{extendedFreelancer.website}</span>
              </div>
            )}
            {extendedFreelancer.linkedin !== "Not provided" && (
              <div className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{extendedFreelancer.linkedin}</span>
              </div>
            )}
            {extendedFreelancer.github !== "Not provided" && (
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{extendedFreelancer.github}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Reviews */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Reviews</h3>
        <div className="space-y-4">
          {extendedFreelancer.reviews?.map((review) => (
            <div key={review.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">{review.client}</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{review.project}</span> • {review.date}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Portfolio Preview */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Portfolio Preview</h3>
        <div className="grid grid-cols-3 gap-2">
          {extendedFreelancer.portfolio?.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`Portfolio ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
