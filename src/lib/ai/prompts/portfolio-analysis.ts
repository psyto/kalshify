// AI Prompt for Portfolio Analysis

import { PortfolioPosition } from '../types';

export function buildPortfolioAnalysisPrompt(
  positions: PortfolioPosition[],
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): string {
  const positionsJson = JSON.stringify(
    positions.map((p) => ({
      ticker: p.ticker,
      title: p.title,
      position: p.position,
      quantity: p.quantity,
      entryPrice: p.entryPrice,
      currentPrice: p.currentPrice,
      unrealizedPnl: (p.currentPrice - p.entryPrice) * p.quantity,
      unrealizedPnlPercent: ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100,
    })),
    null,
    2
  );

  return `You are an AI portfolio analyst for prediction market positions on Kalshi. Analyze this portfolio.

## Portfolio Positions
${positionsJson}

## User Risk Tolerance: ${riskTolerance}

## Analysis Guidelines

### For Conservative Users
- Flag positions with extreme probabilities (<20% or >80%)
- Warn about concentrated exposure to single events
- Suggest hedging opportunities

### For Moderate Users
- Balance risk and opportunity assessment
- Note positions approaching key price levels
- Suggest portfolio rebalancing if needed

### For Aggressive Users
- Focus on opportunity identification
- Accept higher-risk positions but note potential downside
- Suggest ways to maximize upside

## Instructions
Analyze the portfolio and provide:
1. Overall portfolio summary and health assessment
2. Category exposure breakdown
3. Individual position reviews
4. Correlation warnings (e.g., multiple positions betting same direction on related events)
5. Actionable suggestions

Respond in JSON format:
{
  "summary": "Overall assessment of portfolio health and strategy",
  "totalExposure": {
    "categories": [
      { "category": "Politics", "percentage": 40 },
      { "category": "Economics", "percentage": 60 }
    ],
    "riskLevel": "low" | "medium" | "high"
  },
  "positionReview": [
    {
      "ticker": "string",
      "assessment": "strong" | "moderate" | "weak",
      "recommendation": "Brief actionable recommendation",
      "unrealizedPnl": number
    }
  ],
  "correlationWarnings": ["Warning about correlated positions if any"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Be specific and actionable. Consider timing, market conditions, and the user's risk profile.`;
}

export function buildPositionSummaryPrompt(positions: PortfolioPosition[]): string {
  const totalCost = positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalPnl = totalValue - totalCost;
  const pnlPercent = (totalPnl / totalCost) * 100;

  return `Summarize this prediction market portfolio in 2-3 sentences:

Positions: ${positions.length}
Total Value: $${(totalValue / 100).toFixed(2)}
Total P&L: ${totalPnl > 0 ? '+' : ''}$${(totalPnl / 100).toFixed(2)} (${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(1)}%)

Categories: ${[...new Set(positions.map((p) => p.title.split(' ')[0]))].join(', ')}

Focus on overall performance and any notable trends.`;
}
