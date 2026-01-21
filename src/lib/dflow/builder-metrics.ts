// Builder Code Metrics Tracking
// Tracks volume and fees for grant application

import { prisma } from '@/lib/db';
import { getDFlowClient } from './client';

export interface DailyMetrics {
  date: Date;
  totalVolume: number;
  transactionCount: number;
  uniqueUsers: number;
  feesEarned: number;
}

// Record a trade for builder code metrics
export async function recordTrade(params: {
  walletAddress: string;
  volume: number;
  fee: number;
}): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert daily metrics
  await prisma.builderCodeMetrics.upsert({
    where: { date: today },
    create: {
      date: today,
      totalVolume: params.volume,
      transactionCount: 1,
      uniqueUsers: 1,
      feesEarned: params.fee,
    },
    update: {
      totalVolume: { increment: params.volume },
      transactionCount: { increment: 1 },
      feesEarned: { increment: params.fee },
      // Note: uniqueUsers increment logic would need more sophisticated tracking
    },
  });
}

// Get metrics for date range
export async function getMetrics(startDate: Date, endDate: Date): Promise<DailyMetrics[]> {
  const metrics = await prisma.builderCodeMetrics.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  return metrics.map((m) => ({
    date: m.date,
    totalVolume: m.totalVolume,
    transactionCount: m.transactionCount,
    uniqueUsers: m.uniqueUsers,
    feesEarned: m.feesEarned,
  }));
}

// Get summary metrics
export async function getMetricsSummary(): Promise<{
  totalVolume: number;
  totalTransactions: number;
  totalFees: number;
  dailyAvgVolume: number;
  last7DaysVolume: number;
  last30DaysVolume: number;
}> {
  const allMetrics = await prisma.builderCodeMetrics.findMany();

  const totalVolume = allMetrics.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalTransactions = allMetrics.reduce((sum, m) => sum + m.transactionCount, 0);
  const totalFees = allMetrics.reduce((sum, m) => sum + m.feesEarned, 0);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const last7Days = allMetrics.filter((m) => m.date >= sevenDaysAgo);
  const last30Days = allMetrics.filter((m) => m.date >= thirtyDaysAgo);

  return {
    totalVolume,
    totalTransactions,
    totalFees,
    dailyAvgVolume: allMetrics.length > 0 ? totalVolume / allMetrics.length : 0,
    last7DaysVolume: last7Days.reduce((sum, m) => sum + m.totalVolume, 0),
    last30DaysVolume: last30Days.reduce((sum, m) => sum + m.totalVolume, 0),
  };
}

// Sync metrics from DFlow API
export async function syncMetricsFromDFlow(): Promise<void> {
  const client = getDFlowClient();
  if (!client) {
    console.warn('DFlow client not configured, skipping metrics sync');
    return;
  }

  try {
    const stats = await client.getBuilderCodeStats();

    // This would update local metrics based on DFlow API data
    // Implementation depends on DFlow API response structure
    console.log('Synced builder code stats:', stats);
  } catch (error) {
    console.error('Failed to sync DFlow metrics:', error);
  }
}
