'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart2,
  Users,
  ExternalLink,
  Star,
  Plus,
} from 'lucide-react';
import { ProcessedMarket, KalshiOrderbook } from '@/lib/kalshi/types';
import { ProbabilityChart } from './probability-chart';
import { OrderbookDisplay, OrderbookBar } from './orderbook-display';
import { cn } from '@/lib/utils';

interface PricePoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketDetailProps {
  market: ProcessedMarket;
  orderbook?: KalshiOrderbook;
  history?: PricePoint[];
  onBack?: () => void;
  onAddToWatchlist?: () => void;
  onTrade?: (position: 'yes' | 'no') => void;
  isWatchlisted?: boolean;
  className?: string;
}

export function MarketDetail({
  market,
  orderbook,
  history = [],
  onBack,
  onAddToWatchlist,
  onTrade,
  isWatchlisted = false,
  className,
}: MarketDetailProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook'>('chart');
  const isProbabilityUp = market.probabilityChange > 0;
  const isProbabilityDown = market.probabilityChange < 0;

  const hoursUntilClose = Math.max(
    0,
    (market.closeTime.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {market.category}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
              {market.title}
            </h1>
            {market.subtitle && (
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                {market.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddToWatchlist && (
            <button
              onClick={onAddToWatchlist}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isWatchlisted
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
              )}
            >
              <Star className={cn('w-5 h-5', isWatchlisted && 'fill-current')} />
            </button>
          )}
          <a
            href={`https://kalshi.com/markets/${market.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            Probability
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              {market.probability.toFixed(1)}%
            </span>
            {market.probabilityChange !== 0 && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-sm font-medium',
                  isProbabilityUp && 'text-green-600 dark:text-green-400',
                  isProbabilityDown && 'text-red-600 dark:text-red-400'
                )}
              >
                {isProbabilityUp ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(market.probabilityChange).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            24h Volume
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            ${(market.volume24h / 100).toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Open Interest
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {market.openInterest.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Closes
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white">
            {hoursUntilClose < 24 ? (
              <span className="text-orange-600 dark:text-orange-400">
                {hoursUntilClose.toFixed(0)}h
              </span>
            ) : (
              format(market.closeTime, 'MMM d')
            )}
          </div>
        </div>
      </div>

      {/* Trade buttons */}
      {onTrade && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onTrade('yes')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buy YES at {market.yesAsk}¢
          </button>
          <button
            onClick={() => onTrade('no')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buy NO at {market.noAsk}¢
          </button>
        </div>
      )}

      {/* Chart / Orderbook tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('chart')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'chart'
                ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            Price Chart
          </button>
          <button
            onClick={() => setActiveTab('orderbook')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'orderbook'
                ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            Orderbook
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'chart' ? (
            <ProbabilityChart data={history} height={350} showVolume />
          ) : orderbook ? (
            <OrderbookDisplay orderbook={orderbook} />
          ) : (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              Orderbook not available
            </div>
          )}
        </div>
      </div>

      {/* Quick orderbook summary */}
      {orderbook && activeTab === 'chart' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Market Depth
          </h3>
          <OrderbookBar orderbook={orderbook} />
        </div>
      )}
    </div>
  );
}
