// Common types for the Starter Template

// ---- Auth / User ----
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// Aligns with common Supabase profile shapes (snake_case + ISO strings)
export interface UserProfile {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  country: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  username?: string
  full_name?: string
  country?: string
  bio?: string
  avatar_url?: string
}

// ---- API Helpers ----
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ---- Freelancer Types ----
// Database enum values (must match the database schema exactly)
export type FreelancerSpecialization = 
  | 'web_development'
  | 'mobile_development'
  | 'ui_ux_design'
  | 'data_science'
  | 'machine_learning'
  | 'devops'
  | 'backend_development'
  | 'frontend_development'
  | 'fullstack_development'
  | 'blockchain'
  | 'cybersecurity'
  | 'game_development'
  | 'digital_marketing'
  | 'content_writing'
  | 'graphic_design'
  | 'video_editing'
  | 'photography'
  | 'translation'
  | 'consulting'
  | 'project_management';

export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export interface Freelancer {
  id: string
  user_id: string | null
  title: string
  description: string
  specializations: FreelancerSpecialization[]
  skills: string[]
  experience_level: ExperienceLevel
  hourly_rate_min: number | null // in cents
  hourly_rate_max: number | null // in cents
  availability_hours_per_week: number | null
  portfolio_url: string | null
  github_url: string | null
  linkedin_url: string | null
  location: string | null
  timezone: string | null
  languages: string[]
  rating: number
  reviews_count: number
  projects_completed: number
  response_time_hours: number
  is_available: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface FreelancerWithScore extends Freelancer {
  similarity_score?: number
  text_rank?: number
  hybrid_score?: number
  _highlightResult?: any
  _snippetResult?: any
}

export interface FreelancerSearchFilters {
  specializations?: FreelancerSpecialization[]
  experience_levels?: ExperienceLevel[]
  min_rate?: number // in cents
  max_rate?: number // in cents
  location?: string
  skills?: string[]
  availability_hours_per_week?: number
  available_only?: boolean
  similarity_threshold?: number
  limit?: number
}

export interface FreelancerCreateData {
  title: string
  description: string
  specializations: FreelancerSpecialization[]
  skills: string[]
  experience_level: ExperienceLevel
  hourly_rate_min?: number
  hourly_rate_max?: number
  availability_hours_per_week?: number
  portfolio_url?: string
  github_url?: string
  linkedin_url?: string
  location?: string
  timezone?: string
  languages?: string[]
}

export interface FreelancerUpdateData extends Partial<FreelancerCreateData> {
  is_available?: boolean
}