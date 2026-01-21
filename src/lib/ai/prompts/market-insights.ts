// AI Prompt for Market Insights

import { MarketForAI } from '../types';

export function buildInsightsPrompt(market: MarketForAI): string {
  return `You are an AI analyst for Kalshi prediction markets. Provide a detailed analysis of this market.

## Market Data
- Title: ${market.title}
${market.subtitle ? `- Subtitle: ${market.subtitle}` : ''}
- Category: ${market.category}
- Ticker: ${market.ticker}
- Event: ${market.eventTicker}

## Current Pricing
- YES Price: ${market.yesAsk}¢ (Bid: ${market.yesBid}¢)
- NO Price: ${market.noAsk}¢ (Bid: ${market.noBid}¢)
- Spread: ${market.spread}¢
- Implied Probability: ${market.probability}%
- 24h Change: ${market.probabilityChange > 0 ? '+' : ''}${market.probabilityChange.toFixed(1)}%

## Market Activity
- 24h Volume: $${(market.volume24h / 100).toLocaleString()}
- Open Interest: ${market.openInterest.toLocaleString()} contracts
- Closes: ${new Date(market.closeTime).toISOString()}

## Instructions
Provide comprehensive analysis including:
1. A clear summary of what this market is predicting
2. Key factors that could influence the outcome
3. Risk assessment for trading this market
4. Your analysis of whether current probability seems fair
5. Market sentiment based on recent price movement and volume
6. Trading considerations (liquidity, timing, spread impact)

Respond in JSON format:
{
  "summary": "1-2 sentence explanation of the market",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "riskAssessment": {
    "level": "low" | "medium" | "high",
    "factors": ["risk factor 1", "risk factor 2"]
  },
  "probabilityAnalysis": {
    "currentProbability": ${market.probability},
    "suggestedRange": { "min": number, "max": number },
    "confidence": "low" | "medium" | "high",
    "reasoning": "Why you think the probability is fair or mispriced"
  },
  "marketSentiment": "bullish" | "neutral" | "bearish",
  "tradingConsiderations": ["consideration 1", "consideration 2", "consideration 3"]
}

Be objective and analytical. Do not give financial advice, only provide analysis.`;
}

export function buildQuickInsightPrompt(market: MarketForAI): string {
  return `Provide a brief 2-3 sentence analysis of this Kalshi prediction market:

Title: ${market.title}
Category: ${market.category}
Probability: ${market.probability}%
24h Change: ${market.probabilityChange > 0 ? '+' : ''}${market.probabilityChange.toFixed(1)}%
Volume: $${(market.volume24h / 100).toLocaleString()}

Focus on: Why is this market interesting and what's driving the probability?

Keep response under 100 words.`;
}
