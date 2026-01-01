/**
 * Intelligence Score Calculator
 * Combines GitHub, Twitter, and On-chain metrics into a single score
 * Fully automated - no manual setup required
 */

import {
    IntelligenceScore,
    GitHubTeamMetrics,
    TwitterMetrics,
    OnChainMetrics,
} from "@/lib/api/types";

/**
 * Normalize a value to 0-100 scale
 */
function normalize(value: number, min: number, max: number): number {
    if (value <= min) return 0;
    if (value >= max) return 100;
    const normalized = ((value - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, normalized)); // Clamp between 0-100
}

/**
 * Calculate GitHub Team Health Score (0-100)
 */
export function calculateGitHubScore(metrics: GitHubTeamMetrics): {
    score: number;
    breakdown: {
        contributorScore: number;
        activityScore: number;
        retentionScore: number;
    };
} {
    // Contributor score: based on total and active contributors
    // Great projects have 50+ total, 10+ active
    const contributorScore =
        normalize(metrics.totalContributors, 0, 100) * 0.6 +
        normalize(metrics.activeContributors30d, 0, 20) * 0.4;

    // Activity score: based on commits
    // Great projects have 100+ commits/30d (3.3+/day)
    const activityScore = normalize(metrics.totalCommits30d, 0, 300);

    // Retention score: % of contributors active in last 30d
    const retentionRate =
        (metrics.activeContributors30d / metrics.totalContributors) * 100;
    const retentionScore = normalize(retentionRate, 0, 50); // 50% retention is excellent

    const overall =
        contributorScore * 0.4 + activityScore * 0.4 + retentionScore * 0.2;

    return {
        score: Math.round(overall),
        breakdown: {
            contributorScore: Math.round(contributorScore),
            activityScore: Math.round(activityScore),
            retentionScore: Math.round(retentionScore),
        },
    };
}

/**
 * Calculate Twitter Social Score (0-100)
 */
export function calculateTwitterScore(metrics: TwitterMetrics): {
    score: number;
    breakdown: {
        followersScore: number;
        engagementScore: number;
    };
} {
    // Followers score: log scale for followers
    // 100K = ~50, 500K = ~70, 1M+ = 85+
    const followersScore = normalize(
        Math.log10(metrics.followers),
        Math.log10(10000),
        Math.log10(2000000)
    );

    // Engagement score: if we have engagement data
    let engagementScore = 50; // Default if no engagement data

    if (metrics.engagement30d) {
        const totalEngagement =
            metrics.engagement30d.likes +
            metrics.engagement30d.retweets +
            metrics.engagement30d.replies;

        // Normalize based on followers (engagement rate)
        const engagementRate = (totalEngagement / metrics.followers) * 100;
        engagementScore = normalize(engagementRate, 0, 10); // 10% engagement rate is excellent
    }

    const overall = followersScore * 0.7 + engagementScore * 0.3;

    return {
        score: Math.round(overall),
        breakdown: {
            followersScore: Math.round(followersScore),
            engagementScore: Math.round(engagementScore),
        },
    };
}

/**
 * Calculate On-chain Growth Score (0-100)
 * Uses RPC-derived metrics (fully automated)
 */
export function calculateOnChainScore(onchain: Partial<OnChainMetrics>): {
    score: number;
    breakdown: {
        userGrowthScore: number;
        transactionScore: number;
        tvlScore: number;
    };
} {
    // User growth score: based on DAU/MAU ratio from unique wallets
    let userGrowthScore = 50;
    if (onchain.monthlyActiveUsers && onchain.dailyActiveUsers) {
        const dauMauRatio =
            (onchain.dailyActiveUsers / onchain.monthlyActiveUsers) * 100;
        userGrowthScore = normalize(dauMauRatio, 0, 30); // 30% DAU/MAU is excellent
    } else if (onchain.uniqueWallets30d) {
        // Fallback: use unique wallets as proxy for users
        userGrowthScore = normalize(onchain.uniqueWallets30d, 0, 100000);
    }

    // Transaction score: based on transaction volume
    let transactionScore = 50;
    if (onchain.transactionCount30d) {
        transactionScore = normalize(onchain.transactionCount30d, 0, 1000000);
    }

    // TVL score: if available (would need external API like DeFi Llama)
    let tvlScore = 50;
    if (onchain.tvl) {
        tvlScore = normalize(
            Math.log10(onchain.tvl),
            Math.log10(1000000),
            Math.log10(10000000000)
        ); // $1M to $10B
    }

    const overall =
        userGrowthScore * 0.4 + transactionScore * 0.3 + tvlScore * 0.3;

    return {
        score: Math.round(overall),
        breakdown: {
            userGrowthScore: Math.round(userGrowthScore),
            transactionScore: Math.round(transactionScore),
            tvlScore: Math.round(tvlScore),
        },
    };
}

/**
 * Calculate Overall Intelligence Score
 * Fully automated - uses RPC-derived metrics
 */
export function calculateIntelligenceScore(
    github: GitHubTeamMetrics,
    twitter: TwitterMetrics,
    onchain: Partial<OnChainMetrics>
): IntelligenceScore {
    const githubScore = calculateGitHubScore(github);
    const twitterScore = calculateTwitterScore(twitter);
    const onchainScore = calculateOnChainScore(onchain);

    // Weights:
    // - Team Health (GitHub): 35%
    // - Growth Score (On-chain): 40%
    // - Social Score (Twitter): 15%
    // - Wallet Quality (Nansen): 10% (optional, default 50 if not available)

    const walletQualityScore = 50; // Default until we integrate Nansen

    const overall =
        githubScore.score * 0.35 +
        onchainScore.score * 0.4 +
        twitterScore.score * 0.15 +
        walletQualityScore * 0.1;

    return {
        overall: Math.round(overall),
        teamHealth: githubScore.score,
        growthScore: onchainScore.score,
        walletQuality: walletQualityScore,
        socialScore: twitterScore.score,
        breakdown: {
            github: githubScore.breakdown,
            onchain: onchainScore.breakdown,
            wallet: {
                distributionScore: 50,
                smartMoneyScore: 50,
            },
            social: twitterScore.breakdown,
        },
    };
}
