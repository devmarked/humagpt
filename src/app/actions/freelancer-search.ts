'use server';

import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, isOpenAIConfigured } from '@/lib/openai';
import { parseSearchQuery } from '@/lib/query-parser';
import type { 
  FreelancerWithScore, 
  FreelancerSearchFilters,
  FreelancerSpecialization,
  ExperienceLevel 
} from '@/types';

export interface SearchFreelancersResult {
  success: boolean;
  data?: FreelancerWithScore[];
  error?: string;
  total?: number;
  analysis?: any; // Query analysis for debugging
}

/**
 * Enhanced search freelancers with intelligent natural language parsing
 */
export async function searchFreelancersEnhanced(
  query: string,
  filters: FreelancerSearchFilters = {}
): Promise<SearchFreelancersResult> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    const supabase = await createClient();
    
    // Parse the natural language query
    const { cleanedQuery, extractedFilters, analysis } = parseSearchQuery(query);
    
    console.log('🧠 Enhanced Query Analysis:', {
      originalQuery: query,
      cleanedQuery,
      extractedFilters,
      analysis
    });

    // Merge extracted filters with provided filters (provided filters take precedence)
    const mergedFilters: FreelancerSearchFilters = {
      ...extractedFilters,
      ...filters, // User-provided filters override extracted ones
    };

    // Default filters
    const {
      specializations,
      experience_levels,
      min_rate,
      max_rate,
      location,
      available_only = true,
      similarity_threshold = 0.5,
      limit = 50
    } = mergedFilters;

    console.log('🎯 Final Search Parameters:', {
      cleanedQuery,
      specializations,
      experience_levels,
      min_rate: min_rate ? `$${min_rate / 100}` : 'none',
      max_rate: max_rate ? `$${max_rate / 100}` : 'none',
      location,
      available_only,
      similarity_threshold,
      limit
    });

    // Use the cleaned query (without extracted parameters) for semantic search
    const searchQuery = cleanedQuery || query;

    // Try to generate embedding for semantic search
    let embedding: number[] | null = null;
    if (isOpenAIConfigured()) {
      try {
        console.log('Generating embedding for cleaned query:', searchQuery);
        embedding = await generateEmbedding(searchQuery);
        console.log('Embedding generated:', embedding ? 'Success' : 'Failed');
      } catch (error) {
        console.warn('Failed to generate embedding, falling back to text search:', error);
      }
    } else {
      console.log('OpenAI not configured, using text-only search');
    }

    // Choose search method based on embedding availability
    let result;
    
    if (embedding) {
      // Hybrid search with both vector and text
      console.log('Using enhanced hybrid search');
      
      result = await supabase.rpc('search_freelancers', {
        query_text: searchQuery,
        query_embedding: embedding,
        specialization_filter: specializations || null,
        experience_filter: experience_levels || null,
        min_rate: min_rate || null,
        max_rate: max_rate || null,
        location_filter: location || null,
        available_only,
        similarity_threshold,
        match_limit: limit
      });
    } else {
      // Text-only search fallback
      console.log('Using enhanced text-only search');
      result = await supabase.rpc('search_freelancers_by_text', {
        query_text: searchQuery,
        specialization_filter: specializations || null,
        experience_filter: experience_levels || null,
        min_rate: min_rate || null,
        max_rate: max_rate || null,
        location_filter: location || null,
        available_only,
        match_limit: limit
      });
    }

    if (result.error) {
      console.error('Database search error:', result.error);
      return {
        success: false,
        error: 'Failed to search freelancers',
        analysis
      };
    }

    console.log('✅ Enhanced search completed. Results:', result.data?.length || 0);
    
    // Add analysis info to first few results for debugging
    if (result.data && result.data.length > 0) {
      console.log('📊 Top results:');
      result.data.slice(0, 3).forEach((item: any, i: number) => {
        console.log(`   ${i + 1}. ${item.title}`);
        console.log(`      Rate: $${item.hourly_rate_min ? item.hourly_rate_min / 100 : '?'}-$${item.hourly_rate_max ? item.hourly_rate_max / 100 : '?'}/hr`);
        console.log(`      Experience: ${item.experience_level}`);
        console.log(`      Location: ${item.location || 'Not specified'}`);
        console.log(`      Similarity: ${item.similarity_score ? (item.similarity_score * 100).toFixed(1) + '%' : 'N/A'}`);
      });
    }
    
    return {
      success: true,
      data: result.data || [],
      total: result.data?.length || 0,
      analysis
    };

  } catch (error) {
    console.error('Enhanced search freelancers error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while searching'
    };
  }
}


