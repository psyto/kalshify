'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  History,
  Plus,
  Shuffle,
} from 'lucide-react';
import { PaperPositionCard, PaperPositionRow, PaperPositionData } from './paper-position-card';
import { cn } from '@/lib/utils';

interface PaperPortfolioDashboardProps {
  positions: PaperPositionData[];
  onClosePosition?: (positionId: string) => void;
  onAddPosition?: () => void;
  onSimulatePrices?: () => void;
  isSimulating?: boolean;
  className?: string;
}

export function PaperPortfolioDashboard({
  positions,
  onClosePosition,
  onAddPosition,
  onSimulatePrices,
  isSimulating,
  className,
}: PaperPortfolioDashboardProps) {
  const [view, setView] = useState<'active' | 'closed' | 'all'>('active');

  const stats = useMemo(() => {
    const openPositions = positions.filter((p) => p.status === 'open');
    const closedPositions = positions.filter((p) => p.status === 'closed');

    let totalValue = 0;
    let totalCost = 0;
    let unrealizedPnl = 0;
    let realizedPnl = 0;

    openPositions.forEach((p) => {
      totalValue += p.currentPrice * p.quantity;
      totalCost += p.entryPrice * p.quantity;
      unrealizedPnl += (p.currentPrice - p.entryPrice) * p.quantity;
    });

    closedPositions.forEach((p) => {
      realizedPnl += p.realizedPnl || 0;
    });

    const totalPnl = unrealizedPnl + realizedPnl;
    const totalPnlPercent = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

    // Category breakdown
    const categoryMap = new Map<string, { count: number; value: number }>();
    openPositions.forEach((p) => {
      const category = p.eventTicker?.split('-')[0] || 'Other';
      const existing = categoryMap.get(category) || { count: 0, value: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        value: existing.value + p.currentPrice * p.quantity,
      });
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      openCount: openPositions.length,
      closedCount: closedPositions.length,
      totalValue,
      totalCost,
      unrealizedPnl,
      realizedPnl,
      totalPnl,
      totalPnlPercent,
      categories,
    };
  }, [positions]);

  const filteredPositions = useMemo(() => {
    switch (view) {
      case 'active':
        return positions.filter((p) => p.status === 'open');
      case 'closed':
        return positions.filter((p) => p.status === 'closed');
      default:
        return positions;
    }
  }, [positions, view]);

  const isProfitable = stats.unrealizedPnl > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Paper Portfolio
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Practice trading without real money
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onSimulatePrices && (
            <button
              onClick={onSimulatePrices}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
            >
              <Shuffle className={cn("w-4 h-4", isSimulating && "animate-spin")} />
              Simulate Prices
            </button>
          )}
          {onAddPosition && (
            <button
              onClick={onAddPosition}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            Portfolio Value
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            ${(stats.totalValue / 100).toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : stats.unrealizedPnl < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            Unrealized P&L
          </div>
          <div
            className={cn(
              'text-2xl font-bold',
              isProfitable && 'text-green-600 dark:text-green-400',
              stats.unrealizedPnl < 0 && 'text-red-600 dark:text-red-400',
              stats.unrealizedPnl === 0 && 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            {isProfitable ? '+' : ''}${(stats.unrealizedPnl / 100).toFixed(2)}
            <span className="text-sm font-normal ml-1">
              ({isProfitable ? '+' : ''}{stats.totalPnlPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <History className="w-4 h-4" />
            Realized P&L
          </div>
          <div
            className={cn(
              'text-2xl font-bold',
              stats.realizedPnl > 0 && 'text-green-600 dark:text-green-400',
              stats.realizedPnl < 0 && 'text-red-600 dark:text-red-400',
              stats.realizedPnl === 0 && 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            {stats.realizedPnl > 0 ? '+' : ''}${(stats.realizedPnl / 100).toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            Open Positions
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.openCount}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categories.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-zinc-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Category Exposure
            </h3>
          </div>
          <div className="space-y-2">
            {stats.categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-24 text-sm text-zinc-600 dark:text-zinc-400">
                  {cat.name}
                </div>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {cat.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Position Tabs */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setView('active')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            view === 'active'
              ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          Active ({stats.openCount})
        </button>
        <button
          onClick={() => setView('closed')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            view === 'closed'
              ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          Closed ({stats.closedCount})
        </button>
        <button
          onClick={() => setView('all')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            view === 'all'
              ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          )}
        >
          All
        </button>
      </div>

      {/* Positions List */}
      {filteredPositions.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            {view === 'active'
              ? 'No open positions yet'
              : view === 'closed'
              ? 'No closed positions'
              : 'No positions found'}
          </p>
          {onAddPosition && view !== 'closed' && (
            <button
              onClick={onAddPosition}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Add your first position
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPositions.map((position) => (
            <PaperPositionRow
              key={position.id}
              position={position}
              onClose={onClosePosition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
