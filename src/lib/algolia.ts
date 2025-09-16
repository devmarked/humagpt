import { algoliasearch } from 'algoliasearch';

// Initialize Algolia client
const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY! // Server-side only
);

// Search client for client-side operations
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

// Note: In Algolia v5, we don't use initIndex anymore - operations are done directly on the client

// Configure index settings
export async function configureAlgoliaIndex() {
  try {
    await client.setSettings({
      indexName: 'freelancers',
      indexSettings: {
      // Searchable attributes (optimized for hybrid approach)
      searchableAttributes: [
        'title',
        '_keywords',
        'skills',
        'specializations'
      ],
      
      // Attributes for faceting (filtering) - Algolia's strength
      attributesForFaceting: [
        'searchable(skills)',
        'searchable(specializations)',
        'searchable(languages)',
        'experience_level',
        'location',
        'available',
        'is_verified'
      ],
      
      // Custom ranking (what makes results better)
      customRanking: [
        'desc(rating)',
        'desc(projects_completed)',
        'asc(hourly_rate_min)'
      ],
      
      // Typo tolerance
      typoTolerance: true,
      minWordsForApprox1: 3,
      minWordsForApprox2: 7,
      
      // Highlighting
      attributesToHighlight: ['title', 'description', 'skills'],
      
      // Snippeting
      attributesToSnippet: ['description:20'],
      
      // Remove exact words ranking criterion
      exactOnSingleWordQuery: 'attribute'
      }
    });
    
    console.log('✅ Algolia index configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Algolia index:', error);
  }
}

// Transform freelancer data for Algolia (optimized for filtering/faceting)
// Note: Keep this lightweight - pgvector handles semantic content
export function transformFreelancerForAlgolia(freelancer: any) {
  return {
    objectID: freelancer.id,
    
    // Basic profile info for display
    title: freelancer.title,
    experience_level: freelancer.experience_level,
    location: freelancer.location,
    
    // Structured data for faceting and filtering
    skills: freelancer.skills || [],
    specializations: freelancer.specializations || [],
    languages: freelancer.languages || [],
    
    // Numeric fields for range filtering
    hourly_rate_min: freelancer.hourly_rate_min ? freelancer.hourly_rate_min / 100 : null,
    hourly_rate_max: freelancer.hourly_rate_max ? freelancer.hourly_rate_max / 100 : null,
    rating: freelancer.rating || 0,
    projects_completed: freelancer.projects_completed || 0,
    response_time_hours: freelancer.response_time_hours || 24,
    
    // Boolean filters
    available: freelancer.is_available || false,
    is_verified: freelancer.is_verified || false,
    
    // Metadata
    created_at: freelancer.created_at,
    updated_at: freelancer.updated_at,
    
    // Minimal searchable text for basic keyword matching
    // (pgvector handles complex semantic search)
    _keywords: [
      freelancer.title,
      ...(freelancer.skills || []),
      freelancer.experience_level,
      freelancer.location
    ].filter(Boolean).join(' ').toLowerCase()
  };
}

// Sync freelancers from Supabase to Algolia
export async function syncFreelancersToAlgolia(freelancers: any[]) {
  try {
    const algoliaRecords = freelancers.map(transformFreelancerForAlgolia);
    
    await client.saveObjects({
      indexName: 'freelancers',
      objects: algoliaRecords
    });
    
    console.log(`✅ Synced ${algoliaRecords.length} freelancers to Algolia`);
    return { success: true, count: algoliaRecords.length };
  } catch (error) {
    console.error('❌ Failed to sync freelancers to Algolia:', error);
    return { success: false, error };
  }
}

// Update a single freelancer in Algolia
export async function updateFreelancerInAlgolia(freelancer: any) {
  try {
    const algoliaRecord = transformFreelancerForAlgolia(freelancer);
    await client.saveObjects({
      indexName: 'freelancers',
      objects: [algoliaRecord]
    });
    
    console.log(`✅ Updated freelancer ${freelancer.id} in Algolia`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to update freelancer ${freelancer.id} in Algolia:`, error);
    return { success: false, error };
  }
}

// Delete a freelancer from Algolia
export async function deleteFreelancerFromAlgolia(freelancerId: string) {
  try {
    await client.deleteObjects({
      indexName: 'freelancers',
      objectIDs: [freelancerId]
    });
    
    console.log(`✅ Deleted freelancer ${freelancerId} from Algolia`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to delete freelancer ${freelancerId} from Algolia:`, error);
    return { success: false, error };
  }
}
