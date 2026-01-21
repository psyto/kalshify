import { NextRequest, NextResponse } from 'next/server';
import { getMarketRecommendations } from '@/lib/ai/market-advisor';
import { fetchOpenMarkets } from '@/lib/kalshi/fetch-markets';
import { UserPredictionProfile, MarketForAI } from '@/lib/ai/types';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Parse request body
    const body = await request.json();
    const { riskTolerance, preferredCategories, minProbability, maxProbability } = body;

    // Build user profile from request or database
    let userProfile: UserPredictionProfile;

    if (session?.user?.id) {
      // Try to get saved preferences from database
      const savedPrefs = await prisma.userPredictionPreferences.findUnique({
        where: { userId: session.user.id },
      });

      if (savedPrefs) {
        userProfile = {
          riskTolerance: savedPrefs.riskTolerance as 'conservative' | 'moderate' | 'aggressive',
          preferredCategories: savedPrefs.preferredCategories,
          minProbability: savedPrefs.minProbability,
          maxProbability: savedPrefs.maxProbability,
        };
      } else {
        userProfile = {
          riskTolerance: riskTolerance || 'moderate',
          preferredCategories: preferredCategories || [],
          minProbability: minProbability ?? 0,
          maxProbability: maxProbability ?? 100,
        };
      }
    } else {
      userProfile = {
        riskTolerance: riskTolerance || 'moderate',
        preferredCategories: preferredCategories || [],
        minProbability: minProbability ?? 0,
        maxProbability: maxProbability ?? 100,
      };
    }

    // Fetch markets
    const markets = await fetchOpenMarkets(100);

    // Convert to AI-compatible format
    const marketsForAI: MarketForAI[] = markets.map((m) => ({
      ticker: m.ticker,
      eventTicker: m.eventTicker,
      title: m.title,
      subtitle: m.subtitle,
      category: m.category,
      status: m.status,
      probability: m.probability,
      probabilityChange: m.probabilityChange,
      volume24h: m.volume24h,
      openInterest: m.openInterest,
      closeTime: m.closeTime,
      yesBid: m.yesBid,
      yesAsk: m.yesAsk,
      noBid: m.noBid,
      noAsk: m.noAsk,
      spread: m.spread,
    }));

    // Get AI recommendations
    const recommendations = await getMarketRecommendations(marketsForAI, userProfile);

    return NextResponse.json({
      recommendations,
      userProfile,
    });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
