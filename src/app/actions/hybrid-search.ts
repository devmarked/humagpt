'use server';

import { searchClient } from '@/lib/algolia';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, isOpenAIConfigured } from '@/lib/openai';
import { extractFiltersWithAI, extractFiltersManually } from '@/lib/ai-filter-extraction';
import type { FreelancerWithScore, FreelancerSearchFilters, FreelancerSpecialization, ExperienceLevel } from '@/types';

interface HybridSearchResult {
  success: boolean;
  data?: FreelancerWithScore[];
  error?: string;
  analysis?: {
    originalQuery: string;
    algoliaResults: number;
    pgvectorResults: number;
    mergedResults: number;
    strategy: 'algolia-primary' | 'pgvector-primary' | 'merged';
    processingTimeMS: number;
  };
}

interface SearchStrategy {
  useAlgolia: boolean;
  usePgvector: boolean;
  primarySource: 'algolia' | 'pgvector';
  mergeStrategy: 'union' | 'intersection' | 'rerank';
  extractedFilters?: FreelancerSearchFilters;
}

/**
 * Intelligent hybrid search combining Algolia and pgvector
 * 
 * Strategy Selection:
 * - Simple filters/facets → Algolia primary
 * - Complex semantic queries → pgvector primary  
 * - Both available → Merge with pgvector re-ranking
 */
export async function searchFreelancersHybrid(
  query: string,
  filters: FreelancerSearchFilters = {}
): Promise<HybridSearchResult> {
  const startTime = Date.now();
  
  try {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    console.log('🔄 Hybrid Search Starting:', {
      query,
      filters,
      timestamp: new Date().toISOString()
    });

    // Extract filters using AI
    const filterExtraction = await extractFiltersFromQuery(query);
    
    // Determine search strategy based on extracted filters
    const strategy = determineSearchStrategy(
      query, 
      filterExtraction.filters,
      filterExtraction.cleanQuery,
      filters,
      filterExtraction.aiUsed,
      filterExtraction.confidence
    );
    
    console.log('🎯 Search Strategy:', {
      ...strategy,
      aiExtraction: filterExtraction.aiUsed,
      confidence: filterExtraction.confidence,
      extractedFilters: filterExtraction.filters,
      cleanQuery: filterExtraction.cleanQuery
    });

    let algoliaResults: any[] = [];
    let pgvectorResults: FreelancerWithScore[] = [];

    // Execute searches based on strategy
    const searchPromises = [];

    // Use extracted filters for more precise search
    const searchFilters = { ...filters, ...strategy.extractedFilters };
    
    // Use clean query for search if AI extraction was successful
    const searchQuery = filterExtraction.aiUsed ? filterExtraction.cleanQuery : query;

    if (strategy.useAlgolia) {
      searchPromises.push(executeAlgoliaSearch(searchQuery, searchFilters));
    }

    if (strategy.usePgvector) {
      searchPromises.push(executePgvectorSearch(searchQuery, searchFilters));
    }

    const results = await Promise.allSettled(searchPromises);

    // Process results
    let algoliaIndex = 0;
    let pgvectorIndex = strategy.useAlgolia ? 1 : 0;

    if (strategy.useAlgolia && results[algoliaIndex].status === 'fulfilled') {
      algoliaResults = (results[algoliaIndex] as any).value || [];
    }

    if (strategy.usePgvector && results[pgvectorIndex].status === 'fulfilled') {
      pgvectorResults = (results[pgvectorIndex] as any).value || [];
    }

    // Merge and rank results
    const finalResults = mergeResults(
      algoliaResults,
      pgvectorResults,
      strategy,
      query
    );

    const processingTime = Date.now() - startTime;

    console.log('✅ Hybrid Search Complete:', {
      algoliaResults: algoliaResults.length,
      pgvectorResults: pgvectorResults.length,
      finalResults: finalResults.length,
      processingTimeMS: processingTime
    });

    return {
      success: true,
      data: finalResults,
      analysis: {
        originalQuery: query,
        algoliaResults: algoliaResults.length,
        pgvectorResults: pgvectorResults.length,
        mergedResults: finalResults.length,
        strategy: strategy.primarySource === 'algolia' ? 'algolia-primary' : 
                 strategy.primarySource === 'pgvector' ? 'pgvector-primary' : 'merged',
        processingTimeMS: processingTime
      }
    };

  } catch (error) {
    console.error('❌ Hybrid search error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during hybrid search'
    };
  }
}

/**
 * Extract filters from natural language query using AI
 */


/**
 * Simplified AI Filter Extraction + pgvector Search
 * No Algolia, no complex merging - just intelligent AI extraction + semantic search
 */
export async function searchFreelancersSimplified(
  query: string,
  filters: FreelancerSearchFilters = {}
): Promise<HybridSearchResult> {
  const startTime = Date.now();
  
  try {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    console.log('🔍 Simplified Search Starting:', {
      query,
      filters,
      timestamp: new Date().toISOString()
    });

    // Step 1: Extract filters using AI
    const filterExtraction = await extractFiltersFromQuery(query);
    
    console.log('🤖 AI Filter Extraction:', {
      originalQuery: query,
      cleanQuery: filterExtraction.cleanQuery,
      extractedFilters: filterExtraction.filters,
      aiUsed: filterExtraction.aiUsed,
      confidence: filterExtraction.confidence
    });

    // Step 2: Merge extracted filters with provided filters
    const searchFilters = { ...filterExtraction.filters, ...filters };
    
    // Step 3: Use clean query for better semantic search
    const searchQuery = filterExtraction.cleanQuery || query;
    
    console.log('🎯 Final Search Parameters:', {
      searchQuery,
      searchFilters,
      processingMode: filterExtraction.aiUsed ? 'AI-Enhanced' : 'Manual-Fallback'
    });

    // Step 4: Execute pgvector search with filters
    const supabase = await createClient();
    
    // Generate embedding for semantic search
    let embedding: number[] | null = null;
    if (isOpenAIConfigured()) {
      try {
        embedding = await generateEmbedding(searchQuery);
        console.log('✅ Embedding generated successfully');
      } catch (error) {
        console.warn('⚠️ Failed to generate embedding, falling back to text search:', error);
      }
    }

    let searchResults;
    
    if (embedding) {
      // Vector + text hybrid search with filters
      console.log('🔍 Using vector + text search');
      searchResults = await supabase.rpc('search_freelancers', {
        query_text: searchQuery,
        query_embedding: embedding,
        specialization_filter: searchFilters.specializations || null,
        experience_filter: searchFilters.experience_levels || null,
        min_rate: searchFilters.min_rate || null,
        max_rate: searchFilters.max_rate || null,
        location_filter: searchFilters.location || null,
        available_only: searchFilters.available_only || true,
        similarity_threshold: 0.2, // Lowered threshold to include more relevant results
        match_limit: searchFilters.limit || 20
      });
    } else {
      // Text-only search with filters
      console.log('🔍 Using text-only search');
      searchResults = await supabase.rpc('search_freelancers_by_text', {
        query_text: searchQuery,
        specialization_filter: searchFilters.specializations || null,
        experience_filter: searchFilters.experience_levels || null,
        min_rate: searchFilters.min_rate || null,
        max_rate: searchFilters.max_rate || null,
        location_filter: searchFilters.location || null,
        available_only: searchFilters.available_only || true,
        match_limit: searchFilters.limit || 20
      });
    }

    if (searchResults.error) {
      console.error('❌ Database search error:', searchResults.error);
      return {
        success: false,
        error: 'Failed to search freelancers'
      };
    }

    const results = searchResults.data || [];
    const processingTime = Date.now() - startTime;

    console.log('✅ Simplified Search Complete:', {
      resultsCount: results.length,
      processingTimeMS: processingTime,
      topResult: results[0] ? {
        title: results[0].title,
        location: results[0].location,
        specializations: results[0].specializations,
        similarity: results[0].similarity_score
      } : 'No results'
    });

    return {
      success: true,
      data: results,
      analysis: {
        originalQuery: query,
        cleanQuery: searchQuery,
        extractedFilters: filterExtraction.filters,
        aiUsed: filterExtraction.aiUsed,
        confidence: filterExtraction.confidence,
        resultsCount: results.length,
        processingTimeMS: processingTime,
        searchMethod: embedding ? 'vector+text' : 'text-only'
      }
    };

  } catch (error) {
    console.error('❌ Simplified search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

async function extractFiltersFromQuery(query: string): Promise<{
  filters: FreelancerSearchFilters;
  cleanQuery: string;
  aiUsed: boolean;
  confidence: number;
}> {
  // Try AI extraction first
  const aiResult = await extractFiltersWithAI(query);
  
  if (aiResult.success) {
    console.log('🤖 AI filter extraction successful:', {
      filters: aiResult.filters,
      cleanQuery: aiResult.cleanQuery,
      confidence: aiResult.confidence
    });
    
    return {
      filters: aiResult.filters,
      cleanQuery: aiResult.cleanQuery,
      aiUsed: true,
      confidence: aiResult.confidence
    };
  } else {
    console.log('⚠️ AI extraction failed, falling back to manual extraction:', aiResult.error);
    
    // Fallback to manual extraction
    const manualResult = extractFiltersManually(query);
    
    return {
      filters: manualResult.filters,
      cleanQuery: manualResult.cleanQuery,
      aiUsed: false,
      confidence: 0.5 // Lower confidence for manual extraction
    };
  }
}

/**
 * Determine optimal search strategy based on query characteristics and extracted filters
 */
function determineSearchStrategy(
  query: string, 
  extractedFilters: FreelancerSearchFilters,
  cleanQuery: string,
  providedFilters: FreelancerSearchFilters,
  aiUsed: boolean,
  confidence: number
): SearchStrategy {
  // Merge provided filters with extracted filters
  const allFilters = {
    ...extractedFilters,
    ...providedFilters // Provided filters override extracted ones
  };

  const hasStrictFilters = !!(
    allFilters.experience_levels?.length ||
    allFilters.location ||
    allFilters.min_rate ||
    allFilters.max_rate ||
    allFilters.specializations?.length
  );

  // Use clean query for semantic analysis if AI was used
  const queryForAnalysis = aiUsed ? cleanQuery : query;
  const isSemanticQuery = queryForAnalysis.length > 15 || 
    /\b(experience|skilled|expert|proficient|familiar|background|build|develop|create|work on|project)\b/i.test(queryForAnalysis);

  const isSimpleKeyword = queryForAnalysis.split(' ').length <= 2 && 
    !/[.,!?;:]/.test(queryForAnalysis) &&
    !isSemanticQuery &&
    !hasStrictFilters;

  console.log('🎯 Strategy Analysis:', {
    originalQuery: query,
    cleanQuery: queryForAnalysis,
    hasStrictFilters,
    isSemanticQuery,
    isSimpleKeyword,
    extractedFilters,
    allFilters,
    aiUsed,
    confidence
  });

  // Strategy decision logic - AI extraction enables more precise filtering
  if (hasStrictFilters && aiUsed && confidence > 0.7) {
    // High confidence AI extraction with filters → strict intersection
    return {
      useAlgolia: true,
      usePgvector: true,
      primarySource: 'algolia',
      mergeStrategy: 'intersection',
      extractedFilters: allFilters
    };
  }

  if (hasStrictFilters) {
    // Filters present but lower confidence → rerank for safety
    return {
      useAlgolia: true,
      usePgvector: true,
      primarySource: 'algolia',
      mergeStrategy: 'rerank',
      extractedFilters: allFilters
    };
  }

  if (isSemanticQuery && !hasStrictFilters) {
    return {
      useAlgolia: false,
      usePgvector: true,
      primarySource: 'pgvector',
      mergeStrategy: 'union',
      extractedFilters: allFilters
    };
  }

  if (isSimpleKeyword) {
    return {
      useAlgolia: true,
      usePgvector: false,
      primarySource: 'algolia',
      mergeStrategy: 'union',
      extractedFilters: allFilters
    };
  }

  // Default: Use both with intelligent merging
  return {
    useAlgolia: true,
    usePgvector: true,
    primarySource: aiUsed ? 'algolia' : 'pgvector',
    mergeStrategy: 'rerank',
    extractedFilters: allFilters
  };
}

/**
 * Execute Algolia search (optimized for filtering and faceting)
 */
async function executeAlgoliaSearch(query: string, filters: FreelancerSearchFilters): Promise<any[]> {
  try {
    const searchOptions: any = {
      hitsPerPage: filters.limit || 50,
      facetFilters: [],
      numericFilters: []
    };

    // Add facet filters
    if (filters.available_only) {
      searchOptions.facetFilters.push('available:true');
    }

    if (filters.specializations?.length) {
      const specFilters = filters.specializations.map(spec => `specializations:${spec}`);
      searchOptions.facetFilters.push(specFilters);
    }

    if (filters.experience_levels?.length) {
      const expFilters = filters.experience_levels.map(level => `experience_level:${level}`);
      searchOptions.facetFilters.push(expFilters);
    }

    if (filters.location) {
      // Use exact match without quotes for location filtering (Algolia syntax)
      searchOptions.facetFilters.push(`location:${filters.location}`);
    }

    // Add numeric filters for rates
    if (filters.min_rate) {
      searchOptions.numericFilters.push(`hourly_rate_min >= ${filters.min_rate / 100}`);
    }

    if (filters.max_rate) {
      searchOptions.numericFilters.push(`hourly_rate_max <= ${filters.max_rate / 100}`);
    }

    const searchResponse = await searchClient.search({
      requests: [{
        indexName: 'freelancers',
        query: query,
        ...searchOptions
      }]
    });

    const searchResults = searchResponse.results[0];
    
    // Transform to consistent format
    return (searchResults as any).hits.map((hit: any) => ({
      ...hit,
      algolia_score: hit._rankingInfo?.nbExactWords || 0,
      source: 'algolia'
    }));

  } catch (error) {
    console.error('❌ Algolia search failed:', error);
    return [];
  }
}

/**
 * Execute pgvector search (optimized for semantic understanding)
 */
async function executePgvectorSearch(query: string, filters: FreelancerSearchFilters): Promise<FreelancerWithScore[]> {
  try {
    const supabase = await createClient();
    
    // Generate embedding for semantic search
    let embedding: number[] | null = null;
    if (isOpenAIConfigured()) {
      try {
        embedding = await generateEmbedding(query);
      } catch (error) {
        console.warn('Failed to generate embedding, using text search:', error);
      }
    }

    let result;
    
    if (embedding) {
      // Vector + text hybrid search
      result = await supabase.rpc('search_freelancers', {
        query_text: query,
        query_embedding: embedding,
        specialization_filter: filters.specializations || null,
        experience_filter: filters.experience_levels || null,
        min_rate: filters.min_rate || null,
        max_rate: filters.max_rate || null,
        location_filter: filters.location || null,
        available_only: filters.available_only || true,
        similarity_threshold: 0.2, // Lowered threshold to include more relevant results
        match_limit: filters.limit || 50
      });
    } else {
      // Text-only fallback
      result = await supabase.rpc('search_freelancers_by_text', {
        query_text: query,
        specialization_filter: filters.specializations || null,
        experience_filter: filters.experience_levels || null,
        min_rate: filters.min_rate || null,
        max_rate: filters.max_rate || null,
        location_filter: filters.location || null,
        available_only: filters.available_only || true,
        match_limit: filters.limit || 50
      });
    }

    if (result.error) {
      console.error('pgvector search error:', result.error);
      return [];
    }

    return (result.data || []).map((freelancer: any) => ({
      ...freelancer,
      source: 'pgvector'
    }));

  } catch (error) {
    console.error('❌ pgvector search failed:', error);
    return [];
  }
}

/**
 * Merge results from both sources using intelligent ranking
 */
function mergeResults(
  algoliaResults: any[],
  pgvectorResults: FreelancerWithScore[],
  strategy: SearchStrategy,
  query: string
): FreelancerWithScore[] {
  
  if (strategy.mergeStrategy === 'union') {
    // Simple union - combine unique results
    const seen = new Set<string>();
    const merged: FreelancerWithScore[] = [];

    const primaryResults = strategy.primarySource === 'algolia' ? algoliaResults : pgvectorResults;
    const secondaryResults = strategy.primarySource === 'algolia' ? pgvectorResults : algoliaResults;

    // Add primary results first
    for (const result of primaryResults) {
      const id = result.objectID || result.id;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(transformToFreelancerWithScore(result));
      }
    }

    // Add secondary results
    for (const result of secondaryResults) {
      const id = result.objectID || result.id;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(transformToFreelancerWithScore(result));
      }
    }

    return merged;
  }

  if (strategy.mergeStrategy === 'intersection') {
    // Intersection - only return results found by both engines (strict filtering)
    const algoliaIds = new Set(algoliaResults.map(r => r.objectID));
    const pgvectorMap = new Map(pgvectorResults.map(r => [r.id, r]));

    const intersectionResults: FreelancerWithScore[] = [];
    
    // Only include results that appear in both engines
    for (const pgResult of pgvectorResults) {
      if (algoliaIds.has(pgResult.id)) {
        intersectionResults.push({
          ...pgResult,
          hybrid_score: (pgResult.similarity_score || 0) * 0.8 + 0.2 // High confidence for intersection
        });
      }
    }

    // Sort by hybrid score (semantic relevance prioritized for intersection)
    return intersectionResults.sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0));
  }

  if (strategy.mergeStrategy === 'rerank') {
    // Use Algolia for filtering, pgvector for ranking
    const algoliaIds = new Set(algoliaResults.map(r => r.objectID));
    const pgvectorMap = new Map(pgvectorResults.map(r => [r.id, r]));

    // Start with pgvector results that also appear in Algolia
    const reranked: FreelancerWithScore[] = [];
    
    for (const pgResult of pgvectorResults) {
      if (algoliaIds.has(pgResult.id)) {
        reranked.push({
          ...pgResult,
          hybrid_score: (pgResult.similarity_score || 0) * 0.7 + 0.3 // Boost semantic matches
        });
      }
    }

    // Add remaining Algolia results
    for (const algResult of algoliaResults) {
      if (!pgvectorMap.has(algResult.objectID)) {
        reranked.push({
          ...transformToFreelancerWithScore(algResult),
          hybrid_score: (algResult.algolia_score || 0) * 0.3 // Lower score for Algolia-only
        });
      }
    }

    // FALLBACK: If no overlap and one engine has results, use those results
    if (reranked.length === 0) {
      console.log('⚠️ No overlap between engines, falling back to available results');
      
      if (pgvectorResults.length > 0) {
        console.log(`Using ${pgvectorResults.length} pgvector results as fallback`);
        return pgvectorResults.map(result => ({
          ...result,
          hybrid_score: (result.similarity_score || 0) * 0.6 // Lower confidence for single-engine
        })).sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0));
      }
      
      if (algoliaResults.length > 0) {
        console.log(`Using ${algoliaResults.length} Algolia results as fallback`);
        return algoliaResults.map(result => ({
          ...transformToFreelancerWithScore(result),
          hybrid_score: 0.4 // Lower confidence for single-engine
        }));
      }
    }

    // Sort by hybrid score
    return reranked.sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0));
  }

  // Default: return primary source
  const primary = strategy.primarySource === 'algolia' ? algoliaResults : pgvectorResults;
  return primary.map(transformToFreelancerWithScore);
}

/**
 * Transform Algolia result to FreelancerWithScore format
 */
function transformToFreelancerWithScore(result: any): FreelancerWithScore {
  if (result.source === 'algolia') {
    return {
      id: result.objectID,
      user_id: null, // Not stored in Algolia
      title: result.title,
      description: result.description || '',
      specializations: result.specializations || [],
      skills: result.skills || [],
      experience_level: result.experience_level,
      hourly_rate_min: result.hourly_rate_min ? Math.round(result.hourly_rate_min * 100) : null,
      hourly_rate_max: result.hourly_rate_max ? Math.round(result.hourly_rate_max * 100) : null,
      availability_hours_per_week: null,
      portfolio_url: result.portfolio_url,
      github_url: result.github_url,
      linkedin_url: result.linkedin_url,
      location: result.location,
      timezone: result.timezone,
      languages: result.languages || [],
      rating: result.rating || 0,
      reviews_count: 0,
      projects_completed: result.projects_completed || 0,
      response_time_hours: result.response_time_hours || 24,
      is_available: result.available || false,
      is_verified: result.is_verified || false,
      created_at: result.created_at,
      updated_at: result.updated_at,
      similarity_score: result.algolia_score || 0.5,
      _highlightResult: result._highlightResult,
      _snippetResult: result._snippetResult
    };
  }

  // Already in correct format from pgvector
  return result;
}
