import { Suspense } from 'react';
import { SearchFreelancers } from '@/components/search/SearchFreelancers';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { getFeaturedFreelancers, getFreelancerSpecializations } from '@/app/actions/freelancer-search';

interface SearchPageProps {
  searchParams: {
    q?: string;
    specializations?: string;
    experience?: string;
    min_rate?: string;
    max_rate?: string;
    location?: string;
  };
}

function SearchLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-6 w-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  
  // Parse filters from search params
  const filters = {
    specializations: searchParams.specializations ? 
      searchParams.specializations.split(',') as any[] : undefined,
    experience_levels: searchParams.experience ? 
      searchParams.experience.split(',') as any[] : undefined,
    min_rate: searchParams.min_rate ? parseInt(searchParams.min_rate) : undefined,
    max_rate: searchParams.max_rate ? parseInt(searchParams.max_rate) : undefined,
    location: searchParams.location || undefined,
  };

  // Get available specializations for filters
  const specializationsResult = await getFreelancerSpecializations();
  const availableSpecializations = specializationsResult.success ? 
    specializationsResult.data || [] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find the Perfect Freelancer
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Search through our talented pool of freelancers using natural language. 
              Describe what you need and we'll find the best matches for you.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchFreelancers 
              initialQuery={query} 
              className="max-w-3xl mx-auto"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <SearchFilters
                availableSpecializations={availableSpecializations}
                initialFilters={filters}
              />
            </aside>

            {/* Results */}
            <main className="flex-1">
              <Suspense fallback={<SearchLoadingSkeleton />}>
                {query ? (
                  <SearchResults 
                    query={query} 
                    filters={filters}
                  />
                ) : (
                  <FeaturedFreelancers />
                )}
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

async function FeaturedFreelancers() {
  const result = await getFeaturedFreelancers(12);
  
  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
        <p className="text-gray-500">
          Try searching for specific skills or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Featured Freelancers
        </h2>
        <p className="text-gray-600">
          Top-rated freelancers with proven track records
        </p>
      </div>
      
      <div className="grid gap-6">
        {result.data.map((freelancer) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
    </div>
  );
}

function FreelancerCard({ freelancer }: { freelancer: any }) {
  const formatRate = (cents: number | null) => {
    if (!cents) return 'Not specified';
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatSpecializations = (specs: string[]) => {
    return specs.map(spec => 
      spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {freelancer.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="capitalize">{freelancer.experience_level}</span>
            {freelancer.location && <span>{freelancer.location}</span>}
            {freelancer.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{freelancer.rating.toFixed(1)}</span>
                <span>({freelancer.reviews_count})</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {freelancer.hourly_rate_min && freelancer.hourly_rate_max ? 
              `${formatRate(freelancer.hourly_rate_min)} - ${formatRate(freelancer.hourly_rate_max)}/hr` :
              freelancer.hourly_rate_min ? 
                `${formatRate(freelancer.hourly_rate_min)}+/hr` :
                'Rate negotiable'
            }
          </div>
          {freelancer.availability_hours_per_week && (
            <div className="text-sm text-gray-600">
              {freelancer.availability_hours_per_week}h/week
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {freelancer.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {formatSpecializations(freelancer.specializations || []).map((spec) => (
          <span 
            key={spec}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {spec}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(freelancer.skills || []).slice(0, 6).map((skill: string) => (
          <span 
            key={skill}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {skill}
          </span>
        ))}
        {(freelancer.skills || []).length > 6 && (
          <span className="text-xs text-gray-500">
            +{(freelancer.skills || []).length - 6} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{freelancer.projects_completed} projects completed</span>
          <span>Responds in ~{freelancer.response_time_hours}h</span>
        </div>
        
        <div className="flex gap-2">
          {freelancer.portfolio_url && (
            <a 
              href={freelancer.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Portfolio
            </a>
          )}
          {freelancer.github_url && (
            <a 
              href={freelancer.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
