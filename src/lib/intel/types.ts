// Intel System Types

export type SignalType = 'VOLUME_SPIKE' | 'WHALE_ALERT' | 'SOCIAL_INTEL' | 'PRICE_MOVE' | 'SPREAD_CHANGE';
export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SourceType = 'TWITTER' | 'NEWS' | 'SYSTEM';
export type SourceCategory = 'JOURNALIST' | 'POLITICIAN' | 'ANALYST' | 'NEWS';

export interface IntelSignalData {
  type: SignalType;
  severity: SignalSeverity;
  ticker?: string;
  marketTitle?: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
  sourceType?: SourceType;
  sourceHandle?: string;
  sourceUrl?: string;
}

export interface MarketSnapshotData {
  ticker: string;
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  lastPrice: number;
  volume24h: number;
  openInterest: number;
  spread: number;
  probability: number;
}

export interface VolumeChange {
  ticker: string;
  marketTitle: string;
  oldVolume: number;
  newVolume: number;
  changePercent: number;
  timeDiffMinutes: number;
}

export interface PriceChange {
  ticker: string;
  marketTitle: string;
  oldProbability: number;
  newProbability: number;
  changePercent: number;
  timeDiffMinutes: number;
}

export interface SpreadChange {
  ticker: string;
  marketTitle: string;
  oldSpread: number;
  newSpread: number;
  changeAmount: number;
}

export interface IntelSource {
  platform: 'TWITTER' | 'NEWS';
  handle: string;
  displayName: string;
  category: SourceCategory;
  isVerified?: boolean;
}

// Severity thresholds for different signal types
export const SEVERITY_THRESHOLDS = {
  VOLUME_SPIKE: {
    CRITICAL: 500, // 500%+ volume increase
    HIGH: 300,     // 300%+ volume increase
    MEDIUM: 200,   // 200%+ volume increase
    LOW: 100,      // 100%+ volume increase
  },
  PRICE_MOVE: {
    CRITICAL: 20,  // 20%+ probability shift
    HIGH: 15,      // 15%+ probability shift
    MEDIUM: 10,    // 10%+ probability shift
    LOW: 5,        // 5%+ probability shift
  },
  SPREAD_CHANGE: {
    CRITICAL: 10,  // 10+ cent spread change
    HIGH: 7,       // 7+ cent spread change
    MEDIUM: 5,     // 5+ cent spread change
    LOW: 3,        // 3+ cent spread change
  },
} as const;

// Time windows for comparisons (in minutes)
export const TIME_WINDOWS = {
  VOLUME_COMPARISON: 30,     // Compare volume over 30 minutes
  PRICE_COMPARISON: 15,      // Compare prices over 15 minutes
  SNAPSHOT_RETENTION: 1440,  // Keep snapshots for 24 hours
} as const;
