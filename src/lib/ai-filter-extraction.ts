import OpenAI from 'openai';
import type { FreelancerSearchFilters, FreelancerSpecialization, ExperienceLevel } from '@/types';


// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Define the schema for filter extraction
const filterExtractionSchema = {
  type: 'object',
  properties: {
    specializations: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'web_development',
          'mobile_development',
          'ui_ux_design',
          'data_science',
          'machine_learning',
          'devops',
          'backend_development',
          'frontend_development',
          'fullstack_development',
          'blockchain',
          'cybersecurity',
          'game_development',
          'digital_marketing',
          'content_writing',
          'graphic_design',
          'video_editing',
          'photography',
          'translation',
          'consulting',
          'project_management'
        ]
      },
      description: 'Array of specializations that match the query - map specific queries to the closest database enum value'
    },
    experience_levels: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['entry', 'intermediate', 'expert']
      },
      description: 'Experience levels mentioned in the query (entry=junior/beginner, intermediate=mid-level, expert=senior/lead)'
    },
    min_rate: {
      type: 'number',
      description: 'Minimum hourly rate in cents (e.g., $50/hr = 5000 cents)'
    },
    max_rate: {
      type: 'number',
      description: 'Maximum hourly rate in cents (e.g., $100/hr = 10000 cents)'
    },
    location: {
      type: 'string',
      description: 'Location mentioned in the query (use "Remote" for remote work)'
    },
    skills: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Specific technical skills or tools mentioned (React, Python, Figma, etc.)'
    },
    availability_hours_per_week: {
      type: 'number',
      description: 'Hours per week availability if mentioned'
    },
    available_only: {
      type: 'boolean',
      description: 'Whether to only show available freelancers'
    }
  },
  required: [],
  additionalProperties: false
} as const;

interface AIFilterExtractionResult {
  success: boolean;
  filters: FreelancerSearchFilters;
  cleanQuery: string;
  confidence: number;
  reasoning?: string;
  error?: string;
}

export async function extractFiltersWithAI(query: string): Promise<AIFilterExtractionResult> {
  if (!openai) {
    console.warn('OpenAI API key not configured, falling back to manual extraction');
    return {
      success: false,
      filters: {},
      cleanQuery: query,
      confidence: 0,
      error: 'OpenAI API key not configured'
    };
  }

  try {
    console.log('🤖 Extracting filters with AI for query:', query);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective for structured extraction
      messages: [
        {
          role: 'system',
          content: `You are a freelancer search filter extraction assistant. Your job is to analyze natural language queries about finding freelancers and extract structured search criteria.

IMPORTANT GUIDELINES:
- AUTOMATICALLY CORRECT SPELLING MISTAKES: If you detect typos in tech terms, job titles, or skills, correct them automatically (e.g., "reakt" → "react", "developr" → "developer", "desinger" → "designer")
- The cleanQuery MUST contain the corrected spelling - this is critical for search quality
- Only extract filters that are explicitly mentioned or strongly implied in the query
- For rates: Convert to cents (e.g., $50/hr = 5000 cents)
- For experience levels: junior/entry-level → "entry", mid-level/intermediate → "intermediate", senior/expert/lead → "expert"
- For location: Use exact city names or "Remote" for remote work
- For specializations: Map keywords to the closest specialization enum value
- Be conservative - don't guess or infer too much

EXAMPLES:
- "Senior React developer" → experience_levels: ["expert"], specializations: ["frontend_development"]
- "Full stack developer remote position" → specializations: ["fullstack_development"], location: "Remote"
- "Python developer $80/hr in NYC" → skills: ["Python"], min_rate: 7200, max_rate: 8800, location: "New York"
- "UI designer with Figma experience" → specializations: ["ui_ux_design"], skills: ["Figma"]
- "UX designer for mobile apps" → specializations: ["ui_ux_design"]
- "Logo designer" → specializations: ["graphic_design"]
- "DevOps engineer" → specializations: ["devops"]
- "Blockchain developer" → specializations: ["blockchain"]
- "Graphic designer for print" → specializations: ["graphic_design"]
- "API developer" → specializations: ["backend_development"]
- "Brand designer" → specializations: ["graphic_design"]
- "Cloud architect" → specializations: ["devops"]
- "developer" → specializations: ["web_development", "backend_development", "frontend_development"]
- "designer" → specializations: ["ui_ux_design", "graphic_design"]

SPELLING CORRECTION EXAMPLES (cleanQuery MUST have corrected spelling):
- "Senior Reakt developr" → experience_levels: ["expert"], specializations: ["frontend_development"], cleanQuery: "Senior React developer"
- "Fullstak desinger" → specializations: ["fullstack_development", "graphic_design"], cleanQuery: "Fullstack designer"
- "Nodejs enginer" → specializations: ["backend_development"], skills: ["Node.js"], cleanQuery: "Node.js engineer"
- "UI desinger with Figma" → specializations: ["ui_ux_design"], skills: ["Figma"], cleanQuery: "UI designer with Figma"
- "Pythn developr" → specializations: ["backend_development"], skills: ["Python"], cleanQuery: "Python developer"
- "Reakt" → specializations: ["frontend_development"], cleanQuery: "React"
- "developr" → specializations: ["web_development", "backend_development", "frontend_development"], cleanQuery: "developer"

Return the extracted filters and a cleaned query with ALL filter-related terms completely removed.

QUERY CLEANING EXAMPLES:
- "Senior React developer with $80/hr rate in San Francisco" → "React developer"
- "Full stack developer remote position with hourly rate of $80" → "full stack developer"  
- "UI designer with Figma experience available 40 hours per week" → "UI designer with Figma experience"
- "Python developer for machine learning projects" → "Python developer machine learning projects"

The cleaned query should contain ONLY the core job description and skills, with all location, rate, experience level, and availability terms removed.`
        },
        {
          role: 'user',
          content: `Extract search filters from this freelancer search query: "${query}"`
        }
      ],
      functions: [
        {
          name: 'extract_search_filters',
          description: 'Extract structured search filters from a freelancer search query and return a cleaned query with corrected spelling and only the core job/skill terms',
          parameters: {
            ...filterExtractionSchema,
            properties: {
              ...filterExtractionSchema.properties,
              cleanQuery: {
                type: 'string',
                description: 'The original query with ALL filter terms removed AND spelling corrected - only core job title and skills should remain with proper spelling (e.g., "full stack developer", "React developer", "UI designer with Figma"). CRITICAL: Correct any typos in the cleanQuery.'
              }
            }
          }
        }
      ],
      function_call: { name: 'extract_search_filters' },
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const extractedFilters = JSON.parse(functionCall.arguments);
    console.log('🎯 AI extracted filters:', extractedFilters);

    // Convert to our internal format and validate
    const filters: FreelancerSearchFilters = {};
    
    if (extractedFilters.specializations?.length > 0) {
      filters.specializations = extractedFilters.specializations as FreelancerSpecialization[];
    }
    
    if (extractedFilters.experience_levels?.length > 0) {
      filters.experience_levels = extractedFilters.experience_levels as ExperienceLevel[];
    }
    
    if (extractedFilters.min_rate) {
      filters.min_rate = extractedFilters.min_rate;
    }
    
    if (extractedFilters.max_rate) {
      filters.max_rate = extractedFilters.max_rate;
    }
    
    if (extractedFilters.location) {
      filters.location = extractedFilters.location;
    }
    
    if (extractedFilters.availability_hours_per_week) {
      filters.availability_hours_per_week = extractedFilters.availability_hours_per_week;
    }
    
    if (extractedFilters.available_only !== undefined) {
      filters.available_only = extractedFilters.available_only;
    }

    // Use the AI's cleaned query if provided, otherwise fall back to original
    let cleanQuery = extractedFilters.cleanQuery || query;
    
    // Additional cleaning to remove common filter-related phrases that AI might miss
    cleanQuery = cleanQuery.replace(/\bwith an hourly rate of\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bwith a rate of\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bwith.*?rate.*?of\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bposition\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bavailable for\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bper week\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bhours?\b/gi, '');
    
    // Clean up extra whitespace and trailing prepositions
    cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();
    cleanQuery = cleanQuery.replace(/\b(?:with|for|in|at|of|and)\s*$/gi, '').trim();

    // Calculate confidence based on how many filters were extracted
    const filterCount = Object.keys(filters).length;
    const confidence = Math.min(0.9, 0.3 + (filterCount * 0.15));

    return {
      success: true,
      filters,
      cleanQuery,
      confidence,
      reasoning: `Extracted ${filterCount} filters from query`
    };

  } catch (error) {
    console.error('❌ AI filter extraction failed:', error);
    return {
      success: false,
      filters: {},
      cleanQuery: query,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fallback manual extraction for when AI is unavailable
export function extractFiltersManually(query: string): { filters: FreelancerSearchFilters; cleanQuery: string } {
  const extractedFilters: FreelancerSearchFilters = {};
  let cleanQuery = query;

  // Experience level extraction
  if (/\b(senior|sr|lead|principal)\b/i.test(query)) {
    extractedFilters.experience_levels = ['expert'];
    cleanQuery = cleanQuery.replace(/\b(senior|sr|lead|principal)\b/gi, '');
  } else if (/\b(junior|jr|entry|entry-level)\b/i.test(query)) {
    extractedFilters.experience_levels = ['entry'];
    cleanQuery = cleanQuery.replace(/\b(junior|jr|entry|entry-level)\b/gi, '');
  } else if (/\b(mid|mid-level|intermediate)\b/i.test(query)) {
    extractedFilters.experience_levels = ['intermediate'];
    cleanQuery = cleanQuery.replace(/\b(mid|mid-level|intermediate)\b/gi, '');
  }

  // Rate extraction (simplified)
  const rateMatch = query.match(/\$(\d+)/);
  if (rateMatch) {
    const rate = parseInt(rateMatch[1]);
    const tolerance = Math.max(5, rate * 0.15);
    extractedFilters.min_rate = Math.max(0, Math.floor((rate - tolerance) * 100));
    extractedFilters.max_rate = Math.ceil((rate + tolerance) * 100);
    
    // Remove rate mentions from query
    cleanQuery = cleanQuery.replace(/\$\d+[-–]?\d*\s*(?:per\s+)?(?:hour|hr|hourly)?/gi, '');
    cleanQuery = cleanQuery.replace(/\b(?:under|below|above|over)\s+\$\d+/gi, '');
    cleanQuery = cleanQuery.replace(/\bwith.*?rate.*?of\b/gi, '');
    cleanQuery = cleanQuery.replace(/\bhourly rate of\b/gi, '');
  }

  // Location extraction
  const remoteMatch = /\b(remote|Remote)\b/gi.exec(query);
  if (remoteMatch) {
    extractedFilters.location = 'Remote';
    cleanQuery = cleanQuery.replace(/\b(remote|position)\b/gi, '');
  }

  // Enhanced specialization extraction - map to existing database enum values
  const specializations: FreelancerSpecialization[] = [];
  
  // Developer specializations (check in order of specificity)
  if (/\bfull.?stack\b/i.test(query)) {
    specializations.push('fullstack_development');
  } else if (/\b(react|vue|angular|frontend|front.?end)\b/i.test(query)) {
    specializations.push('frontend_development');
  } else if (/\b(backend|node\.?js|python|java|php|api)\b/i.test(query)) {
    specializations.push('backend_development');
  } else if (/\bdeveloper\b/i.test(query)) {
    // Catch-all for "developer" - map to general development specializations
    specializations.push('web_development', 'backend_development', 'frontend_development');
  }
  
  if (/\b(mobile|ios|android|react.?native|flutter)\b/i.test(query)) {
    specializations.push('mobile_development');
  }
  
  if (/\b(devops|docker|kubernetes|cloud|aws|azure|gcp|architecture)\b/i.test(query)) {
    specializations.push('devops');
  }
  
  if (/\b(blockchain|crypto|web3|solidity)\b/i.test(query)) {
    specializations.push('blockchain');
  }
  
  if (/\b(game|unity|unreal)\b/i.test(query)) {
    specializations.push('game_development');
  }
  
  if (/\b(cybersecurity|security|penetration)\b/i.test(query)) {
    specializations.push('cybersecurity');
  }
  
  if (/\b(machine.?learning|ml|ai|tensorflow|pytorch)\b/i.test(query)) {
    specializations.push('machine_learning');
  }
  
  if (/\b(data.?science|data.?analyst|analytics)\b/i.test(query)) {
    specializations.push('data_science');
  }
  
  // Designer specializations - map to ui_ux_design or graphic_design
  if (/\b(ui.?ux|ux.?ui|uiux|ui\/ux|ui.?design|user.?interface|interface.?design|ui.?designer|ux.?design|user.?experience|experience.?design|ux.?designer)\b/i.test(query)) {
    specializations.push('ui_ux_design');
  } else if (/\b(graphic.?design|visual.?design|graphic.?designer|logo.?design|logo|logo.?designer|brand.?design|branding|brand.?identity|brand.?designer|print.?design|print|print.?designer|packaging.?design|package.?design|packaging.?designer|illustration|illustrator|drawing|motion.?graphics|animation|after.?effects|motion.?designer|product.?design|industrial.?design|product.?designer|interior.?design|interior|interior.?designer)\b/i.test(query)) {
    specializations.push('graphic_design');
  } else if (/\bdesigner\b/i.test(query)) {
    // Catch-all for "designer" - map to design specializations
    specializations.push('ui_ux_design', 'graphic_design');
  }
  
  if (/\b(video.?editing|video.?editor|premiere|final.?cut|video.?editor)\b/i.test(query)) {
    specializations.push('video_editing');
  }
  
  if (/\b(photography|photographer|photo|photographer)\b/i.test(query)) {
    specializations.push('photography');
  }
  
  // Other specializations
  if (/\b(digital.?marketing|marketing|seo|sem)\b/i.test(query)) {
    specializations.push('digital_marketing');
  }
  if (/\b(content.?writing|copywriting|writing)\b/i.test(query)) {
    specializations.push('content_writing');
  }
  if (/\b(translation|translator|localization)\b/i.test(query)) {
    specializations.push('translation');
  }
  if (/\b(consulting|consultant|advisor)\b/i.test(query)) {
    specializations.push('consulting');
  }
  if (/\b(project.?management|pm|scrum|agile)\b/i.test(query)) {
    specializations.push('project_management');
  }
  
  if (specializations.length > 0) {
    extractedFilters.specializations = specializations;
  }

  // Clean up extra whitespace and trailing prepositions
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();
  cleanQuery = cleanQuery.replace(/\b(?:with|for|in|at|of|and)\s*$/gi, '').trim();

  return { filters: extractedFilters, cleanQuery };
}
