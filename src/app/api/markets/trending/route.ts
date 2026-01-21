// GET /api/markets/trending - Get trending markets for ticker

import { NextRequest, NextResponse } from 'next/server';
import { getKalshiClient } from '@/lib/kalshi/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const client = getKalshiClient();
    const markets = await client.getActiveMarketsFromEvents(limit);

    const tickerMarkets = markets.map((market) => ({
      ticker: market.ticker,
      title: market.title.length > 50 ? market.title.substring(0, 47) + '...' : market.title,
      probability: market.yes_ask || 50,
      change: Math.round((Math.random() - 0.5) * 10 * 10) / 10, // Simulated change for demo
    }));

    return NextResponse.json({
      markets: tickerMarkets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trending markets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending markets', markets: [] },
      { status: 500 }
    );
  }
}
