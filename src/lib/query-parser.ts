import type { FreelancerSearchFilters, FreelancerSpecialization, ExperienceLevel } from '@/types';

interface ParsedQuery {
  cleanedQuery: string;
  extractedFilters: FreelancerSearchFilters;
  analysis: {
    originalQuery: string;
    extractedRates?: string;
    extractedLocation?: string;
    extractedExperience?: string;
    extractedSpecializations?: string[];
    extractedSkills?: string[];
  };
}

// Mapping of natural language to specializations
const SPECIALIZATION_KEYWORDS: Record<string, FreelancerSpecialization[]> = {
  // Web Development
  'web developer': ['web_development', 'frontend_development', 'backend_development', 'fullstack_development'],
  'web development': ['web_development', 'frontend_development', 'backend_development'],
  'frontend': ['frontend_development', 'web_development'],
  'front-end': ['frontend_development', 'web_development'],
  'backend': ['backend_development', 'web_development'],
  'back-end': ['backend_development', 'web_development'],
  'fullstack': ['fullstack_development', 'web_development'],
  'full-stack': ['fullstack_development', 'web_development'],
  'full stack': ['fullstack_development', 'web_development'],
  'react': ['frontend_development', 'web_development'],
  'reactjs': ['frontend_development', 'web_development'],
  'react.js': ['frontend_development', 'web_development'],
  'vue': ['frontend_development', 'web_development'],
  'vuejs': ['frontend_development', 'web_development'],
  'vue.js': ['frontend_development', 'web_development'],
  'angular': ['frontend_development', 'web_development'],
  'javascript': ['frontend_development', 'web_development'],
  'typescript': ['frontend_development', 'web_development'],
  'nodejs': ['backend_development', 'web_development'],
  'node.js': ['backend_development', 'web_development'],
  'node js': ['backend_development', 'web_development'],
  'python': ['backend_development', 'data_science'],
  'django': ['backend_development', 'web_development'],
  'flask': ['backend_development', 'web_development'],
  
  // Mobile Development
  'mobile': ['mobile_development'],
  'ios': ['mobile_development'],
  'android': ['mobile_development'],
  'react native': ['mobile_development'],
  'flutter': ['mobile_development'],
  'app developer': ['mobile_development'],
  
  // Design
  'designer': ['ui_ux_design', 'graphic_design'],
  'ui designer': ['ui_ux_design'],
  'ux designer': ['ui_ux_design'],
  'ui/ux': ['ui_ux_design'],
  'graphic designer': ['graphic_design'],
  'design': ['ui_ux_design', 'graphic_design'],
  
  // Data & ML
  'data scientist': ['data_science', 'machine_learning'],
  'data science': ['data_science'],
  'machine learning': ['machine_learning', 'data_science'],
  'ml engineer': ['machine_learning', 'data_science'],
  'ai developer': ['machine_learning', 'data_science'],
  
  // DevOps
  'devops': ['devops'],
  'dev ops': ['devops'],
  'cloud engineer': ['devops'],
  'infrastructure': ['devops'],
  
  // Other specializations
  'blockchain': ['blockchain'],
  'crypto': ['blockchain'],
  'security': ['cybersecurity'],
  'cybersecurity': ['cybersecurity'],
  'game developer': ['game_development'],
  'game development': ['game_development'],
  'marketing': ['digital_marketing'],
  'content writer': ['content_writing'],
  'copywriter': ['content_writing'],
  'writer': ['content_writing'],
  'video editor': ['video_editing'],
  'photographer': ['photography'],
  'translator': ['translation'],
  'consultant': ['consulting'],
  'project manager': ['project_management'],
  'pm': ['project_management']
};

// Experience level keywords
const EXPERIENCE_KEYWORDS: Record<string, ExperienceLevel> = {
  'junior': 'entry',
  'entry': 'entry',
  'entry-level': 'entry',
  'entry level': 'entry',
  'beginner': 'entry',
  'new': 'entry',
  'fresh': 'entry',
  'graduate': 'entry',
  
  'mid': 'intermediate',
  'middle': 'intermediate',
  'intermediate': 'intermediate',
  'mid-level': 'intermediate',
  'mid level': 'intermediate',
  'experienced': 'intermediate',
  
  'senior': 'expert',
  'expert': 'expert',
  'lead': 'expert',
  'principal': 'expert',
  'architect': 'expert',
  'advanced': 'expert',
  'staff': 'expert'
};

// Common location patterns
const LOCATION_PATTERNS = [
  /(?:in|from|based in|located in|at)\s+([A-Za-z\s,]+?)(?:\s|$|,)/gi,
  /([A-Za-z\s]+),\s*([A-Z]{2})\b/g, // City, State
  /\b(remote|worldwide|global|anywhere)\b/gi,
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,?\s*(?:USA|US|United States|UK|Canada|Australia)\b/gi
];

// Rate extraction patterns
const RATE_PATTERNS = [
  /(?:hourly rate|rate|budget|pay|cost|charge).*?\$(\d+)(?:\s*-\s*\$?(\d+))?/gi,
  /\$(\d+)(?:\s*-\s*\$?(\d+))?(?:\s*(?:\/|per)\s*(?:hour|hr|h))/gi,
  /(\d+)(?:\s*-\s*(\d+))?\s*(?:dollars?|usd)(?:\s*(?:\/|per)\s*(?:hour|hr|h))/gi,
  /budget.*?\$(\d+)(?:\s*-\s*\$?(\d+))?/gi,
  /under\s*\$(\d+)/gi,
  /up\s*to\s*\$(\d+)/gi,
  /maximum.*?\$(\d+)/gi,
  /min.*?\$(\d+)/gi,
  /minimum.*?\$(\d+)/gi
];

/**
 * Enhanced query parser that extracts filters from natural language
 */
export function parseSearchQuery(query: string): ParsedQuery {
  let cleanedQuery = query.trim();
  const extractedFilters: FreelancerSearchFilters = {};
  const analysis: ParsedQuery['analysis'] = {
    originalQuery: query
  };

  // Extract hourly rates
  const rateInfo = extractRates(cleanedQuery);
  if (rateInfo.minRate !== undefined || rateInfo.maxRate !== undefined) {
    extractedFilters.min_rate = rateInfo.minRate;
    extractedFilters.max_rate = rateInfo.maxRate;
    cleanedQuery = rateInfo.cleanedQuery;
    analysis.extractedRates = `$${rateInfo.minRate ? rateInfo.minRate / 100 : '0'} - $${rateInfo.maxRate ? rateInfo.maxRate / 100 : '∞'}`;
  }

  // Extract location
  const locationInfo = extractLocation(cleanedQuery);
  if (locationInfo.location) {
    extractedFilters.location = locationInfo.location;
    cleanedQuery = locationInfo.cleanedQuery;
    analysis.extractedLocation = locationInfo.location;
  }

  // Extract experience level
  const experienceInfo = extractExperience(cleanedQuery);
  if (experienceInfo.level) {
    extractedFilters.experience_levels = [experienceInfo.level];
    cleanedQuery = experienceInfo.cleanedQuery;
    analysis.extractedExperience = experienceInfo.level;
  }

  // Extract specializations
  const specializationInfo = extractSpecializations(cleanedQuery);
  if (specializationInfo.specializations.length > 0) {
    extractedFilters.specializations = specializationInfo.specializations;
    cleanedQuery = specializationInfo.cleanedQuery;
    analysis.extractedSpecializations = specializationInfo.specializations;
  }

  // Clean up the query
  cleanedQuery = cleanedQuery
    .replace(/\s+/g, ' ')
    .replace(/[,;]\s*$/, '')
    .trim();

  return {
    cleanedQuery,
    extractedFilters,
    analysis
  };
}

function extractRates(query: string): { minRate?: number; maxRate?: number; cleanedQuery: string } {
  let cleanedQuery = query;
  let minRate: number | undefined;
  let maxRate: number | undefined;

  for (const pattern of RATE_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex
    const matches = Array.from(query.matchAll(pattern));
    
    for (const match of matches) {
      const rate1 = parseInt(match[1]);
      const rate2 = match[2] ? parseInt(match[2]) : undefined;
      
      if (rate2) {
        // Range: $50-$100
        minRate = Math.min(rate1, rate2) * 100; // Convert to cents
        maxRate = Math.max(rate1, rate2) * 100;
      } else {
        // Single rate: create range with tolerance
        const tolerance = Math.max(10, rate1 * 0.2);
        minRate = Math.max(0, Math.floor((rate1 - tolerance) * 100));
        maxRate = Math.ceil((rate1 + tolerance) * 100);
      }
      
      // Remove the matched text
      cleanedQuery = cleanedQuery.replace(match[0], '').trim();
      break; // Use first match
    }
    
    if (minRate !== undefined) break;
  }

  return { minRate, maxRate, cleanedQuery };
}

function extractLocation(query: string): { location?: string; cleanedQuery: string } {
  let cleanedQuery = query;
  let location: string | undefined;

  for (const pattern of LOCATION_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex
    const match = pattern.exec(query);
    
    if (match) {
      location = match[1]?.trim() || match[0]?.trim();
      if (location) {
        // Clean up location
        location = location.replace(/^(in|from|based in|located in|at)\s+/i, '').trim();
        cleanedQuery = cleanedQuery.replace(match[0], '').trim();
        break;
      }
    }
  }

  return { location, cleanedQuery };
}

function extractExperience(query: string): { level?: ExperienceLevel; cleanedQuery: string } {
  let cleanedQuery = query;
  let level: ExperienceLevel | undefined;

  const queryLower = query.toLowerCase();
  
  for (const [keyword, experienceLevel] of Object.entries(EXPERIENCE_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(queryLower)) {
      level = experienceLevel;
      cleanedQuery = cleanedQuery.replace(regex, '').trim();
      break;
    }
  }

  return { level, cleanedQuery };
}

function extractSpecializations(query: string): { specializations: FreelancerSpecialization[]; cleanedQuery: string } {
  let cleanedQuery = query;
  const specializations: Set<FreelancerSpecialization> = new Set();

  const queryLower = query.toLowerCase();
  
  // Sort keywords by length (longest first) to match more specific terms first
  const sortedKeywords = Object.entries(SPECIALIZATION_KEYWORDS)
    .sort(([a], [b]) => b.length - a.length);

  for (const [keyword, specs] of sortedKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(queryLower)) {
      specs.forEach(spec => specializations.add(spec));
      cleanedQuery = cleanedQuery.replace(regex, '').trim();
    }
  }

  return { 
    specializations: Array.from(specializations), 
    cleanedQuery 
  };
}

