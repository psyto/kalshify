/**
 * Curator strategy data and analysis
 * Phase 1: Static/curated data from public sources
 * Phase 2+: Will integrate with on-chain data
 */

import { getCurator, CuratorProfile } from "./curators";

export interface StrategyAllocation {
    pool: string;
    asset: string;
    allocation: number; // Percentage
    apy: number;
    riskLevel: "low" | "medium" | "high";
    poolId?: string; // DeFiLlama pool ID if available
}

export interface StrategyChange {
    date: string;
    type: "increase" | "decrease" | "new" | "exit";
    pool: string;
    oldAllocation: number;
    newAllocation: number;
    reason?: string;
}

export interface StrategyProfile {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    focusAssets: string[];
    avgApy: number;
    avgRiskScore: number;
    diversificationScore: number; // 0-100
}

export interface CuratorStrategy {
    curatorId: string;
    platform: string;
    chain: string;
    allocations: StrategyAllocation[];
    profile: StrategyProfile;
    recentChanges: StrategyChange[];
    lastUpdated: string;
    dataSource: "curated" | "on-chain" | "api";
}

export interface CuratorInsight {
    curatorId: string;
    strategyAnalysis: string;
    keyTakeaways: string[];
    riskAssessment: string;
    howToReplicate: {
        step: number;
        action: string;
        pool: string;
        allocation: number;
    }[];
    considerations: string[];
    generatedAt: string;
}

// Gauntlet's Kamino Strategy (curated from public data)
const GAUNTLET_KAMINO_STRATEGY: CuratorStrategy = {
    curatorId: "gauntlet",
    platform: "kamino",
    chain: "Solana",
    allocations: [
        {
            pool: "USDC Lending",
            asset: "USDC",
            allocation: 40,
            apy: 6.8,
            riskLevel: "low",
        },
        {
            pool: "SOL Lending",
            asset: "SOL",
            allocation: 25,
            apy: 5.2,
            riskLevel: "low",
        },
        {
            pool: "JitoSOL Vault",
            asset: "JITOSOL",
            allocation: 15,
            apy: 7.5,
            riskLevel: "medium",
        },
        {
            pool: "ETH Lending",
            asset: "ETH",
            allocation: 10,
            apy: 4.1,
            riskLevel: "low",
        },
        {
            pool: "USDT Lending",
            asset: "USDT",
            allocation: 10,
            apy: 5.9,
            riskLevel: "low",
        },
    ],
    profile: {
        riskTolerance: "moderate",
        focusAssets: ["USDC", "SOL", "JITOSOL", "ETH"],
        avgApy: 6.2,
        avgRiskScore: 22,
        diversificationScore: 75,
    },
    recentChanges: [
        {
            date: "2025-01-10",
            type: "increase",
            pool: "USDC Lending",
            oldAllocation: 35,
            newAllocation: 40,
            reason: "Increased stablecoin allocation amid market volatility",
        },
        {
            date: "2025-01-05",
            type: "decrease",
            pool: "SOL Lending",
            oldAllocation: 30,
            newAllocation: 25,
            reason: "Rebalancing to reduce volatile asset exposure",
        },
        {
            date: "2024-12-20",
            type: "new",
            pool: "JitoSOL Vault",
            oldAllocation: 0,
            newAllocation: 15,
            reason: "Added liquid staking exposure for enhanced yield",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
};

// Gauntlet's Morpho Strategy (Ethereum)
const GAUNTLET_MORPHO_STRATEGY: CuratorStrategy = {
    curatorId: "gauntlet",
    platform: "morpho",
    chain: "Ethereum",
    allocations: [
        {
            pool: "Gauntlet USDC Prime",
            asset: "USDC",
            allocation: 50,
            apy: 8.2,
            riskLevel: "low",
        },
        {
            pool: "Gauntlet WETH Prime",
            asset: "WETH",
            allocation: 30,
            apy: 4.5,
            riskLevel: "low",
        },
        {
            pool: "Gauntlet wstETH",
            asset: "wstETH",
            allocation: 20,
            apy: 5.8,
            riskLevel: "medium",
        },
    ],
    profile: {
        riskTolerance: "conservative",
        focusAssets: ["USDC", "WETH", "wstETH"],
        avgApy: 6.5,
        avgRiskScore: 18,
        diversificationScore: 65,
    },
    recentChanges: [
        {
            date: "2025-01-08",
            type: "increase",
            pool: "Gauntlet USDC Prime",
            oldAllocation: 45,
            newAllocation: 50,
            reason: "Higher USDC borrow demand",
        },
    ],
    lastUpdated: "2025-01-14",
    dataSource: "curated",
};

// Strategy registry
const STRATEGIES: Record<string, CuratorStrategy[]> = {
    gauntlet: [GAUNTLET_KAMINO_STRATEGY, GAUNTLET_MORPHO_STRATEGY],
};

// Generate AI-like insight (static for now, will use real AI in Phase 2)
function generateInsight(curator: CuratorProfile, strategies: CuratorStrategy[]): CuratorInsight {
    const kaminoStrategy = strategies.find(s => s.platform === "kamino");
    const morphoStrategy = strategies.find(s => s.platform === "morpho");

    const stableAllocation = kaminoStrategy?.allocations
        .filter(a => ["USDC", "USDT"].includes(a.asset))
        .reduce((sum, a) => sum + a.allocation, 0) || 0;

    const recentShift = kaminoStrategy?.recentChanges[0];

    return {
        curatorId: curator.slug,
        strategyAnalysis: `${curator.name} maintains a ${kaminoStrategy?.profile.riskTolerance || "moderate"} risk approach across their allocations. With ${stableAllocation}% in stablecoins on Kamino, they prioritize capital preservation while still capturing attractive yields. ${recentShift ? `Recent rebalancing toward ${recentShift.pool} suggests anticipation of ${recentShift.reason?.toLowerCase() || "market changes"}.` : ""}`,
        keyTakeaways: [
            `Heavy stablecoin allocation (${stableAllocation}%) indicates risk-off positioning`,
            `Diversified across ${(kaminoStrategy?.allocations.length || 0) + (morphoStrategy?.allocations.length || 0)} pools for risk distribution`,
            `Average APY of ${kaminoStrategy?.profile.avgApy.toFixed(1)}% on Solana, ${morphoStrategy?.profile.avgApy.toFixed(1)}% on Ethereum`,
            `Focus on established, liquid assets (USDC, SOL, ETH)`,
        ],
        riskAssessment: `${curator.name}'s strategy emphasizes safety over maximum yield. Average risk score of ${kaminoStrategy?.profile.avgRiskScore || 20} is well below market average. Suitable for users seeking stable, predictable returns.`,
        howToReplicate: kaminoStrategy?.allocations.map((alloc, idx) => ({
            step: idx + 1,
            action: `Allocate ${alloc.allocation}% to ${alloc.pool}`,
            pool: alloc.pool,
            allocation: alloc.allocation,
        })) || [],
        considerations: [
            "Past performance does not guarantee future results",
            "Gauntlet may rebalance without notice",
            "Gas/transaction costs not included in APY",
            "This is advisory information, not financial advice",
            "Verify current rates before executing any strategy",
        ],
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Get strategies for a curator
 */
export function getCuratorStrategies(curatorSlug: string): CuratorStrategy[] {
    return STRATEGIES[curatorSlug.toLowerCase()] || [];
}

/**
 * Get strategy for a specific platform
 */
export function getCuratorStrategyForPlatform(
    curatorSlug: string,
    platform: string
): CuratorStrategy | null {
    const strategies = getCuratorStrategies(curatorSlug);
    return strategies.find(s => s.platform.toLowerCase() === platform.toLowerCase()) || null;
}

/**
 * Get curator with full strategy data and insights
 */
export function getCuratorWithStrategies(curatorSlug: string): {
    profile: CuratorProfile;
    strategies: CuratorStrategy[];
    insight: CuratorInsight;
    lastUpdated: string;
} | null {
    const profile = getCurator(curatorSlug);
    if (!profile) return null;

    const strategies = getCuratorStrategies(curatorSlug);
    const insight = generateInsight(profile, strategies);

    const lastUpdated = strategies.reduce((latest, s) => {
        return s.lastUpdated > latest ? s.lastUpdated : latest;
    }, "");

    return {
        profile,
        strategies,
        insight,
        lastUpdated,
    };
}

/**
 * Get all curators with their strategies
 */
export function getAllCuratorsWithStrategies(): Array<{
    profile: CuratorProfile;
    strategies: CuratorStrategy[];
    insight: CuratorInsight;
    lastUpdated: string;
}> {
    const results = [];
    for (const slug of Object.keys(STRATEGIES)) {
        const data = getCuratorWithStrategies(slug);
        if (data) results.push(data);
    }
    return results;
}
