// Types for AI-powered prediction market advisor features

export interface UserPredictionProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredCategories: string[];
  minProbability: number;
  maxProbability: number;
  investmentGoal?: string;
}

export interface MarketRecommendation {
  marketId: string;
  ticker: string;
  rank: number;
  matchScore: number;
  reasoning: string;
  highlights: string[];
  suggestedPosition?: 'yes' | 'no';
  confidence: 'low' | 'medium' | 'high';
}

export interface RecommendationsResult {
  recommendations: MarketRecommendation[];
  preferenceSummary: string;
  categoryInsights: { category: string; outlook: string }[];
}

export interface MarketInsight {
  summary: string;
  keyFactors: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  probabilityAnalysis: {
    currentProbability: number;
    suggestedRange: { min: number; max: number };
    confidence: 'low' | 'medium' | 'high';
    reasoning: string;
  };
  marketSentiment: 'bullish' | 'neutral' | 'bearish';
  tradingConsiderations: string[];
}

export interface InsightResult {
  marketId: string;
  insight: MarketInsight;
  cached: boolean;
  generatedAt: string;
}

export interface PortfolioPosition {
  marketId: string;
  ticker: string;
  title: string;
  position: 'yes' | 'no';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}

export interface PortfolioAnalysisRequest {
  positions: PortfolioPosition[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface PortfolioAnalysisResult {
  summary: string;
  totalExposure: {
    categories: { category: string; percentage: number }[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  positionReview: {
    marketId: string;
    ticker: string;
    assessment: 'strong' | 'moderate' | 'weak';
    recommendation: string;
    unrealizedPnl: number;
  }[];
  correlationWarnings: string[];
  suggestions: string[];
}

// Minimal market data needed for AI prompts
export interface MarketForAI {
  ticker: string;
  eventTicker: string;
  title: string;
  subtitle?: string;
  category: string;
  status: 'open' | 'closed' | 'settled';
  probability: number;
  probabilityChange: number;
  volume24h: number;
  openInterest: number;
  closeTime: Date;
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  spread: number;
}
