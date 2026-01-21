// Market fetching and processing utilities for Kalshi data

import { getKalshiClient } from './client';
import {
  KalshiMarket,
  KalshiEvent,
  ProcessedMarket,
  ProcessedEvent,
  KALSHI_CATEGORIES,
} from './types';

// Map Kalshi API status to our normalized status
function normalizeStatus(status: string): 'open' | 'closed' | 'settled' {
  // Kalshi API uses 'active' for open markets
  if (status === 'active' || status === 'open') return 'open';
  if (status === 'closed') return 'closed';
  if (status === 'settled' || status === 'finalized') return 'settled';
  return 'open'; // default fallback
}

// Process a raw Kalshi market into a more usable format
export function processMarket(market: KalshiMarket): ProcessedMarket {
  const probability = market.yes_ask; // yes_ask is the price in cents (0-100)
  const previousProbability = market.previous_yes_ask ?? probability;
  const probabilityChange = probability - previousProbability;
  const spread = market.yes_ask - market.yes_bid;

  return {
    ticker: market.ticker,
    eventTicker: market.event_ticker,
    title: market.title,
    subtitle: market.subtitle,
    category: market.category || 'Other',
    status: normalizeStatus(market.status as string),
    probability,
    previousProbability,
    probabilityChange,
    volume24h: market.volume_24h,
    openInterest: market.open_interest,
    closeTime: new Date(market.close_time),
    result: market.result,
    yesBid: market.yes_bid,
    yesAsk: market.yes_ask,
    noBid: market.no_bid,
    noAsk: market.no_ask,
    spread,
  };
}

// Process an event with its markets
export function processEvent(event: KalshiEvent): ProcessedEvent {
  return {
    eventTicker: event.event_ticker,
    seriesTicker: event.series_ticker,
    title: event.title,
    subtitle: event.subtitle,
    category: event.category || 'Other',
    markets: event.markets.map(processMarket),
    isMutuallyExclusive: event.mutually_exclusive,
  };
}

// Fetch and process all open markets
export async function fetchOpenMarkets(limit = 100): Promise<ProcessedMarket[]> {
  const client = getKalshiClient();
  const response = await client.getMarkets({ status: 'open', limit });
  return response.markets.map(processMarket);
}

// Fetch trending markets (highest 24h volume)
export async function fetchTrendingMarkets(limit = 10): Promise<ProcessedMarket[]> {
  const client = getKalshiClient();
  const markets = await client.getTrendingMarkets(limit);
  return markets.map(processMarket);
}

// Fetch markets by category
export async function fetchMarketsByCategory(
  category: string,
  limit = 50
): Promise<ProcessedMarket[]> {
  const client = getKalshiClient();
  const markets = await client.getMarketsByCategory(category, limit);
  return markets.map(processMarket);
}

// Fetch markets closing soon
export async function fetchMarketsClosingSoon(
  withinHours = 24,
  limit = 10
): Promise<ProcessedMarket[]> {
  const client = getKalshiClient();
  const markets = await client.getMarketsClosingSoon(withinHours, limit);
  return markets.map(processMarket);
}

// Fetch market with orderbook data
export async function fetchMarketWithOrderbook(ticker: string) {
  const client = getKalshiClient();
  const [market, orderbook] = await Promise.all([
    client.getMarket(ticker),
    client.getMarketOrderbook(ticker),
  ]);

  return {
    market: processMarket(market),
    orderbook,
  };
}

// Fetch market historical prices
export async function fetchMarketHistory(
  ticker: string,
  periodInterval = 60, // 60 minutes = hourly
  startTs?: number,
  endTs?: number
) {
  const client = getKalshiClient();
  const response = await client.getMarketHistory({
    ticker,
    period_interval: periodInterval,
    start_ts: startTs,
    end_ts: endTs,
  });

  return response.history.map((point) => ({
    timestamp: new Date(point.ts * 1000),
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
  }));
}

// Fetch event with all its markets
export async function fetchEvent(eventTicker: string): Promise<ProcessedEvent> {
  const client = getKalshiClient();
  const event = await client.getEvent(eventTicker, true);
  return processEvent(event);
}

// Get all available categories from markets
export async function fetchCategories(): Promise<string[]> {
  const client = getKalshiClient();
  const response = await client.getMarkets({ status: 'open', limit: 500 });

  const categories = new Set<string>();
  response.markets.forEach((market) => {
    if (market.category) {
      categories.add(market.category);
    }
  });

  return Array.from(categories).sort();
}

// Search markets by title
export async function searchMarkets(query: string, limit = 20): Promise<ProcessedMarket[]> {
  const client = getKalshiClient();
  const response = await client.getMarkets({ status: 'open', limit: 200 });

  const lowerQuery = query.toLowerCase();
  const filtered = response.markets.filter(
    (m) =>
      m.title.toLowerCase().includes(lowerQuery) ||
      m.subtitle?.toLowerCase().includes(lowerQuery)
  );

  return filtered.slice(0, limit).map(processMarket);
}

// Calculate market statistics
export interface MarketStats {
  totalMarkets: number;
  totalVolume24h: number;
  totalOpenInterest: number;
  categoryBreakdown: { category: string; count: number; volume: number }[];
  avgSpread: number;
}

export async function fetchMarketStats(): Promise<MarketStats> {
  const client = getKalshiClient();
  const response = await client.getMarkets({ status: 'open', limit: 500 });
  const markets = response.markets;

  const categoryMap = new Map<string, { count: number; volume: number }>();

  let totalVolume24h = 0;
  let totalOpenInterest = 0;
  let totalSpread = 0;

  markets.forEach((market) => {
    totalVolume24h += market.volume_24h;
    totalOpenInterest += market.open_interest;
    totalSpread += market.yes_ask - market.yes_bid;

    const category = market.category || 'Other';
    const existing = categoryMap.get(category) || { count: 0, volume: 0 };
    categoryMap.set(category, {
      count: existing.count + 1,
      volume: existing.volume + market.volume_24h,
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.volume - a.volume);

  return {
    totalMarkets: markets.length,
    totalVolume24h,
    totalOpenInterest,
    categoryBreakdown,
    avgSpread: markets.length > 0 ? totalSpread / markets.length : 0,
  };
}
