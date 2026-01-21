// AI-powered Market Advisor for Kalshi Prediction Markets

import Anthropic from '@anthropic-ai/sdk';
import {
  UserPredictionProfile,
  MarketForAI,
  RecommendationsResult,
  MarketInsight,
  PortfolioPosition,
  PortfolioAnalysisResult,
} from './types';
import { buildRecommendationsPrompt } from './prompts/market-recommendations';
import { buildInsightsPrompt, buildQuickInsightPrompt } from './prompts/market-insights';
import { buildPortfolioAnalysisPrompt } from './prompts/portfolio-analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Get personalized market recommendations
export async function getMarketRecommendations(
  markets: MarketForAI[],
  userProfile: UserPredictionProfile
): Promise<RecommendationsResult> {
  const prompt = buildRecommendationsPrompt(markets, userProfile);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse recommendations response');
  }

  return JSON.parse(jsonMatch[0]) as RecommendationsResult;
}

// Get detailed insights for a single market
export async function getMarketInsight(market: MarketForAI): Promise<MarketInsight> {
  const prompt = buildInsightsPrompt(market);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse insight response');
  }

  return JSON.parse(jsonMatch[0]) as MarketInsight;
}

// Get quick insight for a market (shorter, cheaper)
export async function getQuickMarketInsight(market: MarketForAI): Promise<string> {
  const prompt = buildQuickInsightPrompt(market);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return content.text;
}

// Analyze user's portfolio
export async function analyzePortfolio(
  positions: PortfolioPosition[],
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): Promise<PortfolioAnalysisResult> {
  const prompt = buildPortfolioAnalysisPrompt(positions, riskTolerance);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse portfolio analysis response');
  }

  return JSON.parse(jsonMatch[0]) as PortfolioAnalysisResult;
}

// Conversational market analysis
export async function chatAboutMarket(
  market: MarketForAI,
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const systemPrompt = `You are an AI analyst helping users understand prediction markets on Kalshi.
You're discussing this market:
- Title: ${market.title}
- Category: ${market.category}
- Current Probability: ${market.probability}%
- 24h Change: ${market.probabilityChange > 0 ? '+' : ''}${market.probabilityChange.toFixed(1)}%

Be helpful, informative, and objective. Don't give financial advice.`;

  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return content.text;
}
