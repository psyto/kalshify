import { NextRequest, NextResponse } from 'next/server';
import {
  getLeaderboard,
  seedDemoLeaderboard,
  getPerformanceSummary,
  LeaderboardEntry,
} from '@/lib/kalshi/performance-tracker';

// Track if demo data has been seeded
let demoSeeded = false;

// Demo visitor ID for unauthenticated users
const DEMO_VISITOR_ID = 'demo_visitor_001';

// Get visitor ID from cookies or use demo
function getVisitorId(request: NextRequest): string {
  const visitorId = request.cookies.get('visitor_id')?.value;
  return visitorId || DEMO_VISITOR_ID;
}

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    const { searchParams } = new URL(request.url);

    const sortBy = (searchParams.get('sortBy') || 'pnl') as 'pnl' | 'winRate' | 'trades' | 'streak';
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeUserRank = searchParams.get('includeUserRank') !== 'false';

    // Seed demo data if empty
    if (!demoSeeded) {
      seedDemoLeaderboard();
      demoSeeded = true;
    }

    const leaderboard = getLeaderboard(sortBy, limit);

    // Get current user's rank if requested
    let userRank: LeaderboardEntry | null = null;
    let userPercentile: number | null = null;

    if (includeUserRank) {
      const summary = getPerformanceSummary(visitorId);
      if (summary.rank) {
        userRank = leaderboard.find(e => e.visitorId === visitorId) || null;
        userPercentile = summary.percentile;

        // If user not in top results, add them separately
        if (!userRank && summary.stats) {
          userRank = {
            rank: summary.rank,
            visitorId: summary.stats.visitorId,
            displayName: summary.stats.displayName,
            totalPnl: summary.stats.totalPnl,
            winRate: summary.stats.totalTrades > 0
              ? Math.round((summary.stats.winCount / summary.stats.totalTrades) * 1000) / 10
              : 0,
            totalTrades: summary.stats.totalTrades,
            streak: summary.stats.currentStreak,
            trend: summary.stats.currentStreak > 2 ? 'up' : summary.stats.currentStreak < -2 ? 'down' : 'stable',
          };
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      userPercentile,
      totalTraders: leaderboard.length,
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST - Admin actions (seed demo data, reset, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'seed_demo':
        seedDemoLeaderboard();
        demoSeeded = true;
        return NextResponse.json({
          success: true,
          message: 'Demo leaderboard data seeded',
        });

      case 'refresh':
        // Force refresh leaderboard
        const leaderboard = getLeaderboard('pnl', 50);
        return NextResponse.json({
          success: true,
          leaderboard,
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to perform leaderboard action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
