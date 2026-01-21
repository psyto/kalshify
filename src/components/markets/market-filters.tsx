'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { KALSHI_CATEGORIES, KalshiCategory } from '@/lib/kalshi/types';
import { cn } from '@/lib/utils';

export interface MarketFilters {
  search: string;
  categories: string[];
  status: 'all' | 'open' | 'closed' | 'settled';
  minProbability: number;
  maxProbability: number;
  sortBy: 'volume' | 'probability' | 'closing_soon' | 'trending';
}

interface MarketFiltersProps {
  filters: MarketFilters;
  onFiltersChange: (filters: MarketFilters) => void;
  className?: string;
}

export const defaultFilters: MarketFilters = {
  search: '',
  categories: [],
  status: 'open',
  minProbability: 0,
  maxProbability: 100,
  sortBy: 'volume',
};

export function MarketFiltersBar({
  filters,
  onFiltersChange,
  className,
}: MarketFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.status !== 'open' ||
    filters.minProbability > 0 ||
    filters.maxProbability < 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search markets..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as MarketFilters['sortBy'],
            })
          }
          className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="volume">Highest Volume</option>
          <option value="trending">Trending</option>
          <option value="closing_soon">Closing Soon</option>
          <option value="probability">By Probability</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            showAdvanced
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {KALSHI_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filters.categories.includes(category)
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {category}
          </button>
        ))}
        {filters.categories.length > 0 && (
          <button
            onClick={() => onFiltersChange({ ...filters, categories: [] })}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-zinc-900 dark:text-white">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Market Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    status: e.target.value as MarketFilters['status'],
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
              >
                <option value="all">All Markets</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="settled">Settled</option>
              </select>
            </div>

            {/* Probability Range */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Min Probability
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minProbability}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minProbability: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Max Probability
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.maxProbability}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxProbability: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
