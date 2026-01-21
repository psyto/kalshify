'use client';

import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Clock, BarChart2 } from 'lucide-react';
import { ProcessedMarket } from '@/lib/kalshi/types';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  market: ProcessedMarket;
  onSelect?: (market: ProcessedMarket) => void;
  showDetails?: boolean;
  className?: string;
}

export function MarketCard({
  market,
  onSelect,
  showDetails = true,
  className,
}: MarketCardProps) {
  const isProbabilityUp = market.probabilityChange > 0;
  const isProbabilityDown = market.probabilityChange < 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer',
        className
      )}
      onClick={() => onSelect?.(market)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            {market.category}
          </span>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white mt-1 line-clamp-2">
            {market.title}
          </h3>
          {market.subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
              {market.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Probability */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="text-3xl font-bold text-zinc-900 dark:text-white data-probability">
            {market.probability.toFixed(0)}
            <span className="text-lg text-zinc-400">%</span>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Probability
          </div>
        </div>

        {market.probabilityChange !== 0 && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium data-percent',
              isProbabilityUp && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
              isProbabilityDown && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            )}
          >
            {isProbabilityUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(market.probabilityChange).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Yes/No Prices */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
            YES
          </div>
          <div className="flex items-baseline gap-1 data-price">
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {market.yesBid}
            </span>
            <span className="text-sm text-green-600 dark:text-green-400">
              / {market.yesAsk}
            </span>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
            NO
          </div>
          <div className="flex items-baseline gap-1 data-price">
            <span className="text-lg font-bold text-red-700 dark:text-red-300">
              {market.noBid}
            </span>
            <span className="text-sm text-red-600 dark:text-red-400">
              / {market.noAsk}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            <span className="data-volume">${(market.volume24h / 100).toLocaleString()}</span>
            <span className="text-xs">24h vol</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{format(market.closeTime, 'MMM d')}</span>
          </div>
        </div>
      )}

      {/* Spread indicator */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Spread</span>
          <span
            className={cn(
              'font-medium data-price',
              market.spread <= 3 && 'text-green-600 dark:text-green-400',
              market.spread > 3 && market.spread <= 6 && 'text-yellow-600 dark:text-yellow-400',
              market.spread > 6 && 'text-red-600 dark:text-red-400'
            )}
          >
            {market.spread}¢
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
export function MarketCardCompact({
  market,
  onSelect,
}: MarketCardProps) {
  const isProbabilityUp = market.probabilityChange > 0;
  const isProbabilityDown = market.probabilityChange < 0;

  return (
    <div
      className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onSelect?.(market)}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {market.category}
        </div>
        <div className="font-medium text-zinc-900 dark:text-white truncate">
          {market.title}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-lg font-bold text-zinc-900 dark:text-white data-probability">
            {market.probability.toFixed(0)}%
          </div>
        </div>

        {market.probabilityChange !== 0 && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-sm font-medium data-percent',
              isProbabilityUp && 'text-green-600 dark:text-green-400',
              isProbabilityDown && 'text-red-600 dark:text-red-400'
            )}
          >
            {isProbabilityUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(market.probabilityChange).toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}
