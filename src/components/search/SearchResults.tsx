'use client';

import { useEffect, useState } from 'react';
import { searchFreelancers } from '@/app/actions/freelancer-search';
import type { FreelancerWithScore, FreelancerSearchFilters } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  filters: FreelancerSearchFilters;
}

export function SearchResults({ query, filters }: SearchResultsProps) {
  const [results, setResults] = useState<FreelancerWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await searchFreelancers(query, filters);
        
        if (result.success && result.data) {
          setResults(result.data);
          setTotal(result.total || result.data.length);
        } else {
          setError(result.error || 'Failed to search freelancers');
          setResults([]);
          setTotal(0);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Searching for freelancers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
        <p className="text-gray-500 mb-4">
          Try adjusting your search query or filters to find more results.
        </p>
        <div className="text-sm text-gray-400">
          <p>Tips:</p>
          <ul className="mt-2 space-y-1">
            <li>• Use more general terms</li>
            <li>• Check your spelling</li>
            <li>• Remove some filters</li>
            <li>• Try synonyms or related skills</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Search Results
        </h2>
        <p className="text-gray-600">
          Found {total} freelancer{total !== 1 ? 's' : ''} matching "{query}"
        </p>
      </div>
      
      <div className="grid gap-6">
        {results.map((freelancer) => (
          <FreelancerResultCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
    </div>
  );
}

function FreelancerResultCard({ freelancer }: { freelancer: FreelancerWithScore }) {
  const formatRate = (cents: number | null) => {
    if (!cents) return 'Not specified';
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatSpecializations = (specs: string[]) => {
    return specs.map(spec => 
      spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const hasScore = freelancer.similarity_score !== undefined || freelancer.text_rank !== undefined;
  const score = freelancer.similarity_score || freelancer.text_rank || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {freelancer.title}
            </h3>
            {hasScore && score > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700">
                  {(score * 100).toFixed(0)}% match
                </span>
              </div>
            )}
            {freelancer.is_verified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-blue-700">Verified</span>
              </div>
            )}
          </div>
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
        {(freelancer.skills || []).slice(0, 8).map((skill: string) => (
          <span 
            key={skill}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {skill}
          </span>
        ))}
        {(freelancer.skills || []).length > 8 && (
          <span className="text-xs text-gray-500">
            +{(freelancer.skills || []).length - 8} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{freelancer.projects_completed} projects completed</span>
          <span>Responds in ~{freelancer.response_time_hours}h</span>
          {freelancer.languages && freelancer.languages.length > 0 && (
            <span>{freelancer.languages.join(', ')}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {freelancer.portfolio_url && (
            <a 
              href={freelancer.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Portfolio
            </a>
          )}
          {freelancer.github_url && (
            <a 
              href={freelancer.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              GitHub
            </a>
          )}
          {freelancer.linkedin_url && (
            <a 
              href={freelancer.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
