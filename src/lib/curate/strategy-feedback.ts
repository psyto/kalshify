/**
 * Strategy feedback generation
 * Analyzes user strategies and provides educational feedback
 */

import {
    UserStrategy,
    UserAllocation,
    calculateStrategyMetrics,
    BUILDER_POOLS,
    BuilderPool,
} from "./user-strategy";
import { CURATION_PRINCIPLES, CurationPrinciple } from "./curation-principles";

export interface FeedbackItem {
    type: "success" | "warning" | "danger" | "info";
    title: string;
    message: string;
    principleId?: string; // Links to a curation principle
}

export interface StrategyFeedback {
    overallScore: number; // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
    summary: string;
    items: FeedbackItem[];
    metrics: {
        weightedApy: number;
        weightedRiskScore: number;
        stablecoinPercent: number;
        protocolCount: number;
        rewardDependency: number;
    };
    matchesRiskPreference: boolean;
}

export interface CuratorComparison {
    curatorName: string;
    curatorRiskTolerance: "conservative" | "moderate" | "aggressive";
    similarities: string[];
    differences: string[];
    yourAdvantages: string[];
    yourRisks: string[];
    curatorMetrics: {
        avgApy: number;
        riskScore: number;
        stablecoinPercent: number;
    };
}

/**
 * Generate feedback for a user strategy
 */
export function generateStrategyFeedback(
    strategy: UserStrategy
): StrategyFeedback {
    const items: FeedbackItem[] = [];
    const metrics = calculateStrategyMetrics(strategy.allocations);
    let score = 70; // Start at C+

    // Check if allocations sum to 100%
    const totalAllocation = strategy.allocations.reduce(
        (sum, a) => sum + a.allocation,
        0
    );

    if (totalAllocation !== 100) {
        items.push({
            type: "danger",
            title: "Incomplete Allocation",
            message:
                totalAllocation < 100
                    ? `You have ${100 - totalAllocation}% unallocated. Deploy all capital for optimal returns.`
                    : `You're ${totalAllocation - 100}% over-allocated. Reduce to 100% total.`,
        });
        score -= 20;
    }

    // Analyze concentration risk
    const largePositions = strategy.allocations.filter(a => a.allocation >= 50);
    if (largePositions.length > 0) {
        items.push({
            type: "warning",
            title: "High Concentration",
            message: `${largePositions[0].asset} at ${largePositions[0].allocation}% puts over half your capital in one position. Consider spreading risk.`,
            principleId: "diversification",
        });
        score -= 10;
    } else if (metrics.protocolCount >= 3) {
        items.push({
            type: "success",
            title: "Good Diversification",
            message: `Spread across ${metrics.protocolCount} protocols. This reduces single-protocol risk.`,
            principleId: "diversification",
        });
        score += 5;
    }

    // Analyze reward dependency
    if (metrics.rewardDependency > 50) {
        items.push({
            type: "warning",
            title: "High Reward Dependency",
            message: `${metrics.rewardDependency.toFixed(0)}% of your yield comes from token rewards. These can decrease over time.`,
            principleId: "yield-sustainability",
        });
        score -= 8;
    } else if (metrics.rewardDependency < 20 && metrics.weightedApy > 5) {
        items.push({
            type: "success",
            title: "Sustainable Yield",
            message: `Most of your ${metrics.weightedApy.toFixed(1)}% APY comes from organic yield, not temporary incentives.`,
            principleId: "yield-sustainability",
        });
        score += 5;
    }

    // Analyze risk vs preference alignment
    const riskThresholds = {
        conservative: { maxRisk: 25, minStable: 50 },
        moderate: { maxRisk: 40, minStable: 20 },
        aggressive: { maxRisk: 70, minStable: 0 },
    };

    const threshold = riskThresholds[strategy.riskPreference];
    const matchesRiskPreference =
        metrics.weightedRiskScore <= threshold.maxRisk &&
        metrics.stablecoinPercent >= threshold.minStable;

    if (!matchesRiskPreference) {
        if (metrics.weightedRiskScore > threshold.maxRisk) {
            items.push({
                type: "warning",
                title: "Riskier Than Preference",
                message: `Your risk score of ${metrics.weightedRiskScore.toFixed(0)} exceeds your ${strategy.riskPreference} preference (max ${threshold.maxRisk}).`,
                principleId: "risk-reward",
            });
            score -= 10;
        }
        if (metrics.stablecoinPercent < threshold.minStable) {
            items.push({
                type: "info",
                title: "Low Stablecoin Allocation",
                message: `${strategy.riskPreference} strategies typically have ${threshold.minStable}%+ in stablecoins. You have ${metrics.stablecoinPercent.toFixed(0)}%.`,
                principleId: "correlation",
            });
            score -= 5;
        }
    } else {
        items.push({
            type: "success",
            title: "Matches Risk Profile",
            message: `Your strategy aligns with your ${strategy.riskPreference} risk preference.`,
            principleId: "risk-reward",
        });
        score += 10;
    }

    // Check for protocol diversification
    const protocolAllocations: Record<string, number> = {};
    strategy.allocations.forEach(a => {
        protocolAllocations[a.protocol] =
            (protocolAllocations[a.protocol] || 0) + a.allocation;
    });

    const overweightedProtocols = Object.entries(protocolAllocations).filter(
        ([, alloc]) => alloc > 60
    );
    if (overweightedProtocols.length > 0) {
        items.push({
            type: "warning",
            title: "Protocol Concentration",
            message: `${overweightedProtocols[0][0]} has ${overweightedProtocols[0][1]}% of your allocation. If this protocol has issues, most of your capital is at risk.`,
            principleId: "protocol-trust",
        });
        score -= 8;
    }

    // Check for correlated assets
    const solExposure = strategy.allocations
        .filter(a => ["SOL", "JitoSOL", "mSOL", "SOL-USDC", "mSOL-SOL", "BONK-SOL"].includes(a.asset))
        .reduce((sum, a) => sum + a.allocation, 0);

    if (solExposure > 70) {
        items.push({
            type: "info",
            title: "High SOL Correlation",
            message: `${solExposure}% of your portfolio is tied to SOL price. Consider adding uncorrelated assets.`,
            principleId: "correlation",
        });
        score -= 5;
    }

    // Liquidity check for large positions
    const poolMap: Record<string, BuilderPool> = {};
    BUILDER_POOLS.forEach(p => {
        poolMap[p.id] = p;
    });

    strategy.allocations.forEach(a => {
        const pool = poolMap[a.poolId];
        if (pool && a.allocation > 0) {
            const positionSize = (strategy.totalAmount * a.allocation) / 100;
            const poolTvl = pool.tvlUsd;
            const percentOfPool = (positionSize / poolTvl) * 100;

            if (percentOfPool > 2) {
                items.push({
                    type: "warning",
                    title: "Large Position Warning",
                    message: `Your ${a.asset} position would be ${percentOfPool.toFixed(1)}% of the pool's TVL. May face slippage on exit.`,
                    principleId: "liquidity-depth",
                });
                score -= 5;
            }
        }
    });

    // Cap and floor score
    score = Math.max(0, Math.min(100, score));

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 40) grade = "D";
    else grade = "F";

    // Generate summary
    let summary: string;
    if (grade === "A") {
        summary = "Excellent strategy! Well-diversified with sustainable yields and appropriate risk.";
    } else if (grade === "B") {
        summary = "Good strategy with minor areas for improvement. Review the suggestions below.";
    } else if (grade === "C") {
        summary = "Decent strategy but has some risks. Consider the warnings to improve.";
    } else if (grade === "D") {
        summary = "Strategy has significant issues. Address the warnings before deploying capital.";
    } else {
        summary = "Strategy needs major revision. Multiple high-risk issues detected.";
    }

    return {
        overallScore: score,
        grade,
        summary,
        items,
        metrics,
        matchesRiskPreference,
    };
}

/**
 * Compare user strategy to a curator's approach
 */
export function compareToCurator(
    userStrategy: UserStrategy,
    curatorSlug: string
): CuratorComparison | null {
    // Curator data (simplified - in production would come from curator-strategies.ts)
    const curatorData: Record<
        string,
        {
            name: string;
            riskTolerance: "conservative" | "moderate" | "aggressive";
            avgApy: number;
            riskScore: number;
            stablecoinPercent: number;
            characteristics: string[];
        }
    > = {
        gauntlet: {
            name: "Gauntlet",
            riskTolerance: "moderate",
            avgApy: 6.2,
            riskScore: 22,
            stablecoinPercent: 50,
            characteristics: [
                "Heavy stablecoin allocation (50%)",
                "Focus on lending over LP",
                "Diversified across 5 positions",
                "Minimal reward dependency",
            ],
        },
        steakhouse: {
            name: "Steakhouse Financial",
            riskTolerance: "conservative",
            avgApy: 7.0,
            riskScore: 15,
            stablecoinPercent: 100,
            characteristics: [
                "100% stablecoin focus",
                "Treasury-grade safety",
                "Multiple stablecoin issuers",
                "Pure lending yield",
            ],
        },
        re7: {
            name: "RE7 Capital",
            riskTolerance: "aggressive",
            avgApy: 7.1,
            riskScore: 45,
            stablecoinPercent: 20,
            characteristics: [
                "Heavy ETH/LST exposure",
                "Multiple liquid staking tokens",
                "Higher yield targets",
                "Active rebalancing",
            ],
        },
    };

    const curator = curatorData[curatorSlug];
    if (!curator) return null;

    const userMetrics = calculateStrategyMetrics(userStrategy.allocations);

    const similarities: string[] = [];
    const differences: string[] = [];
    const yourAdvantages: string[] = [];
    const yourRisks: string[] = [];

    // Compare stablecoin allocation
    const stableDiff = Math.abs(userMetrics.stablecoinPercent - curator.stablecoinPercent);
    if (stableDiff < 15) {
        similarities.push(`Similar stablecoin allocation (~${userMetrics.stablecoinPercent.toFixed(0)}%)`);
    } else if (userMetrics.stablecoinPercent > curator.stablecoinPercent) {
        differences.push(
            `You have ${userMetrics.stablecoinPercent.toFixed(0)}% stablecoins vs ${curator.name}'s ${curator.stablecoinPercent}%`
        );
        yourAdvantages.push("More capital protection in downturns");
        yourRisks.push("May underperform in bull markets");
    } else {
        differences.push(
            `You have ${userMetrics.stablecoinPercent.toFixed(0)}% stablecoins vs ${curator.name}'s ${curator.stablecoinPercent}%`
        );
        yourAdvantages.push("Higher potential returns in bull markets");
        yourRisks.push("More exposed to market volatility");
    }

    // Compare risk scores
    const riskDiff = Math.abs(userMetrics.weightedRiskScore - curator.riskScore);
    if (riskDiff < 8) {
        similarities.push(`Similar risk profile (score ~${userMetrics.weightedRiskScore.toFixed(0)})`);
    } else if (userMetrics.weightedRiskScore > curator.riskScore) {
        differences.push(
            `Your risk score (${userMetrics.weightedRiskScore.toFixed(0)}) is higher than ${curator.name}'s (${curator.riskScore})`
        );
        yourRisks.push("Higher chance of significant drawdowns");
    } else {
        differences.push(
            `Your risk score (${userMetrics.weightedRiskScore.toFixed(0)}) is lower than ${curator.name}'s (${curator.riskScore})`
        );
        yourAdvantages.push("More conservative positioning");
    }

    // Compare APY
    const apyDiff = Math.abs(userMetrics.weightedApy - curator.avgApy);
    if (apyDiff < 1) {
        similarities.push(`Similar expected returns (~${userMetrics.weightedApy.toFixed(1)}% APY)`);
    } else if (userMetrics.weightedApy > curator.avgApy) {
        differences.push(
            `Your APY (${userMetrics.weightedApy.toFixed(1)}%) exceeds ${curator.name}'s (${curator.avgApy}%)`
        );
        yourAdvantages.push("Higher yield potential");
        yourRisks.push("Higher yield often means higher risk");
    } else {
        differences.push(
            `Your APY (${userMetrics.weightedApy.toFixed(1)}%) is below ${curator.name}'s (${curator.avgApy}%)`
        );
        yourRisks.push("May be leaving yield on the table");
    }

    // Compare diversification
    if (userMetrics.protocolCount >= 3) {
        similarities.push("Both use multi-protocol diversification");
    } else {
        differences.push(`${curator.name} typically uses 3+ protocols; you use ${userMetrics.protocolCount}`);
        yourRisks.push("Less protocol diversification");
    }

    return {
        curatorName: curator.name,
        curatorRiskTolerance: curator.riskTolerance,
        similarities,
        differences,
        yourAdvantages,
        yourRisks,
        curatorMetrics: {
            avgApy: curator.avgApy,
            riskScore: curator.riskScore,
            stablecoinPercent: curator.stablecoinPercent,
        },
    };
}

/**
 * Get the principle object for a feedback item
 */
export function getPrincipleForFeedback(
    principleId: string
): CurationPrinciple | undefined {
    return CURATION_PRINCIPLES.find(p => p.id === principleId);
}
