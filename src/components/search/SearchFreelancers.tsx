'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFreelancersProps {
  initialQuery?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchFreelancers({ 
  initialQuery = '', 
  className,
  onSearch 
}: SearchFreelancersProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      if (onSearch) {
        onSearch(query);
      } else {
        // Navigate to search page with query
        const searchParams = new URLSearchParams();
        searchParams.set('q', query.trim());
        router.push(`/search?${searchParams.toString()}`);
      }
    } finally {
      setIsSearching(false);
    }
  }

  const examples = [
    'React developer with TypeScript experience',
    'UI/UX designer for mobile app',
    'Python developer for machine learning project',
    'Freelance content writer for tech blog',
    'Full-stack developer with Node.js skills'
  ];

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Describe what you're looking for... (e.g., React developer with TypeScript experience)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-24 h-14 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSearching}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {!initialQuery && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setQuery(example)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Powered by AI semantic search • Find freelancers by describing your needs in plain English
        </p>
      </div>
    </div>
  );
}
