// GET /api/intel - Fetch intel signals
// Query params: type, severity, limit, offset

import { NextRequest, NextResponse } from 'next/server';
import { getRecentSignals, getSignalStats, getUnreadCount } from '@/lib/intel';
import { SignalType, SignalSeverity } from '@/lib/intel/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as SignalType | null;
    const severity = searchParams.get('severity') as SignalSeverity | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeStats = searchParams.get('stats') === 'true';

    // Validate parameters
    const validTypes: SignalType[] = ['VOLUME_SPIKE', 'WHALE_ALERT', 'SOCIAL_INTEL', 'PRICE_MOVE', 'SPREAD_CHANGE'];
    const validSeverities: SignalSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` },
        { status: 400 }
      );
    }

    const { signals, total } = await getRecentSignals({
      type: type || undefined,
      severity: severity || undefined,
      limit: Math.min(limit, 100),
      offset,
    });

    const unreadCount = await getUnreadCount();

    const response: Record<string, unknown> = {
      signals,
      total,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + signals.length < total,
      },
    };

    if (includeStats) {
      const stats = await getSignalStats();
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Intel API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intel signals' },
      { status: 500 }
    );
  }
}
