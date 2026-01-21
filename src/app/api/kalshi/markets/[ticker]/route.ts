import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketWithOrderbook, fetchMarketHistory, processMarket } from '@/lib/kalshi/fetch-markets';
import { getKalshiClient } from '@/lib/kalshi/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    const includeOrderbook = searchParams.get('orderbook') === 'true';

    const client = getKalshiClient();

    // Fetch market data
    const rawMarket = await client.getMarket(ticker);
    const market = processMarket(rawMarket);

    const response: {
      market: typeof market;
      orderbook?: Awaited<ReturnType<typeof client.getMarketOrderbook>>;
      history?: Awaited<ReturnType<typeof fetchMarketHistory>>;
    } = { market };

    // Optionally include orderbook
    if (includeOrderbook) {
      const orderbook = await client.getMarketOrderbook(ticker);
      response.orderbook = orderbook;
    }

    // Optionally include price history
    if (includeHistory) {
      const history = await fetchMarketHistory(ticker, 60); // Hourly data
      response.history = history;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch market:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    );
  }
}
