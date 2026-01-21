'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Medal,
  Award,
  Flame,
  Target,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  visitorId: string;
  displayName: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
}

type SortOption = 'pnl' | 'winRate' | 'trades' | 'streak';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('pnl');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
        setUserPercentile(data.userPercentile || null);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-zinc-500 font-mono">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-zinc-400" />;
    }
  };

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'pnl', label: 'Total P&L', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'winRate', label: 'Win Rate', icon: <Target className="w-4 h-4" /> },
    { value: 'trades', label: 'Total Trades', icon: <BarChart2 className="w-4 h-4" /> },
    { value: 'streak', label: 'Best Streak', icon: <Flame className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">
                Kalshify
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/markets"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                <span className="hidden sm:inline">Leaderboard</span>
                <span className="sm:hidden">Ranks</span>
              </Link>
              <Link
                href="/for-you"
                className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <span className="hidden sm:inline">AI Picks</span>
                <span className="sm:hidden">AI</span>
              </Link>
              <Link
                href="/intel"
                className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Intel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Paper Trading Competition
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            See how your paper trading performance compares to other traders worldwide
          </p>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Your Rank</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold data-value">#{userRank.rank}</span>
                  {userPercentile !== null && (
                    <span className="text-blue-100 text-sm data-percent">
                      Top {100 - userPercentile}%
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Total P&L</p>
                <p className={cn(
                  'text-2xl font-bold data-price',
                  userRank.totalPnl >= 0 ? 'text-green-300' : 'text-red-300'
                )}>
                  {userRank.totalPnl >= 0 ? '+' : ''}${(userRank.totalPnl / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-blue-100 text-xs">Win Rate</p>
                <p className="font-semibold data-percent">{userRank.winRate}%</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Trades</p>
                <p className="font-semibold data-value">{userRank.totalTrades}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Streak</p>
                <p className="font-semibold flex items-center gap-1 data-value">
                  {userRank.streak > 0 ? '+' : ''}{userRank.streak}
                  {getTrendIcon(userRank.trend)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                sortBy === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500'
              )}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!isLoading && leaderboard.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center animate-podium animate-podium-delay-1 opacity-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-2 shadow-lg">
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-center mb-2">
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
                    {leaderboard[1]?.displayName || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-green-500 font-bold data-price">
                    +${((leaderboard[1]?.totalPnl || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="w-20 sm:w-28 h-20 sm:h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-bold text-white">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center animate-podium opacity-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2 shadow-lg ring-4 ring-yellow-300/50">
                  <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-center mb-2">
                  <p className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">
                    {leaderboard[0]?.displayName || 'N/A'}
                  </p>
                  <p className="text-sm sm:text-base text-green-500 font-bold data-price">
                    +${((leaderboard[0]?.totalPnl || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="w-24 sm:w-32 h-28 sm:h-32 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-bold text-white">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center animate-podium animate-podium-delay-2 opacity-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-2 shadow-lg">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-center mb-2">
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
                    {leaderboard[2]?.displayName || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-green-500 font-bold data-price">
                    +${((leaderboard[2]?.totalPnl || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="w-20 sm:w-28 h-16 sm:h-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-bold text-white">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
            <Trophy className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 mb-2">
              No traders yet
            </p>
            <Link
              href="/markets"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Start paper trading to join the leaderboard
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Trader</div>
              <div className="col-span-2 text-right">P&L</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Trades</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {leaderboard.map((entry) => (
                <div
                  key={entry.visitorId}
                  className={cn(
                    'px-4 py-3 md:px-6 md:py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                    entry.rank <= 3 && 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10'
                  )}
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {entry.displayName}
                        </span>
                        {getTrendIcon(entry.trend)}
                      </div>
                      <div className={cn(
                        'font-semibold',
                        entry.totalPnl >= 0 ? 'data-positive' : 'data-negative'
                      )}>
                        {entry.totalPnl >= 0 ? '+' : ''}${(entry.totalPnl / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="data-percent">{entry.winRate}% win</span>
                      <span className="data-value">{entry.totalTrades} trades</span>
                      {entry.streak > 3 && (
                        <span className="flex items-center gap-1 text-orange-500 data-value">
                          <Flame className="w-3 h-3" />
                          {entry.streak}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="col-span-4">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {entry.displayName}
                      </p>
                      {entry.streak > 3 && (
                        <div className="flex items-center gap-1 text-xs text-orange-500 mt-0.5 data-value">
                          <Flame className="w-3 h-3" />
                          {entry.streak} win streak
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      'col-span-2 text-right font-semibold',
                      entry.totalPnl >= 0 ? 'data-positive' : 'data-negative'
                    )}>
                      {entry.totalPnl >= 0 ? '+' : ''}${(entry.totalPnl / 100).toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right text-zinc-600 dark:text-zinc-400 data-percent">
                      {entry.winRate}%
                    </div>
                    <div className="col-span-2 text-right text-zinc-600 dark:text-zinc-400 data-value">
                      {entry.totalTrades}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {getTrendIcon(entry.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-8 py-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Want to climb the leaderboard?
          </p>
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Paper Trading
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
