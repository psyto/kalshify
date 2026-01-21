'use client';

import { useMemo } from 'react';
import { KalshiOrderbook, OrderbookLevel } from '@/lib/kalshi/types';
import { cn } from '@/lib/utils';

interface OrderbookDisplayProps {
  orderbook: KalshiOrderbook;
  className?: string;
}

export function OrderbookDisplay({ orderbook, className }: OrderbookDisplayProps) {
  // Calculate max depth for bar width normalization
  const maxCount = useMemo(() => {
    const allCounts = [
      ...orderbook.yes_bids.map((l) => l.count),
      ...orderbook.yes_asks.map((l) => l.count),
      ...orderbook.no_bids.map((l) => l.count),
      ...orderbook.no_asks.map((l) => l.count),
    ];
    return Math.max(...allCounts, 1);
  }, [orderbook]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* YES Side */}
      <div>
        <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          YES Orderbook
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* YES Bids */}
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Bids (Buy)
            </div>
            <OrderbookSide
              levels={orderbook.yes_bids}
              maxCount={maxCount}
              side="bid"
              color="green"
            />
          </div>
          {/* YES Asks */}
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Asks (Sell)
            </div>
            <OrderbookSide
              levels={orderbook.yes_asks}
              maxCount={maxCount}
              side="ask"
              color="green"
            />
          </div>
        </div>
      </div>

      {/* NO Side */}
      <div>
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          NO Orderbook
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* NO Bids */}
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Bids (Buy)
            </div>
            <OrderbookSide
              levels={orderbook.no_bids}
              maxCount={maxCount}
              side="bid"
              color="red"
            />
          </div>
          {/* NO Asks */}
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Asks (Sell)
            </div>
            <OrderbookSide
              levels={orderbook.no_asks}
              maxCount={maxCount}
              side="ask"
              color="red"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrderbookSideProps {
  levels: OrderbookLevel[];
  maxCount: number;
  side: 'bid' | 'ask';
  color: 'green' | 'red';
}

function OrderbookSide({ levels, maxCount, side, color }: OrderbookSideProps) {
  // Sort: bids descending, asks ascending
  const sortedLevels = useMemo(() => {
    return [...levels].sort((a, b) =>
      side === 'bid' ? b.price - a.price : a.price - b.price
    );
  }, [levels, side]);

  if (sortedLevels.length === 0) {
    return (
      <div className="text-sm text-zinc-400 dark:text-zinc-500 py-2">
        No orders
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedLevels.slice(0, 8).map((level, index) => (
        <div
          key={`${level.price}-${index}`}
          className="relative flex items-center justify-between py-1 px-2 rounded"
        >
          {/* Background bar */}
          <div
            className={cn(
              'absolute inset-y-0 rounded',
              side === 'bid' ? 'right-0' : 'left-0',
              color === 'green'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            )}
            style={{
              width: `${(level.count / maxCount) * 100}%`,
            }}
          />

          {/* Content */}
          <span className="relative text-sm font-medium text-zinc-900 dark:text-white">
            {level.price}¢
          </span>
          <span className="relative text-sm text-zinc-600 dark:text-zinc-400">
            {level.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compact visual representation
export function OrderbookBar({
  orderbook,
  className,
}: {
  orderbook: KalshiOrderbook;
  className?: string;
}) {
  const yesBidVolume = orderbook.yes_bids.reduce((sum, l) => sum + l.count, 0);
  const yesAskVolume = orderbook.yes_asks.reduce((sum, l) => sum + l.count, 0);
  const noBidVolume = orderbook.no_bids.reduce((sum, l) => sum + l.count, 0);
  const noAskVolume = orderbook.no_asks.reduce((sum, l) => sum + l.count, 0);

  const total = yesBidVolume + yesAskVolume + noBidVolume + noAskVolume || 1;

  const bestYesBid = orderbook.yes_bids[0]?.price ?? 0;
  const bestYesAsk = orderbook.yes_asks[0]?.price ?? 100;
  const spread = bestYesAsk - bestYesBid;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Spread indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">Spread</span>
        <span
          className={cn(
            'font-medium',
            spread <= 3 && 'text-green-600 dark:text-green-400',
            spread > 3 && spread <= 6 && 'text-yellow-600 dark:text-yellow-400',
            spread > 6 && 'text-red-600 dark:text-red-400'
          )}
        >
          {spread}¢
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex">
        <div
          className="bg-green-500 dark:bg-green-600"
          style={{ width: `${((yesBidVolume + yesAskVolume) / total) * 100}%` }}
          title={`YES: ${yesBidVolume + yesAskVolume}`}
        />
        <div
          className="bg-red-500 dark:bg-red-600"
          style={{ width: `${((noBidVolume + noAskVolume) / total) * 100}%` }}
          title={`NO: ${noBidVolume + noAskVolume}`}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          YES: {(yesBidVolume + yesAskVolume).toLocaleString()}
        </span>
        <span>
          NO: {(noBidVolume + noAskVolume).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
