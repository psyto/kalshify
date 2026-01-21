// AI Prompt for Market Recommendations

import { UserPredictionProfile, MarketForAI } from '../types';

export function buildRecommendationsPrompt(
  markets: MarketForAI[],
  userProfile: UserPredictionProfile
): string {
  const marketsJson = JSON.stringify(
    markets.map((m) => ({
      ticker: m.ticker,
      title: m.title,
      category: m.category,
      probability: m.probability,
      probabilityChange: m.probabilityChange,
      volume24h: m.volume24h,
      openInterest: m.openInterest,
      closeTime: m.closeTime,
      spread: m.spread,
    })),
    null,
    2
  );

  return `You are an AI advisor for prediction markets on Kalshi. Your role is to recommend markets based on user preferences.

## User Profile
- Risk Tolerance: ${userProfile.riskTolerance}
- Preferred Categories: ${userProfile.preferredCategories.length > 0 ? userProfile.preferredCategories.join(', ') : 'No preference'}
- Probability Range: ${userProfile.minProbability}% - ${userProfile.maxProbability}%
${userProfile.investmentGoal ? `- Investment Goal: ${userProfile.investmentGoal}` : ''}

## Risk Tolerance Guidelines
- Conservative: Prefer markets with probabilities between 25-75%, high volume, tight spreads. Focus on well-established events.
- Moderate: Consider markets with probabilities between 15-85%. Balance opportunity with risk.
- Aggressive: Open to extreme probabilities (5-95%). Seek high potential returns, accept higher risk.

## Available Markets
${marketsJson}

## Instructions
Analyze the markets and recommend the TOP 5 most suitable for this user. For each recommendation:
1. Explain why it matches their profile
2. Highlight key factors (volume, spread, timing)
3. Suggest a position (YES or NO) if appropriate
4. Assess your confidence level

Also provide:
- Category insights for their preferred categories
- General trading advice based on current market conditions

Respond in JSON format:
{
  "recommendations": [
    {
      "ticker": "string",
      "rank": number (1-5),
      "matchScore": number (0-100),
      "reasoning": "string explaining match",
      "highlights": ["key point 1", "key point 2"],
      "suggestedPosition": "yes" | "no" | null,
      "confidence": "low" | "medium" | "high"
    }
  ],
  "categoryInsights": [
    {
      "category": "string",
      "outlook": "string with brief market outlook"
    }
  ],
  "preferenceSummary": "Brief summary of how recommendations align with user preferences"
}`;
}
