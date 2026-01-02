/**
 * Intelligence Score Calculator
 * Combines GitHub, Twitter, and On-chain metrics into a single score
 * Fully automated - no manual setup required
 */

import {
    IntelligenceData,
    IntelligenceScore,
    GitHubTeamMetrics,
    TwitterMetrics,
    OnChainMetrics,
} from "@/lib/api/types";

/**
 * Normalize a value to 0-100 scale
 */
function normalize(value: number, min: number, max: number): number {
    if (isNaN(value) || value <= min) return 0;
    if (value >= max) return 100;
    const normalized = ((value - min) / (max - min)) * 100;
    return isNaN(normalized) ? 0 : Math.min(100, Math.max(0, normalized)); // Clamp between 0-100
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
    // Softened for large projects: 20% retention is excellent, 10% is good
    const retentionRate = metrics.totalContributors > 0
        ? (metrics.activeContributors30d / metrics.totalContributors) * 100
        : 0;
    const retentionScore = normalize(retentionRate, 0, 20);

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
        // Realistic benchmark: 1.5% engagement is excellent for institutional accounts
        const engagementRate = metrics.followers > 0
            ? (totalEngagement / metrics.followers) * 100
            : 0;
        engagementScore = normalize(engagementRate, 0, 1.5);
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
    if (onchain.monthlyActiveUsers && onchain.dailyActiveUsers && onchain.monthlyActiveUsers > 0) {
        const dauMauRatio =
            (onchain.dailyActiveUsers / onchain.monthlyActiveUsers) * 100;
        // Realistic benchmark: 10% DAU/MAU is excellent for utility protocols
        userGrowthScore = normalize(dauMauRatio, 0, 10);
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
 * Calculate Web Activity / Shipping Pace Score (0-100)
 * Evaluates recency and frequency of website/blog updates
 */
export function calculateWebScore(news?: IntelligenceData["news"]): number {
    if (!news || news.length === 0) return 0;

    const now = new Date();
    const updateDates = news
        .map((item) => new Date(item.date))
        .filter((date) => !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

    if (updateDates.length === 0) return 0;

    // 1. Recency Score (50%)
    const latestUpdate = updateDates[0];
    const daysSinceLastUpdate =
        (now.getTime() - latestUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = normalize(daysSinceLastUpdate, 30, 0); // 100 if updated today, 0 if > 30 days

    // 2. Frequency Score (50%)
    // Average 1 update per 2 weeks is excellent (100), 1 per 2 months is poor (0)
    const frequencyScore = normalize(news.length, 0, 5) * 0.5 + // Quantity
        normalize(30 / Math.max(1, updateDates.length), 60, 14) * 0.5; // Pace

    return Math.round(recencyScore * 0.6 + frequencyScore * 0.4);
}

/**
 * Calculate Overall Intelligence Score
 * Fully automated - uses RPC-derived metrics and dynamic weight shifting
 */
export function calculateIntelligenceScore(
    github: GitHubTeamMetrics,
    twitter: TwitterMetrics,
    onchain: Partial<OnChainMetrics>,
    category: "defi" | "nft" | "gaming" | "infrastructure" | "dao" = "infrastructure",
    news?: IntelligenceData["news"]
): IntelligenceScore {
    const githubScore = calculateGitHubScore(github);
    const twitterScore = calculateTwitterScore(twitter);
    const onchainScore = calculateOnChainScore(onchain);
    const webScore = calculateWebScore(news);

    // Initial Weights based on category
    let weights = {
        github: 0.35,
        growth: 0.4,
        social: 0.15,
        wallet: 0.1,
    };

    if (category === "defi") {
        weights = { github: 0.3, growth: 0.5, social: 0.1, wallet: 0.1 };
    } else if (category === "infrastructure") {
        weights = { github: 0.5, growth: 0.3, social: 0.1, wallet: 0.1 };
    } else if (category === "gaming" || category === "nft") {
        weights = { github: 0.25, growth: 0.35, social: 0.3, wallet: 0.1 };
    }

    // --- Dynamic Weight Shifting ---

    // 1. Handle Private Development (Zero/Low GitHub activity)
    // If less than 5 commits in 30 days, we assume private-heavy dev
    if (github.totalCommits30d < 5) {
        console.log("Detecting private-heavy development. Shifting GitHub weight.");
        const originalGithubWeight = weights.github;
        weights.github = originalGithubWeight * 0.2; // Keep 20% for transparency/public maintenance
        const shiftAmount = originalGithubWeight - weights.github;

        // Distribute shift to Growth (as it reflects real usage) and Social
        weights.growth += shiftAmount * 0.6;
        weights.social += shiftAmount * 0.4;
    }

    // 2. Handle Non-Blockchain / Web-first Services (Zero On-chain activity)
    if ((onchain.transactionCount30d || 0) < 10) {
        console.log("Detecting web-first service. Incorporating Web Activity score.");
        // If webScore is available, use it to boost growth (as proxy for activity)
        if (webScore > 0) {
            // Mix on-chain growth with web activity
            // Since on-chain is near 0, we'll let webScore represent the 'activity' portion
            onchainScore.score = Math.round(onchainScore.score * 0.3 + webScore * 0.7);
        }
    }

    const walletQualityScore = 50; // Default until we integrate Nansen

    const overall =
        githubScore.score * weights.github +
        onchainScore.score * weights.growth +
        twitterScore.score * weights.social +
        walletQualityScore * weights.wallet;

    return {
        overall: Math.round(overall),
        teamHealth: githubScore.score,
        growthScore: onchainScore.score,
        walletQuality: walletQualityScore,
        socialScore: twitterScore.score,
        breakdown: {
            github: githubScore.breakdown,
            onchain: {
                ...onchainScore.breakdown,
                // Add web signal for transparency in the JSON data
                webActivityScore: webScore,
            } as any,
            wallet: {
                distributionScore: 50,
                smartMoneyScore: 50,
            },
            social: twitterScore.breakdown,
        },
    };
}
/**
 * Calculate Momentum Index (0-100)
 * Momentum = (70% Growth + 30% Team) + Trend Bonus
 */
export function calculateMomentumIndex(
    growthScore: number,
    teamScore: number,
    trend: "up" | "stable" | "down"
): number {
    const trendWeight =
        trend === "up" ? 20 : trend === "stable" ? 10 : 0;
    const growthBalance = growthScore * 0.7 + teamScore * 0.3;
    return Math.min(100, Math.round(growthBalance + trendWeight));
}
