import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenMarkets, fetchTrendingMarkets, searchMarkets, fetchMarketStats } from '@/lib/kalshi/fetch-markets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');

    let markets;
    let stats;

    switch (type) {
      case 'trending':
        markets = await fetchTrendingMarkets(limit);
        break;
      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'Search query required' },
            { status: 400 }
          );
        }
        markets = await searchMarkets(query, limit);
        break;
      case 'stats':
        stats = await fetchMarketStats();
        return NextResponse.json({ stats });
      default:
        markets = await fetchOpenMarkets(limit);
    }

    // Filter by category if provided
    if (category && markets) {
      markets = markets.filter(
        (m) => m.category.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json({
      markets,
      count: markets?.length || 0,
    });
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
