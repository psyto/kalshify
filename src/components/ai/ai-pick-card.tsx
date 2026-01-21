'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIPickCardProps {
  rank: number;
  ticker: string;
  matchScore: number;
  reasoning: string;
  highlights?: string[];
  className?: string;
}

export function AIPickCard({
  rank,
  ticker,
  matchScore,
  reasoning,
  highlights = [],
  className,
}: AIPickCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Truncate ticker for display
  const displayTicker = ticker.length > 20 ? ticker.substring(0, 18) + '...' : ticker;
  const shortTicker = ticker.length > 12 ? ticker.substring(0, 10) + '...' : ticker;

  // Determine medal for top 3
  const getMedalColor = () => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-amber-500'; // Gold
      case 2:
        return 'from-zinc-300 to-zinc-400'; // Silver
      case 3:
        return 'from-amber-600 to-orange-700'; // Bronze
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getScoreColor = () => {
    if (matchScore >= 80) return 'text-green-500';
    if (matchScore >= 60) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <div
      className={cn(
        'flip-card h-[220px] cursor-pointer',
        isFlipped && 'flipped',
        className
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flip-card-inner relative w-full h-full">
        {/* Front of card */}
        <div className="flip-card-front absolute w-full h-full">
          <div className="h-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-3">
              {/* Rank Badge */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r text-white font-bold text-xs shrink-0',
                  getMedalColor()
                )}
              >
                <Sparkles className="w-3 h-3" />
                #{rank}
              </div>

              {/* Match Score */}
              <div className="text-right shrink-0">
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Score
                </div>
                <div className={cn('text-2xl font-bold data-value', getScoreColor())}>
                  {matchScore}
                </div>
              </div>
            </div>

            {/* Ticker */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white data-ticker truncate" title={ticker}>
                {displayTicker}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {reasoning.length > 60 ? reasoning.substring(0, 60) + '...' : reasoning}
              </p>
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Tap for analysis
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flip-card-back absolute w-full h-full">
          <div className="h-full bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-xl p-4 flex flex-col text-white overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI Analysis
              </h4>
              <span className="text-xs opacity-75">#{rank}</span>
            </div>

            {/* Full reasoning - scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <p className="text-xs opacity-90 leading-relaxed">
                {reasoning.length > 200 ? reasoning.substring(0, 200) + '...' : reasoning}
              </p>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 shrink-0">
                {highlights.slice(0, 2).map((highlight, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] truncate max-w-[80px]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}

            {/* Trade link */}
            <Link
              href={`/markets/${ticker}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shrink-0"
            >
              Trade {shortTicker}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
