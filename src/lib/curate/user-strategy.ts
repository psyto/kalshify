/**
 * User strategy types and validation for the Strategy Builder
 * Allows users to create their own allocation strategies and get feedback
 */

export interface UserAllocation {
    poolId: string;
    poolName: string;
    asset: string;
    allocation: number; // 0-100 percentage
    apy: number;
    riskLevel: "low" | "medium" | "high";
    protocol: string;
}

export interface UserStrategy {
    id: string;
    name: string;
    totalAmount: number;
    riskPreference: "conservative" | "moderate" | "aggressive";
    allocations: UserAllocation[];
    createdAt: string;
    updatedAt: string;
}

export interface StrategyValidation {
    isValid: boolean;
    totalAllocation: number;
    errors: string[];
    warnings: string[];
}

/**
 * Available pools for strategy building
 * These are simplified versions of real pools for the builder
 */
export interface BuilderPool {
    id: string;
    name: string;
    asset: string;
    protocol: string;
    apy: number;
    apyBase: number;
    apyReward: number;
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    tvlUsd: number;
    category: "stablecoin" | "lending" | "lp" | "lst" | "vault";
}

/**
 * Sample pools for the strategy builder
 * In production, these would come from the API
 */
export const BUILDER_POOLS: BuilderPool[] = [
    // Stablecoins - Low Risk
    {
        id: "usdc-lending-kamino",
        name: "USDC Lending",
        asset: "USDC",
        protocol: "Kamino",
        apy: 6.8,
        apyBase: 6.8,
        apyReward: 0,
        riskLevel: "low",
        riskScore: 15,
        tvlUsd: 150_000_000,
        category: "stablecoin",
    },
    {
        id: "usdt-lending-kamino",
        name: "USDT Lending",
        asset: "USDT",
        protocol: "Kamino",
        apy: 5.9,
        apyBase: 5.9,
        apyReward: 0,
        riskLevel: "low",
        riskScore: 18,
        tvlUsd: 80_000_000,
        category: "stablecoin",
    },
    // Native SOL - Low/Medium Risk
    {
        id: "sol-lending-kamino",
        name: "SOL Lending",
        asset: "SOL",
        protocol: "Kamino",
        apy: 5.2,
        apyBase: 5.2,
        apyReward: 0,
        riskLevel: "low",
        riskScore: 20,
        tvlUsd: 200_000_000,
        category: "lending",
    },
    {
        id: "sol-lending-marginfi",
        name: "SOL Lending",
        asset: "SOL",
        protocol: "Marginfi",
        apy: 4.8,
        apyBase: 4.8,
        apyReward: 0,
        riskLevel: "low",
        riskScore: 22,
        tvlUsd: 120_000_000,
        category: "lending",
    },
    // Liquid Staking - Medium Risk
    {
        id: "jitosol-vault",
        name: "JitoSOL Vault",
        asset: "JitoSOL",
        protocol: "Jito",
        apy: 7.5,
        apyBase: 7.5,
        apyReward: 0,
        riskLevel: "medium",
        riskScore: 28,
        tvlUsd: 300_000_000,
        category: "lst",
    },
    {
        id: "msol-lending",
        name: "mSOL Lending",
        asset: "mSOL",
        protocol: "Marinade",
        apy: 6.8,
        apyBase: 6.8,
        apyReward: 0,
        riskLevel: "medium",
        riskScore: 30,
        tvlUsd: 180_000_000,
        category: "lst",
    },
    // LP Pools - Medium/High Risk
    {
        id: "sol-usdc-lp",
        name: "SOL-USDC LP",
        asset: "SOL-USDC",
        protocol: "Orca",
        apy: 12.5,
        apyBase: 8.0,
        apyReward: 4.5,
        riskLevel: "medium",
        riskScore: 38,
        tvlUsd: 50_000_000,
        category: "lp",
    },
    {
        id: "msol-sol-lp",
        name: "mSOL-SOL LP",
        asset: "mSOL-SOL",
        protocol: "Orca",
        apy: 8.2,
        apyBase: 5.5,
        apyReward: 2.7,
        riskLevel: "medium",
        riskScore: 32,
        tvlUsd: 40_000_000,
        category: "lp",
    },
    // Higher Risk Options
    {
        id: "bonk-sol-lp",
        name: "BONK-SOL LP",
        asset: "BONK-SOL",
        protocol: "Raydium",
        apy: 45.0,
        apyBase: 15.0,
        apyReward: 30.0,
        riskLevel: "high",
        riskScore: 65,
        tvlUsd: 15_000_000,
        category: "lp",
    },
    {
        id: "jup-usdc-lp",
        name: "JUP-USDC LP",
        asset: "JUP-USDC",
        protocol: "Meteora",
        apy: 22.0,
        apyBase: 10.0,
        apyReward: 12.0,
        riskLevel: "high",
        riskScore: 55,
        tvlUsd: 25_000_000,
        category: "lp",
    },
];

/**
 * Validate a user strategy
 */
export function validateStrategy(strategy: UserStrategy): StrategyValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calculate total allocation
    const totalAllocation = strategy.allocations.reduce(
        (sum, a) => sum + a.allocation,
        0
    );

    // Check total is 100%
    if (totalAllocation < 100) {
        errors.push(`Only ${totalAllocation}% allocated. Add ${100 - totalAllocation}% more.`);
    } else if (totalAllocation > 100) {
        errors.push(`Over-allocated by ${totalAllocation - 100}%. Remove some allocation.`);
    }

    // Check for empty allocations
    const emptyAllocations = strategy.allocations.filter(a => a.allocation === 0);
    if (emptyAllocations.length > 0) {
        warnings.push(`${emptyAllocations.length} pool(s) have 0% allocation.`);
    }

    // Check minimum allocation amount makes sense
    const tinyAllocations = strategy.allocations.filter(
        a => a.allocation > 0 && a.allocation < 5
    );
    if (tinyAllocations.length > 0) {
        warnings.push(
            `${tinyAllocations.length} allocation(s) under 5% may not be worth the gas costs.`
        );
    }

    // Check concentration
    const largeAllocations = strategy.allocations.filter(a => a.allocation >= 50);
    if (largeAllocations.length > 0) {
        warnings.push(
            `${largeAllocations[0].asset} at ${largeAllocations[0].allocation}% is highly concentrated.`
        );
    }

    return {
        isValid: errors.length === 0,
        totalAllocation,
        errors,
        warnings,
    };
}

/**
 * Calculate strategy metrics
 */
export function calculateStrategyMetrics(allocations: UserAllocation[]): {
    weightedApy: number;
    weightedRiskScore: number;
    stablecoinPercent: number;
    protocolCount: number;
    rewardDependency: number;
} {
    if (allocations.length === 0 || allocations.every(a => a.allocation === 0)) {
        return {
            weightedApy: 0,
            weightedRiskScore: 0,
            stablecoinPercent: 0,
            protocolCount: 0,
            rewardDependency: 0,
        };
    }

    const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0);
    if (totalAllocation === 0) {
        return {
            weightedApy: 0,
            weightedRiskScore: 0,
            stablecoinPercent: 0,
            protocolCount: 0,
            rewardDependency: 0,
        };
    }

    // Weighted APY
    const weightedApy = allocations.reduce(
        (sum, a) => sum + (a.apy * a.allocation) / totalAllocation,
        0
    );

    // Weighted risk score (need to look up from pools)
    const riskScoreMap: Record<string, number> = {};
    BUILDER_POOLS.forEach(p => {
        riskScoreMap[p.id] = p.riskScore;
    });

    const weightedRiskScore = allocations.reduce((sum, a) => {
        const riskScore = riskScoreMap[a.poolId] || 30;
        return sum + (riskScore * a.allocation) / totalAllocation;
    }, 0);

    // Stablecoin percentage
    const stableAssets = ["USDC", "USDT", "DAI", "FRAX"];
    const stablecoinPercent = allocations
        .filter(a => stableAssets.includes(a.asset))
        .reduce((sum, a) => sum + a.allocation, 0);

    // Unique protocols
    const protocols = new Set(allocations.filter(a => a.allocation > 0).map(a => a.protocol));
    const protocolCount = protocols.size;

    // Reward dependency - how much APY comes from rewards vs base
    const poolMap: Record<string, BuilderPool> = {};
    BUILDER_POOLS.forEach(p => {
        poolMap[p.id] = p;
    });

    let totalWeightedReward = 0;
    let totalWeightedBase = 0;
    allocations.forEach(a => {
        const pool = poolMap[a.poolId];
        if (pool && a.allocation > 0) {
            totalWeightedReward += (pool.apyReward * a.allocation) / totalAllocation;
            totalWeightedBase += (pool.apyBase * a.allocation) / totalAllocation;
        }
    });

    const rewardDependency =
        totalWeightedBase + totalWeightedReward > 0
            ? (totalWeightedReward / (totalWeightedBase + totalWeightedReward)) * 100
            : 0;

    return {
        weightedApy,
        weightedRiskScore,
        stablecoinPercent,
        protocolCount,
        rewardDependency,
    };
}

/**
 * Create a new empty strategy
 */
export function createEmptyStrategy(
    riskPreference: "conservative" | "moderate" | "aggressive" = "moderate",
    totalAmount: number = 10000
): UserStrategy {
    return {
        id: `strategy-${Date.now()}`,
        name: "My Strategy",
        totalAmount,
        riskPreference,
        allocations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Get recommended pools based on risk preference
 */
export function getRecommendedPools(
    riskPreference: "conservative" | "moderate" | "aggressive"
): BuilderPool[] {
    switch (riskPreference) {
        case "conservative":
            return BUILDER_POOLS.filter(p => p.riskLevel === "low");
        case "moderate":
            return BUILDER_POOLS.filter(p => p.riskLevel !== "high");
        case "aggressive":
            return BUILDER_POOLS;
    }
}
