// Smart Money Detection Engine
// Detects anomalies in market data that could indicate informed trading

import { MarketSnapshot } from '@prisma/client';
import {
  SignalType,
  SignalSeverity,
  IntelSignalData,
  VolumeChange,
  PriceChange,
  SpreadChange,
  SEVERITY_THRESHOLDS,
} from './types';

export interface DetectionResult {
  signals: IntelSignalData[];
  volumeChanges: VolumeChange[];
  priceChanges: PriceChange[];
  spreadChanges: SpreadChange[];
}

export interface MarketWithSnapshot {
  ticker: string;
  title: string;
  yesBid: number;
  yesAsk: number;
  noBid: number;
  noAsk: number;
  lastPrice: number;
  volume24h: number;
  openInterest: number;
}

function calculateSeverity(
  value: number,
  thresholds: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }
): SignalSeverity {
  if (value >= thresholds.CRITICAL) return 'CRITICAL';
  if (value >= thresholds.HIGH) return 'HIGH';
  if (value >= thresholds.MEDIUM) return 'MEDIUM';
  if (value >= thresholds.LOW) return 'LOW';
  return 'LOW';
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function detectVolumeSpikes(
  currentMarkets: MarketWithSnapshot[],
  previousSnapshots: MarketSnapshot[],
  timeDiffMinutes: number
): { signals: IntelSignalData[]; changes: VolumeChange[] } {
  const signals: IntelSignalData[] = [];
  const changes: VolumeChange[] = [];

  // Create lookup map for previous snapshots
  const snapshotMap = new Map<string, MarketSnapshot>();
  previousSnapshots.forEach((snap) => {
    snapshotMap.set(snap.ticker, snap);
  });

  for (const market of currentMarkets) {
    const previousSnapshot = snapshotMap.get(market.ticker);
    if (!previousSnapshot) continue;

    const oldVolume = previousSnapshot.volume24h;
    const newVolume = market.volume24h;

    // Skip if old volume is too low (avoid division issues)
    if (oldVolume < 100) continue;

    const volumeIncrease = newVolume - oldVolume;
    const changePercent = (volumeIncrease / oldVolume) * 100;

    // Only detect significant increases (>100% in the time window)
    if (changePercent >= SEVERITY_THRESHOLDS.VOLUME_SPIKE.LOW) {
      const severity = calculateSeverity(changePercent, SEVERITY_THRESHOLDS.VOLUME_SPIKE);

      changes.push({
        ticker: market.ticker,
        marketTitle: market.title,
        oldVolume,
        newVolume,
        changePercent,
        timeDiffMinutes,
      });

      signals.push({
        type: 'VOLUME_SPIKE',
        severity,
        ticker: market.ticker,
        marketTitle: market.title,
        title: 'VOLUME SPIKE DETECTED',
        description: `${market.title} - Volume ${formatPercent(changePercent)} (${timeDiffMinutes}min) | Vol: ${formatCurrency(newVolume)}`,
        data: {
          oldVolume,
          newVolume,
          changePercent,
          timeDiffMinutes,
          volumeIncrease,
        },
        sourceType: 'SYSTEM',
      });
    }
  }

  return { signals, changes };
}

export function detectPriceMoves(
  currentMarkets: MarketWithSnapshot[],
  previousSnapshots: MarketSnapshot[],
  timeDiffMinutes: number
): { signals: IntelSignalData[]; changes: PriceChange[] } {
  const signals: IntelSignalData[] = [];
  const changes: PriceChange[] = [];

  const snapshotMap = new Map<string, MarketSnapshot>();
  previousSnapshots.forEach((snap) => {
    snapshotMap.set(snap.ticker, snap);
  });

  for (const market of currentMarkets) {
    const previousSnapshot = snapshotMap.get(market.ticker);
    if (!previousSnapshot) continue;

    const oldProbability = previousSnapshot.probability;
    const newProbability = market.yesAsk; // Using yesAsk as probability proxy

    const changePercent = Math.abs(newProbability - oldProbability);

    // Detect significant price movements (>5% probability shift)
    if (changePercent >= SEVERITY_THRESHOLDS.PRICE_MOVE.LOW) {
      const severity = calculateSeverity(changePercent, SEVERITY_THRESHOLDS.PRICE_MOVE);
      const direction = newProbability > oldProbability ? 'UP' : 'DOWN';

      changes.push({
        ticker: market.ticker,
        marketTitle: market.title,
        oldProbability,
        newProbability,
        changePercent,
        timeDiffMinutes,
      });

      signals.push({
        type: 'PRICE_MOVE',
        severity,
        ticker: market.ticker,
        marketTitle: market.title,
        title: `RAPID PRICE ${direction}`,
        description: `${market.title} - ${oldProbability}% → ${newProbability}% (${direction === 'UP' ? '+' : '-'}${changePercent}% in ${timeDiffMinutes}min)`,
        data: {
          oldProbability,
          newProbability,
          changePercent,
          direction,
          timeDiffMinutes,
        },
        sourceType: 'SYSTEM',
      });
    }
  }

  return { signals, changes };
}

export function detectSpreadChanges(
  currentMarkets: MarketWithSnapshot[],
  previousSnapshots: MarketSnapshot[]
): { signals: IntelSignalData[]; changes: SpreadChange[] } {
  const signals: IntelSignalData[] = [];
  const changes: SpreadChange[] = [];

  const snapshotMap = new Map<string, MarketSnapshot>();
  previousSnapshots.forEach((snap) => {
    snapshotMap.set(snap.ticker, snap);
  });

  for (const market of currentMarkets) {
    const previousSnapshot = snapshotMap.get(market.ticker);
    if (!previousSnapshot) continue;

    const oldSpread = previousSnapshot.spread;
    const newSpread = market.yesAsk - market.yesBid;
    const spreadChange = Math.abs(newSpread - oldSpread);

    // Detect significant spread changes (>3 cents)
    if (spreadChange >= SEVERITY_THRESHOLDS.SPREAD_CHANGE.LOW) {
      const severity = calculateSeverity(spreadChange, SEVERITY_THRESHOLDS.SPREAD_CHANGE);
      const direction = newSpread > oldSpread ? 'WIDENING' : 'TIGHTENING';

      changes.push({
        ticker: market.ticker,
        marketTitle: market.title,
        oldSpread,
        newSpread,
        changeAmount: spreadChange,
      });

      signals.push({
        type: 'SPREAD_CHANGE',
        severity,
        ticker: market.ticker,
        marketTitle: market.title,
        title: `SPREAD ${direction}`,
        description: `${market.title} - Spread ${oldSpread}¢ → ${newSpread}¢ (${direction === 'WIDENING' ? '+' : '-'}${spreadChange}¢)`,
        data: {
          oldSpread,
          newSpread,
          spreadChange,
          direction,
        },
        sourceType: 'SYSTEM',
      });
    }
  }

  return { signals, changes };
}

export function detectWhaleActivity(
  currentMarkets: MarketWithSnapshot[],
  previousSnapshots: MarketSnapshot[],
  timeDiffMinutes: number
): IntelSignalData[] {
  const signals: IntelSignalData[] = [];

  const snapshotMap = new Map<string, MarketSnapshot>();
  previousSnapshots.forEach((snap) => {
    snapshotMap.set(snap.ticker, snap);
  });

  for (const market of currentMarkets) {
    const previousSnapshot = snapshotMap.get(market.ticker);
    if (!previousSnapshot) continue;

    const oldOI = previousSnapshot.openInterest;
    const newOI = market.openInterest;
    const oiChange = newOI - oldOI;

    // Detect large open interest changes (>$5000 in short time)
    // Combined with volume spike could indicate whale activity
    if (oiChange > 500000 && timeDiffMinutes <= 30) { // 500000 cents = $5000
      const oldVolume = previousSnapshot.volume24h;
      const newVolume = market.volume24h;
      const volumeChange = ((newVolume - oldVolume) / Math.max(oldVolume, 1)) * 100;

      // Only flag as whale if both OI and volume increased significantly
      if (volumeChange > 50) {
        signals.push({
          type: 'WHALE_ALERT',
          severity: oiChange > 1000000 ? 'CRITICAL' : oiChange > 750000 ? 'HIGH' : 'MEDIUM',
          ticker: market.ticker,
          marketTitle: market.title,
          title: 'WHALE ACTIVITY SUSPECTED',
          description: `${market.title} - OI ${formatCurrency(oiChange)} in ${timeDiffMinutes}min | Large position detected`,
          data: {
            oldOI,
            newOI,
            oiChange,
            volumeChange,
            timeDiffMinutes,
          },
          sourceType: 'SYSTEM',
        });
      }
    }
  }

  return signals;
}

export function runDetection(
  currentMarkets: MarketWithSnapshot[],
  previousSnapshots: MarketSnapshot[],
  timeDiffMinutes: number = 30
): DetectionResult {
  const volumeResult = detectVolumeSpikes(currentMarkets, previousSnapshots, timeDiffMinutes);
  const priceResult = detectPriceMoves(currentMarkets, previousSnapshots, timeDiffMinutes);
  const spreadResult = detectSpreadChanges(currentMarkets, previousSnapshots);
  const whaleSignals = detectWhaleActivity(currentMarkets, previousSnapshots, timeDiffMinutes);

  const allSignals = [
    ...volumeResult.signals,
    ...priceResult.signals,
    ...spreadResult.signals,
    ...whaleSignals,
  ];

  // Sort by severity (CRITICAL first)
  const severityOrder: Record<SignalSeverity, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  allSignals.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    signals: allSignals,
    volumeChanges: volumeResult.changes,
    priceChanges: priceResult.changes,
    spreadChanges: spreadResult.changes,
  };
}
