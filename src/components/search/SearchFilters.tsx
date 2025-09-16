'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FreelancerSpecialization, ExperienceLevel, FreelancerSearchFilters } from '@/types';
import { X, Filter } from 'lucide-react';

interface SearchFiltersProps {
  availableSpecializations: FreelancerSpecialization[];
  initialFilters: FreelancerSearchFilters;
}

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

export function SearchFilters({ availableSpecializations, initialFilters }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FreelancerSearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Preserve the query
    const currentQuery = params.get('q');
    
    // Clear existing filter params
    params.delete('specializations');
    params.delete('experience');
    params.delete('min_rate');
    params.delete('max_rate');
    params.delete('location');

    // Add new filter params
    if (filters.specializations && filters.specializations.length > 0) {
      params.set('specializations', filters.specializations.join(','));
    }
    
    if (filters.experience_levels && filters.experience_levels.length > 0) {
      params.set('experience', filters.experience_levels.join(','));
    }
    
    if (filters.min_rate) {
      params.set('min_rate', filters.min_rate.toString());
    }
    
    if (filters.max_rate) {
      params.set('max_rate', filters.max_rate.toString());
    }
    
    if (filters.location) {
      params.set('location', filters.location);
    }

    // Update URL
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newUrl);
  }, [filters, router, searchParams]);

  function handleSpecializationToggle(specialization: FreelancerSpecialization) {
    setFilters(prev => {
      const current = prev.specializations || [];
      const isSelected = current.includes(specialization);
      
      return {
        ...prev,
        specializations: isSelected
          ? current.filter(s => s !== specialization)
          : [...current, specialization]
      };
    });
  }

  function handleExperienceToggle(level: ExperienceLevel) {
    setFilters(prev => {
      const current = prev.experience_levels || [];
      const isSelected = current.includes(level);
      
      return {
        ...prev,
        experience_levels: isSelected
          ? current.filter(l => l !== level)
          : [...current, level]
      };
    });
  }

  function handleRateChange(type: 'min' | 'max', value: string) {
    const numValue = value ? parseInt(value) * 100 : undefined; // Convert to cents
    
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'min_rate' : 'max_rate']: numValue
    }));
  }

  function handleLocationChange(location: string) {
    setFilters(prev => ({
      ...prev,
      location: location || undefined
    }));
  }

  function clearFilters() {
    setFilters({});
  }

  function formatSpecializationLabel(spec: FreelancerSpecialization): string {
    return spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const hasActiveFilters = Boolean(
    (filters.specializations && filters.specializations.length > 0) ||
    (filters.experience_levels && filters.experience_levels.length > 0) ||
    filters.min_rate ||
    filters.max_rate ||
    filters.location
  );

  return (
    <div className="space-y-4">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Specializations */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Specializations</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableSpecializations.map((spec) => {
                const isSelected = filters.specializations?.includes(spec) || false;
                return (
                  <label
                    key={spec}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSpecializationToggle(spec)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formatSpecializationLabel(spec)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Experience Level</h4>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map(({ value, label }) => {
                const isSelected = filters.experience_levels?.includes(value) || false;
                return (
                  <label
                    key={value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleExperienceToggle(value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Hourly Rate ($)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="5"
                  value={filters.min_rate ? (filters.min_rate / 100).toString() : ''}
                  onChange={(e) => handleRateChange('min', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <Input
                  type="number"
                  placeholder="1000"
                  min="0"
                  step="5"
                  value={filters.max_rate ? (filters.max_rate / 100).toString() : ''}
                  onChange={(e) => handleRateChange('max', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Location</h4>
            <Input
              type="text"
              placeholder="e.g., San Francisco, Remote"
              value={filters.location || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="text-sm"
            />
          </div>
        </Card>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
            <div className="space-y-2">
              {filters.specializations && filters.specializations.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {formatSpecializationLabel(spec)}
                  <button
                    onClick={() => handleSpecializationToggle(spec)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              
              {filters.experience_levels && filters.experience_levels.map((level) => (
                <Badge
                  key={level}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {EXPERIENCE_LEVELS.find(l => l.value === level)?.label}
                  <button
                    onClick={() => handleExperienceToggle(level)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              
              {(filters.min_rate || filters.max_rate) && (
                <Badge variant="secondary" className="mr-1 mb-1">
                  ${filters.min_rate ? (filters.min_rate / 100) : '0'} - 
                  ${filters.max_rate ? (filters.max_rate / 100) : '∞'}/hr
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, min_rate: undefined, max_rate: undefined }))}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.location && (
                <Badge variant="secondary" className="mr-1 mb-1">
                  {filters.location}
                  <button
                    onClick={() => handleLocationChange('')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
