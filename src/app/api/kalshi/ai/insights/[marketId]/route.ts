import { NextRequest, NextResponse } from 'next/server';
import { getMarketInsight, getQuickMarketInsight } from '@/lib/ai/market-advisor';
import { processMarket } from '@/lib/kalshi/fetch-markets';
import { getKalshiClient } from '@/lib/kalshi/client';
import { MarketForAI } from '@/lib/ai/types';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const { searchParams } = new URL(request.url);
    const quick = searchParams.get('quick') === 'true';

    // Check cache first
    const cached = await prisma.marketInsightCache.findUnique({
      where: { marketId },
    });

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json({
        marketId,
        insight: cached.insight,
        cached: true,
        generatedAt: cached.generatedAt.toISOString(),
      });
    }

    // Fetch fresh market data
    const client = getKalshiClient();
    const rawMarket = await client.getMarket(marketId);
    const market = processMarket(rawMarket);

    // Convert to AI-compatible format
    const marketForAI: MarketForAI = {
      ticker: market.ticker,
      eventTicker: market.eventTicker,
      title: market.title,
      subtitle: market.subtitle,
      category: market.category,
      status: market.status,
      probability: market.probability,
      probabilityChange: market.probabilityChange,
      volume24h: market.volume24h,
      openInterest: market.openInterest,
      closeTime: market.closeTime,
      yesBid: market.yesBid,
      yesAsk: market.yesAsk,
      noBid: market.noBid,
      noAsk: market.noAsk,
      spread: market.spread,
    };

    let insight;

    if (quick) {
      // Quick insight - shorter, faster
      const quickInsight = await getQuickMarketInsight(marketForAI);
      insight = { summary: quickInsight };
    } else {
      // Full insight
      insight = await getMarketInsight(marketForAI);

      // Cache the full insight for 1 hour
      await prisma.marketInsightCache.upsert({
        where: { marketId },
        create: {
          marketId,
          insight: insight as any,
          marketSnapshot: {
            probability: market.probability,
            volume24h: market.volume24h,
          },
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
        update: {
          insight: insight as any,
          marketSnapshot: {
            probability: market.probability,
            volume24h: market.volume24h,
          },
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json({
      marketId,
      insight,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get market insight:', error);
    return NextResponse.json(
      { error: 'Failed to get market insight' },
      { status: 500 }
    );
  }
}
