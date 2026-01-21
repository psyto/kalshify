/**
 * Performance Tracker for Paper Trading
 * Tracks historical performance of paper trading portfolios
 * with leaderboard support for gamification
 */

// In-memory stores (demo mode - would use database in production)
export interface PerformanceSnapshot {
  id: string;
visitorId: string;
  date: Date;
  portfolioValue: number;
  totalCost: number;
  unrealizedPnl: number;
  realizedPnl: number;
  openPositions: number;
  closedPositions: number;
  winCount: number;
  lossCount: number;
}

export interface TraderStats {
  visitorId: string;
  displayName: string;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  visitorId: string;
  displayName: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
}

// In-memory stores
const snapshots: Map<string, PerformanceSnapshot[]> = new Map();
const traderStats: Map<string, TraderStats> = new Map();

// Generate unique ID
function generateId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate display name from visitor ID
function generateDisplayName(visitorId: string): string {
  const adjectives = ['Swift', 'Bold', 'Wise', 'Lucky', 'Sharp', 'Keen', 'Quick', 'Smart'];
  const nouns = ['Trader', 'Prophet', 'Oracle', 'Analyst', 'Predictor', 'Sage', 'Maven', 'Guru'];

  // Use visitor ID to deterministically pick words
  const hash = visitorId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const adj = adjectives[hash % adjectives.length];
  const noun = nouns[(hash * 7) % nouns.length];
  const num = (hash % 999) + 1;

  return `${adj}${noun}${num}`;
}

/**
 * Create a performance snapshot for a visitor
 */
export function createSnapshot(
  visitorId: string,
  portfolioData: {
    portfolioValue: number;
    totalCost: number;
    unrealizedPnl: number;
    realizedPnl: number;
    openPositions: number;
    closedPositions: number;
    winCount: number;
    lossCount: number;
  }
): PerformanceSnapshot {
  const snapshot: PerformanceSnapshot = {
    id: generateId(),
    visitorId,
    date: new Date(),
    ...portfolioData,
  };

  // Get or create visitor's snapshot array
  const visitorSnapshots = snapshots.get(visitorId) || [];
  visitorSnapshots.push(snapshot);
  snapshots.set(visitorId, visitorSnapshots);

  // Update trader stats
  updateTraderStats(visitorId, portfolioData);

  return snapshot;
}

/**
 * Update trader statistics
 */
function updateTraderStats(
  visitorId: string,
  data: {
    realizedPnl: number;
    winCount: number;
    lossCount: number;
    openPositions: number;
    closedPositions: number;
  }
): void {
  const existing = traderStats.get(visitorId);
  const now = new Date();

  if (existing) {
    // Update existing stats
    const totalTrades = data.winCount + data.lossCount;
    const newWins = data.winCount - existing.winCount;
    const newLosses = data.lossCount - existing.lossCount;

    // Calculate streak
    let currentStreak = existing.currentStreak;
    if (newWins > 0 && newLosses === 0) {
      currentStreak = Math.max(0, currentStreak) + newWins;
    } else if (newLosses > 0 && newWins === 0) {
      currentStreak = Math.min(0, currentStreak) - newLosses;
    } else if (newWins > 0 && newLosses > 0) {
      // Mixed results - reset streak
      currentStreak = newWins > newLosses ? newWins : -newLosses;
    }

    traderStats.set(visitorId, {
      ...existing,
      totalTrades,
      winCount: data.winCount,
      lossCount: data.lossCount,
      totalPnl: data.realizedPnl,
      currentStreak,
      bestStreak: Math.max(existing.bestStreak, currentStreak),
      lastActiveAt: now,
    });
  } else {
    // Create new trader stats
    traderStats.set(visitorId, {
      visitorId,
      displayName: generateDisplayName(visitorId),
      totalTrades: data.winCount + data.lossCount,
      winCount: data.winCount,
      lossCount: data.lossCount,
      totalPnl: data.realizedPnl,
      bestTrade: 0,
      worstTrade: 0,
      currentStreak: data.winCount > 0 ? data.winCount : (data.lossCount > 0 ? -data.lossCount : 0),
      bestStreak: data.winCount,
      joinedAt: now,
      lastActiveAt: now,
    });
  }
}

/**
 * Record a completed trade for stats tracking
 */
export function recordTrade(
  visitorId: string,
  pnl: number
): void {
  const stats = traderStats.get(visitorId);
  if (!stats) return;

  const isWin = pnl > 0;

  // Update best/worst trades
  if (pnl > stats.bestTrade) {
    stats.bestTrade = pnl;
  }
  if (pnl < stats.worstTrade) {
    stats.worstTrade = pnl;
  }

  // Update streak
  if (isWin) {
    stats.currentStreak = Math.max(0, stats.currentStreak) + 1;
  } else {
    stats.currentStreak = Math.min(0, stats.currentStreak) - 1;
  }
  stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);

  // Update counts
  if (isWin) {
    stats.winCount++;
  } else {
    stats.lossCount++;
  }
  stats.totalTrades++;
  stats.totalPnl += pnl;
  stats.lastActiveAt = new Date();

  traderStats.set(visitorId, stats);
}

/**
 * Get snapshots for a visitor
 */
export function getSnapshots(
  visitorId: string,
  limit: number = 30
): PerformanceSnapshot[] {
  const visitorSnapshots = snapshots.get(visitorId) || [];
  return visitorSnapshots.slice(-limit);
}

/**
 * Get trader stats
 */
export function getTraderStats(visitorId: string): TraderStats | null {
  return traderStats.get(visitorId) || null;
}

/**
 * Get or create trader stats
 */
export function getOrCreateTraderStats(visitorId: string): TraderStats {
  let stats = traderStats.get(visitorId);
  if (!stats) {
    const now = new Date();
    stats = {
      visitorId,
      displayName: generateDisplayName(visitorId),
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      totalPnl: 0,
      bestTrade: 0,
      worstTrade: 0,
      currentStreak: 0,
      bestStreak: 0,
      joinedAt: now,
      lastActiveAt: now,
    };
    traderStats.set(visitorId, stats);
  }
  return stats;
}

/**
 * Get leaderboard sorted by total P&L
 */
export function getLeaderboard(
  sortBy: 'pnl' | 'winRate' | 'trades' | 'streak' = 'pnl',
  limit: number = 50
): LeaderboardEntry[] {
  const allTraders = Array.from(traderStats.values());

  // Sort by specified metric
  const sorted = allTraders.sort((a, b) => {
    switch (sortBy) {
      case 'pnl':
        return b.totalPnl - a.totalPnl;
      case 'winRate':
        const aWinRate = a.totalTrades > 0 ? a.winCount / a.totalTrades : 0;
        const bWinRate = b.totalTrades > 0 ? b.winCount / b.totalTrades : 0;
        return bWinRate - aWinRate;
      case 'trades':
        return b.totalTrades - a.totalTrades;
      case 'streak':
        return b.bestStreak - a.bestStreak;
      default:
        return b.totalPnl - a.totalPnl;
    }
  });

  return sorted.slice(0, limit).map((trader, index) => {
    const winRate = trader.totalTrades > 0
      ? (trader.winCount / trader.totalTrades) * 100
      : 0;

    // Determine trend based on recent activity
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (trader.currentStreak > 2) trend = 'up';
    else if (trader.currentStreak < -2) trend = 'down';

    return {
      rank: index + 1,
      visitorId: trader.visitorId,
      displayName: trader.displayName,
      totalPnl: trader.totalPnl,
      winRate: Math.round(winRate * 10) / 10,
      totalTrades: trader.totalTrades,
      streak: trader.currentStreak,
      trend,
    };
  });
}

/**
 * Seed demo leaderboard data
 */
export function seedDemoLeaderboard(): void {
  const demoTraders = [
    { pnl: 4523, wins: 28, losses: 12, streak: 5 },
    { pnl: 3891, wins: 35, losses: 20, streak: 3 },
    { pnl: 2156, wins: 19, losses: 11, streak: -2 },
    { pnl: 1832, wins: 42, losses: 38, streak: 1 },
    { pnl: 1245, wins: 15, losses: 9, streak: 4 },
    { pnl: 987, wins: 22, losses: 18, streak: -1 },
    { pnl: 654, wins: 31, losses: 29, streak: 2 },
    { pnl: 421, wins: 18, losses: 17, streak: 0 },
    { pnl: -156, wins: 12, losses: 15, streak: -3 },
    { pnl: -523, wins: 8, losses: 14, streak: -4 },
  ];

  demoTraders.forEach((trader, i) => {
    const visitorId = `demo_${i}_${Date.now()}`;
    const now = new Date();
    const joinedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    traderStats.set(visitorId, {
      visitorId,
      displayName: generateDisplayName(visitorId),
      totalTrades: trader.wins + trader.losses,
      winCount: trader.wins,
      lossCount: trader.losses,
      totalPnl: trader.pnl,
      bestTrade: Math.abs(trader.pnl) * 0.3,
      worstTrade: -Math.abs(trader.pnl) * 0.1,
      currentStreak: trader.streak,
      bestStreak: Math.max(trader.streak, 5),
      joinedAt,
      lastActiveAt: now,
    });
  });
}

/**
 * Get performance summary for a visitor
 */
export function getPerformanceSummary(visitorId: string): {
  stats: TraderStats | null;
  snapshots: PerformanceSnapshot[];
  rank: number | null;
  percentile: number | null;
} {
  const stats = traderStats.get(visitorId) || null;
  const visitorSnapshots = snapshots.get(visitorId) || [];

  // Calculate rank
  let rank: number | null = null;
  let percentile: number | null = null;

  if (stats) {
    const leaderboard = getLeaderboard('pnl', 1000);
    const entry = leaderboard.find(e => e.visitorId === visitorId);
    if (entry) {
      rank = entry.rank;
      percentile = Math.round((1 - (rank - 1) / leaderboard.length) * 100);
    }
  }

  return {
    stats,
    snapshots: visitorSnapshots.slice(-30),
    rank,
    percentile,
  };
}
