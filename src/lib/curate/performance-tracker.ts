/**
 * Performance Tracker
 * Tracks historical performance of fabrknt allocation recommendations
 * to build trust through transparency
 */

import { prisma } from "@/lib/db";
import { generateRecommendation } from "./recommendation-engine";
import { RiskTolerance } from "@/components/curate/quick-start";
import { Prisma } from "@prisma/client";

// Risk profiles to track (5-level system)
const RISK_PROFILES: RiskTolerance[] = ["preserver", "steady", "balanced", "growth", "maximizer"];

// Reference amount for tracking (doesn't affect % returns)
const REFERENCE_AMOUNT = 10000;

export interface AllocationSnapshotData {
    poolId: string;
    poolName: string;
    protocol: string;
    asset: string;
    allocation: number;
    apy: number;
    riskScore: number;
}

export interface PoolPerformanceData {
    poolId: string;
    poolName: string;
    expectedApy: number;
    actualApy7d: number | null;
    actualApy30d: number | null;
}

export interface PerformanceSummary {
    riskProfile: string;
    displayName: string;
    latestSnapshot: {
        date: string;
        expectedApy: number;
        weightedRiskScore: number;
        allocations: AllocationSnapshotData[];
    } | null;
    performance: {
        return7d: number | null;
        return30d: number | null;
        return7dAnnualized: number | null;
        return30dAnnualized: number | null;
    };
    trend: "up" | "down" | "stable";
    snapshotCount: number;
}

/**
 * Create a daily snapshot for a specific risk profile
 */
export async function createDailySnapshot(riskProfile: RiskTolerance): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if snapshot already exists for today
    const existing = await prisma.allocationSnapshot.findUnique({
        where: {
            date_riskProfile: {
                date: today,
                riskProfile,
            },
        },
    });

    if (existing) {
        console.log(`Snapshot already exists for ${riskProfile} on ${today.toISOString().split("T")[0]}`);
        return;
    }

    // Generate current recommendation
    const recommendation = generateRecommendation(REFERENCE_AMOUNT, riskProfile);

    // Transform allocations to snapshot format
    const allocations: AllocationSnapshotData[] = recommendation.allocations.map(alloc => ({
        poolId: alloc.poolId,
        poolName: alloc.poolName,
        protocol: alloc.protocol,
        asset: alloc.asset,
        allocation: alloc.allocation,
        apy: alloc.apy,
        riskScore: alloc.riskScore,
    }));

    // Calculate weighted metrics
    const weightedRiskScore = recommendation.allocations.reduce(
        (sum, a) => sum + (a.riskScore * a.allocation / 100),
        0
    );

    // Create snapshot
    await prisma.allocationSnapshot.create({
        data: {
            date: today,
            riskProfile,
            allocations: allocations as unknown as Prisma.InputJsonValue,
            expectedApy: recommendation.summary.expectedApy,
            weightedRiskScore,
        },
    });

    console.log(`Created snapshot for ${riskProfile}: ${recommendation.summary.expectedApy.toFixed(2)}% APY`);
}

/**
 * Create daily snapshots for all risk profiles
 */
export async function createAllDailySnapshots(): Promise<void> {
    for (const profile of RISK_PROFILES) {
        try {
            await createDailySnapshot(profile);
        } catch (error) {
            console.error(`Failed to create snapshot for ${profile}:`, error);
        }
    }
}

/**
 * Update actual returns for past snapshots
 * This should be called daily to fill in performance data
 */
export async function updateActualReturns(): Promise<void> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Update 7-day returns for snapshots from 7 days ago
    const snapshots7d = await prisma.allocationSnapshot.findMany({
        where: {
            date: sevenDaysAgo,
            actualReturn7d: null,
        },
    });

    for (const snapshot of snapshots7d) {
        // Calculate actual return based on expected APY
        // In production, this would fetch actual pool performance from DeFiLlama history
        // For now, we simulate with slight variance from expected
        const allocations = snapshot.allocations as unknown as AllocationSnapshotData[];
        const actualReturn = calculateSimulatedReturn(allocations, 7);

        await prisma.allocationSnapshot.update({
            where: { id: snapshot.id },
            data: { actualReturn7d: actualReturn },
        });
    }

    // Update 30-day returns for snapshots from 30 days ago
    const snapshots30d = await prisma.allocationSnapshot.findMany({
        where: {
            date: thirtyDaysAgo,
            actualReturn30d: null,
        },
    });

    for (const snapshot of snapshots30d) {
        const allocations = snapshot.allocations as unknown as AllocationSnapshotData[];
        const actualReturn = calculateSimulatedReturn(allocations, 30);

        await prisma.allocationSnapshot.update({
            where: { id: snapshot.id },
            data: { actualReturn30d: actualReturn },
        });
    }
}

/**
 * Calculate simulated return based on allocations
 * In production, this would use actual historical APY data from DeFiLlama
 */
function calculateSimulatedReturn(allocations: AllocationSnapshotData[], days: number): number {
    // Weight the return by allocation percentage
    const weightedApy = allocations.reduce(
        (sum, a) => sum + (a.apy * a.allocation / 100),
        0
    );

    // Add realistic variance (-15% to +10% of expected)
    // This simulates real market conditions where yields fluctuate
    const varianceFactor = 0.85 + Math.random() * 0.25;
    const adjustedApy = weightedApy * varianceFactor;

    // Convert annual APY to period return
    // return = (1 + APY/100)^(days/365) - 1
    const periodReturn = (Math.pow(1 + adjustedApy / 100, days / 365) - 1) * 100;

    return Math.round(periodReturn * 1000) / 1000; // 3 decimal places
}

/**
 * Get performance summary for all risk profiles
 */
export async function getPerformanceSummaries(): Promise<PerformanceSummary[]> {
    const summaries: PerformanceSummary[] = [];

    for (const profile of RISK_PROFILES) {
        const summary = await getPerformanceSummary(profile);
        summaries.push(summary);
    }

    return summaries;
}

/**
 * Get performance summary for a specific risk profile
 */
export async function getPerformanceSummary(riskProfile: RiskTolerance): Promise<PerformanceSummary> {
    const displayNames: Record<RiskTolerance, string> = {
        preserver: "Preserver",
        steady: "Steady",
        balanced: "Balanced",
        growth: "Growth",
        maximizer: "Maximizer",
    };

    // Get latest snapshot
    const latestSnapshot = await prisma.allocationSnapshot.findFirst({
        where: { riskProfile },
        orderBy: { date: "desc" },
    });

    // Get snapshot count
    const snapshotCount = await prisma.allocationSnapshot.count({
        where: { riskProfile },
    });

    // Get recent snapshots with actual returns
    const recentWithReturns = await prisma.allocationSnapshot.findMany({
        where: {
            riskProfile,
            OR: [
                { actualReturn7d: { not: null } },
                { actualReturn30d: { not: null } },
            ],
        },
        orderBy: { date: "desc" },
        take: 5,
    });

    // Calculate average returns
    const returns7d = recentWithReturns
        .map(s => s.actualReturn7d)
        .filter((r): r is number => r !== null);
    const returns30d = recentWithReturns
        .map(s => s.actualReturn30d)
        .filter((r): r is number => r !== null);

    const avgReturn7d = returns7d.length > 0
        ? returns7d.reduce((a, b) => a + b, 0) / returns7d.length
        : null;
    const avgReturn30d = returns30d.length > 0
        ? returns30d.reduce((a, b) => a + b, 0) / returns30d.length
        : null;

    // Annualize returns
    const return7dAnnualized = avgReturn7d !== null
        ? (Math.pow(1 + avgReturn7d / 100, 365 / 7) - 1) * 100
        : null;
    const return30dAnnualized = avgReturn30d !== null
        ? (Math.pow(1 + avgReturn30d / 100, 365 / 30) - 1) * 100
        : null;

    // Determine trend based on recent performance vs expected
    let trend: "up" | "down" | "stable" = "stable";
    if (latestSnapshot && avgReturn30d !== null) {
        const expectedMonthlyReturn = (Math.pow(1 + latestSnapshot.expectedApy / 100, 30 / 365) - 1) * 100;
        if (avgReturn30d > expectedMonthlyReturn * 1.05) {
            trend = "up";
        } else if (avgReturn30d < expectedMonthlyReturn * 0.95) {
            trend = "down";
        }
    }

    return {
        riskProfile,
        displayName: displayNames[riskProfile],
        latestSnapshot: latestSnapshot ? {
            date: latestSnapshot.date.toISOString().split("T")[0],
            expectedApy: latestSnapshot.expectedApy,
            weightedRiskScore: latestSnapshot.weightedRiskScore,
            allocations: latestSnapshot.allocations as unknown as AllocationSnapshotData[],
        } : null,
        performance: {
            return7d: avgReturn7d !== null ? Math.round(avgReturn7d * 1000) / 1000 : null,
            return30d: avgReturn30d !== null ? Math.round(avgReturn30d * 1000) / 1000 : null,
            return7dAnnualized: return7dAnnualized !== null ? Math.round(return7dAnnualized * 10) / 10 : null,
            return30dAnnualized: return30dAnnualized !== null ? Math.round(return30dAnnualized * 10) / 10 : null,
        },
        trend,
        snapshotCount,
    };
}

/**
 * Get historical performance data for charting
 */
export async function getHistoricalPerformance(
    riskProfile: RiskTolerance,
    days: number = 30
): Promise<{
    date: string;
    expectedApy: number;
    actualReturn: number | null;
}[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await prisma.allocationSnapshot.findMany({
        where: {
            riskProfile,
            date: { gte: startDate },
        },
        orderBy: { date: "asc" },
    });

    return snapshots.map(s => ({
        date: s.date.toISOString().split("T")[0],
        expectedApy: s.expectedApy,
        actualReturn: s.actualReturn7d,
    }));
}

/**
 * Seed initial snapshots with historical data
 * This creates backdated snapshots for demo/development purposes
 */
export async function seedHistoricalSnapshots(daysBack: number = 30): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = daysBack; i >= 0; i--) {
        const snapshotDate = new Date(today);
        snapshotDate.setDate(snapshotDate.getDate() - i);

        for (const profile of RISK_PROFILES) {
            try {
                // Check if already exists
                const existing = await prisma.allocationSnapshot.findUnique({
                    where: {
                        date_riskProfile: {
                            date: snapshotDate,
                            riskProfile: profile,
                        },
                    },
                });

                if (existing) continue;

                // Generate recommendation
                const recommendation = generateRecommendation(REFERENCE_AMOUNT, profile);

                const allocations: AllocationSnapshotData[] = recommendation.allocations.map(alloc => ({
                    poolId: alloc.poolId,
                    poolName: alloc.poolName,
                    protocol: alloc.protocol,
                    asset: alloc.asset,
                    allocation: alloc.allocation,
                    apy: alloc.apy,
                    riskScore: alloc.riskScore,
                }));

                const weightedRiskScore = recommendation.allocations.reduce(
                    (sum, a) => sum + (a.riskScore * a.allocation / 100),
                    0
                );

                // Calculate simulated actual returns for past dates
                let actualReturn7d: number | null = null;
                let actualReturn30d: number | null = null;

                if (i >= 7) {
                    actualReturn7d = calculateSimulatedReturn(allocations, 7);
                }
                if (i >= 30) {
                    actualReturn30d = calculateSimulatedReturn(allocations, 30);
                }

                await prisma.allocationSnapshot.create({
                    data: {
                        date: snapshotDate,
                        riskProfile: profile,
                        allocations: allocations as unknown as Prisma.InputJsonValue,
                        expectedApy: recommendation.summary.expectedApy,
                        weightedRiskScore,
                        actualReturn7d,
                        actualReturn30d,
                    },
                });
            } catch (error) {
                // Skip if duplicate or other error
                console.error(`Error seeding ${profile} for ${snapshotDate.toISOString().split("T")[0]}:`, error);
            }
        }
    }

    console.log(`Seeded ${daysBack} days of historical snapshots`);
}
