// AI-powered recommendation engine for Kalshi prediction markets

import { ProcessedMarket } from './types';
import { fetchOpenMarkets, fetchTrendingMarkets } from './fetch-markets';

export interface UserPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredCategories: string[];
  minProbability: number;
  maxProbability: number;
  minVolume?: number;
}

export interface MarketRecommendation {
  market: ProcessedMarket;
  score: number;
  reasons: string[];
  suggestedPosition?: 'yes' | 'no';
  confidence: 'low' | 'medium' | 'high';
}

// Risk tolerance to probability preferences mapping
const RISK_PROFILES = {
  conservative: {
    minProb: 25,
    maxProb: 75,
    preferHighVolume: true,
    preferNarrowSpread: true,
  },
  moderate: {
    minProb: 15,
    maxProb: 85,
    preferHighVolume: true,
    preferNarrowSpread: false,
  },
  aggressive: {
    minProb: 5,
    maxProb: 95,
    preferHighVolume: false,
    preferNarrowSpread: false,
  },
};

// Score a market based on user preferences
function scoreMarket(market: ProcessedMarket, preferences: UserPreferences): number {
  let score = 50; // Base score
  const riskProfile = RISK_PROFILES[preferences.riskTolerance];

  // Category match bonus
  if (
    preferences.preferredCategories.length > 0 &&
    preferences.preferredCategories.some(
      (cat) => market.category.toLowerCase().includes(cat.toLowerCase())
    )
  ) {
    score += 20;
  }

  // Probability in preferred range
  const probMin = Math.max(preferences.minProbability, riskProfile.minProb);
  const probMax = Math.min(preferences.maxProbability, riskProfile.maxProb);

  if (market.probability >= probMin && market.probability <= probMax) {
    score += 15;
  } else if (market.probability < probMin || market.probability > probMax) {
    // Penalize out-of-range probabilities
    const distance = Math.min(
      Math.abs(market.probability - probMin),
      Math.abs(market.probability - probMax)
    );
    score -= distance * 0.5;
  }

  // Volume bonus
  if (riskProfile.preferHighVolume && market.volume24h > 10000) {
    score += 10;
  }
  if (preferences.minVolume && market.volume24h < preferences.minVolume) {
    score -= 15;
  }

  // Spread penalty for conservative investors
  if (riskProfile.preferNarrowSpread && market.spread > 5) {
    score -= (market.spread - 5) * 2;
  }

  // Recent momentum bonus
  if (Math.abs(market.probabilityChange) > 5) {
    score += 5; // Interesting price movement
  }

  // Time to close bonus (closing soon = more action)
  const hoursToClose = (market.closeTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursToClose < 24 && hoursToClose > 1) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// Generate reasons for recommendation
function generateReasons(market: ProcessedMarket, preferences: UserPreferences): string[] {
  const reasons: string[] = [];

  // Category match
  if (
    preferences.preferredCategories.some(
      (cat) => market.category.toLowerCase().includes(cat.toLowerCase())
    )
  ) {
    reasons.push(`Matches your interest in ${market.category}`);
  }

  // Volume
  if (market.volume24h > 50000) {
    reasons.push('High trading volume indicates strong market interest');
  } else if (market.volume24h > 10000) {
    reasons.push('Healthy trading volume');
  }

  // Probability movement
  if (market.probabilityChange > 5) {
    reasons.push(`Probability increased ${market.probabilityChange.toFixed(1)}% recently`);
  } else if (market.probabilityChange < -5) {
    reasons.push(`Probability decreased ${Math.abs(market.probabilityChange).toFixed(1)}% recently`);
  }

  // Time to close
  const hoursToClose = (market.closeTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursToClose < 24) {
    reasons.push('Closing within 24 hours');
  } else if (hoursToClose < 168) {
    reasons.push('Closing within a week');
  }

  // Spread
  if (market.spread <= 3) {
    reasons.push('Tight spread offers good execution');
  }

  // Probability range
  const prob = market.probability;
  if (prob > 20 && prob < 80) {
    reasons.push('Probability in uncertainty range - potential for movement');
  } else if (prob <= 20 || prob >= 80) {
    reasons.push('Strong consensus - consider contrarian opportunity');
  }

  return reasons.slice(0, 4); // Max 4 reasons
}

// Determine suggested position based on analysis
function suggestPosition(
  market: ProcessedMarket,
  _preferences: UserPreferences
): { position: 'yes' | 'no'; confidence: 'low' | 'medium' | 'high' } | null {
  // Simple heuristic - in a real system this would use more sophisticated analysis
  const prob = market.probability;

  // Markets with very high or low probability - suggest contrarian plays for aggressive traders
  if (prob >= 90) {
    return { position: 'no', confidence: 'low' };
  }
  if (prob <= 10) {
    return { position: 'yes', confidence: 'low' };
  }

  // Recent strong movement - momentum play
  if (market.probabilityChange > 10) {
    return { position: 'yes', confidence: 'medium' };
  }
  if (market.probabilityChange < -10) {
    return { position: 'no', confidence: 'medium' };
  }

  return null;
}

// Main recommendation function
export async function getMarketRecommendations(
  preferences: UserPreferences,
  limit = 10
): Promise<MarketRecommendation[]> {
  // Fetch markets
  const markets = await fetchOpenMarkets(200);

  // Score and filter markets
  const scored = markets.map((market) => ({
    market,
    score: scoreMarket(market, preferences),
    reasons: generateReasons(market, preferences),
    ...suggestPosition(market, preferences),
  }));

  // Sort by score and take top N
  const recommendations = scored
    .filter((r) => r.score >= 30) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({
      market: r.market,
      score: r.score,
      reasons: r.reasons,
      suggestedPosition: r.position as 'yes' | 'no' | undefined,
      confidence: (r.confidence || 'low') as 'low' | 'medium' | 'high',
    }));

  return recommendations;
}

// Get trending market recommendations
export async function getTrendingRecommendations(limit = 5): Promise<MarketRecommendation[]> {
  const markets = await fetchTrendingMarkets(limit);

  return markets.map((market) => ({
    market,
    score: 80 + Math.min(20, market.volume24h / 10000),
    reasons: [
      `#${markets.indexOf(market) + 1} trending market`,
      `$${(market.volume24h / 100).toLocaleString()} volume in 24h`,
      market.probabilityChange > 0
        ? `Up ${market.probabilityChange.toFixed(1)}%`
        : `Down ${Math.abs(market.probabilityChange).toFixed(1)}%`,
    ],
    confidence: 'medium' as const,
  }));
}

// Get discovery recommendations (variety of categories)
export async function getDiscoveryRecommendations(limit = 10): Promise<MarketRecommendation[]> {
  const markets = await fetchOpenMarkets(200);

  // Group by category and pick top from each
  const byCategory = new Map<string, ProcessedMarket[]>();
  markets.forEach((market) => {
    const category = market.category || 'Other';
    const existing = byCategory.get(category) || [];
    existing.push(market);
    byCategory.set(category, existing);
  });

  const recommendations: MarketRecommendation[] = [];
  const categories = Array.from(byCategory.keys());

  // Round-robin pick from categories
  let categoryIndex = 0;
  while (recommendations.length < limit && categories.length > 0) {
    const category = categories[categoryIndex % categories.length];
    const categoryMarkets = byCategory.get(category) || [];

    if (categoryMarkets.length > 0) {
      const market = categoryMarkets.shift()!;
      recommendations.push({
        market,
        score: 70,
        reasons: [`Discover: ${category}`, `${categoryMarkets.length + 1} more in this category`],
        confidence: 'medium',
      });
    }

    categoryIndex++;
    if (categoryIndex >= categories.length * 2) break;
  }

  return recommendations;
}
