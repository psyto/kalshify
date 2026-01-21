'use client';

import { useState, useMemo } from 'react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { MarketCard, MarketCardCompact } from './market-card';
import { MarketFiltersBar, MarketFilters, defaultFilters } from './market-filters';
import { LayoutGrid, List, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketListProps {
  markets: ProcessedMarket[];
  isLoading?: boolean;
  onSelectMarket?: (market: ProcessedMarket) => void;
  showFilters?: boolean;
  initialView?: 'grid' | 'list';
  className?: string;
}

export function MarketList({
  markets,
  isLoading = false,
  onSelectMarket,
  showFilters = true,
  initialView = 'grid',
  className,
}: MarketListProps) {
  const [filters, setFilters] = useState<MarketFilters>(defaultFilters);
  const [view, setView] = useState<'grid' | 'list'>(initialView);

  const filteredMarkets = useMemo(() => {
    let result = [...markets];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(searchLower) ||
          m.subtitle?.toLowerCase().includes(searchLower) ||
          m.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((m) =>
        filters.categories.some((cat) =>
          m.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((m) => m.status === filters.status);
    }

    // Probability range filter
    result = result.filter(
      (m) =>
        m.probability >= filters.minProbability &&
        m.probability <= filters.maxProbability
    );

    // Sort
    switch (filters.sortBy) {
      case 'volume':
        result.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case 'probability':
        result.sort((a, b) => b.probability - a.probability);
        break;
      case 'closing_soon':
        result.sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
        break;
      case 'trending':
        result.sort(
          (a, b) => Math.abs(b.probabilityChange) - Math.abs(a.probabilityChange)
        );
        break;
    }

    return result;
  }, [markets, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {showFilters && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <MarketFiltersBar filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                view === 'grid'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 rounded transition-colors',
                view === 'list'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {filteredMarkets.length} markets found
      </div>

      {/* Market grid/list */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">
            No markets match your filters
          </p>
          <button
            onClick={() => setFilters(defaultFilters)}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.ticker}
              market={market}
              onSelect={onSelectMarket}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMarkets.map((market) => (
            <MarketCardCompact
              key={market.ticker}
              market={market}
              onSelect={onSelectMarket}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple grid without filters
export function MarketGrid({
  markets,
  onSelectMarket,
  columns = 3,
}: {
  markets: ProcessedMarket[];
  onSelectMarket?: (market: ProcessedMarket) => void;
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4', gridCols[columns])}>
      {markets.map((market) => (
        <MarketCard
          key={market.ticker}
          market={market}
          onSelect={onSelectMarket}
        />
      ))}
    </div>
  );
}
