import { NextRequest, NextResponse } from 'next/server';
import {
  createSnapshot,
  getSnapshots,
  getPerformanceSummary,
  getTraderStats,
  getOrCreateTraderStats,
  recordTrade,
} from '@/lib/kalshi/performance-tracker';

// Demo visitor ID for unauthenticated users
const DEMO_VISITOR_ID = 'demo_visitor_001';

// Get visitor ID from cookies or use demo
function getVisitorId(request: NextRequest): string {
  const visitorId = request.cookies.get('visitor_id')?.value;
  return visitorId || DEMO_VISITOR_ID;
}

// GET - Fetch performance snapshots and stats
export async function GET(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const includeStats = searchParams.get('stats') !== 'false';

    const snapshotData = getSnapshots(visitorId, limit);
    const summary = includeStats ? getPerformanceSummary(visitorId) : null;

    return NextResponse.json({
      visitorId,
      snapshots: snapshotData,
      stats: summary?.stats || null,
      rank: summary?.rank || null,
      percentile: summary?.percentile || null,
    });
  } catch (error) {
    console.error('Failed to fetch snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

// POST - Create a new performance snapshot
export async function POST(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    const body = await request.json();

    const {
      portfolioValue,
      totalCost,
      unrealizedPnl,
      realizedPnl,
      openPositions,
      closedPositions,
      winCount,
      lossCount,
    } = body;

    // Validate required fields
    if (portfolioValue === undefined || totalCost === undefined) {
      return NextResponse.json(
        { error: 'portfolioValue and totalCost are required' },
        { status: 400 }
      );
    }

    const snapshot = createSnapshot(visitorId, {
      portfolioValue: portfolioValue || 0,
      totalCost: totalCost || 0,
      unrealizedPnl: unrealizedPnl || 0,
      realizedPnl: realizedPnl || 0,
      openPositions: openPositions || 0,
      closedPositions: closedPositions || 0,
      winCount: winCount || 0,
      lossCount: lossCount || 0,
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}

// PATCH - Record a trade or update stats
export async function PATCH(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    const body = await request.json();
    const { action, pnl } = body;

    switch (action) {
      case 'record_trade':
        if (pnl === undefined) {
          return NextResponse.json(
            { error: 'pnl is required for record_trade action' },
            { status: 400 }
          );
        }
        recordTrade(visitorId, pnl);
        const stats = getTraderStats(visitorId);
        return NextResponse.json({ success: true, stats });

      case 'get_or_create_stats':
        const traderStats = getOrCreateTraderStats(visitorId);
        return NextResponse.json({ stats: traderStats });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
