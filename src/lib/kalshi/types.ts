// Kalshi API Types
// Reference: https://trading-api.readme.io/reference

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  status: 'open' | 'closed' | 'settled';
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_price?: number;
  previous_yes_bid?: number;
  previous_yes_ask?: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  result?: 'yes' | 'no';
  category: string;
  risk_limit_cents?: number;
  notional_value: number;
  tick_size: number;
  yes_sub_title?: string;
  no_sub_title?: string;
  can_close_early: boolean;
  expiration_value?: string;
  rules_primary?: string;
  rules_secondary?: string;
  floor_strike?: number;
  cap_strike?: number;
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  mutually_exclusive: boolean;
  category: string;
  markets: KalshiMarket[];
  strike_period?: {
    floor: number;
    cap: number;
  };
}

export interface KalshiSeries {
  ticker: string;
  title: string;
  category: string;
  frequency?: string;
  tags?: string[];
}

export interface KalshiOrderbook {
  ticker: string;
  yes_bids: OrderbookLevel[];
  yes_asks: OrderbookLevel[];
  no_bids: OrderbookLevel[];
  no_asks: OrderbookLevel[];
}

export interface OrderbookLevel {
  price: number;
  count: number;
}

export interface KalshiTrade {
  trade_id: string;
  ticker: string;
  created_time: string;
  yes_price: number;
  no_price: number;
  count: number;
  taker_side: 'yes' | 'no';
}

export interface KalshiHistoricalPrice {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KalshiExchangeStatus {
  exchange_active: boolean;
  trading_active: boolean;
}

// API Response types
export interface MarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
}

export interface EventResponse {
  event: KalshiEvent;
}

export interface EventsResponse {
  events: KalshiEvent[];
  cursor?: string;
}

export interface SeriesResponse {
  series: KalshiSeries;
}

export interface OrderbookResponse {
  orderbook: KalshiOrderbook;
}

export interface TradesResponse {
  trades: KalshiTrade[];
  cursor?: string;
}

export interface HistoryResponse {
  history: KalshiHistoricalPrice[];
  ticker: string;
}

// Query parameters
export interface MarketsQueryParams {
  limit?: number;
  cursor?: string;
  event_ticker?: string;
  series_ticker?: string;
  status?: 'open' | 'closed' | 'settled';
  tickers?: string;
  min_close_ts?: number;
  max_close_ts?: number;
}

export interface EventsQueryParams {
  limit?: number;
  cursor?: string;
  status?: 'open' | 'closed' | 'settled';
  series_ticker?: string;
  with_nested_markets?: boolean;
}

export interface TradesQueryParams {
  limit?: number;
  cursor?: string;
  ticker?: string;
  min_ts?: number;
  max_ts?: number;
}

export interface HistoryQueryParams {
  ticker: string;
  period_interval?: number; // minutes
  start_ts?: number;
  end_ts?: number;
}

// Kalshi market categories
export const KALSHI_CATEGORIES = [
  'Politics',
  'Economics',
  'Climate',
  'Tech',
  'Sports',
  'Entertainment',
  'Science',
  'Health',
  'Finance',
  'Crypto',
] as const;

export type KalshiCategory = (typeof KALSHI_CATEGORIES)[number];

// Processed market type for UI
export interface ProcessedMarket {
  ticker: string;
  eventTicker: string;
  title: string;
  subtitle?: string;
  category: string;
  status: 'open' | 'closed' | 'settled';
  probability: number; // 0-100, derived from yes_ask
  previousProbability?: number;
  probabilityChange: number;
  volume24h: number;
  openInterest: number;
  closeTime: Date;
  result?: 'yes' | 'no';
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  spread: number;
}

export interface ProcessedEvent {
  eventTicker: string;
  seriesTicker: string;
  title: string;
  subtitle?: string;
  category: string;
  markets: ProcessedMarket[];
  isMutuallyExclusive: boolean;
}

// User position types
export interface UserPosition {
  marketId: string;
  marketTitle: string;
  position: 'yes' | 'no';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}
