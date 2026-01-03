/**
 * Index Score Calculator
 * Combines GitHub, Twitter, and On-chain metrics into a single score
 * Fully automated - no manual setup required
 */

import {
    IndexData,
    IndexScore,
    GitHubTeamMetrics,
    TwitterMetrics,
    OnChainMetrics,
} from "@/lib/api/types";

/**
 * Normalize a value to 0-100 scale
 * @param value - The value to normalize
 * @param min - Minimum value (returns 0 if value < min)
 * @param max - Maximum value (returns 100 if value > max)
 * @returns Normalized value between 0-100
 */
function normalize(value: number, min: number, max: number): number {
    // Handle invalid inputs
    if (isNaN(value) || !isFinite(value)) return 0;
    if (isNaN(min) || isNaN(max) || !isFinite(min) || !isFinite(max)) return 0;

    // Handle edge case where min === max
    if (min === max) {
        return value === min ? 50 : value < min ? 0 : 100;
    }

    // Pure linear interpolation: min -> 0, max -> 100
    // This naturally handles cases where min > max (e.g., normalize(daysAgo, 14, 0))
    const normalized = ((value - min) / (max - min)) * 100;

    // Clamp between 0-100
    return Math.min(100, Math.max(0, normalized));
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
    // Contributor score: log scale for total and active contributors
    // Massive difference between 0->1 and 1->5, minor between 100->105
    const logTotal = Math.log10(
        1 + Math.max(0, metrics.totalContributors || 0)
    );
    const logActive = Math.log10(
        1 + Math.max(0, metrics.activeContributors30d || 0)
    );

    const contributorScore =
        normalize(logTotal, 0, 2.0) * 0.6 + // 2.0 = ~100 contributors
        normalize(logActive, 0, 1.3) * 0.4; // 1.3 = ~20 contributors

    // Activity score: based on commits
    // Great projects have 100+ commits/30d (3.3+/day)
    const activityScore = normalize(
        Math.max(0, metrics.totalCommits30d || 0),
        0,
        300
    );

    // Retention score: % of contributors active in last 30d
    // Softened for large projects: 20% retention is excellent, 10% is good
    // Cap retention at 100% to handle edge cases where active >= total
    let retentionRate = 0;
    if (metrics.totalContributors > 0) {
        const rate =
            (metrics.activeContributors30d / metrics.totalContributors) * 100;
        retentionRate = Math.min(100, Math.max(0, rate)); // Cap at 100%
    }
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
    // Handle zero followers case
    let followersScore = 0;
    if (metrics.followers > 0) {
        const logFollowers = Math.log10(metrics.followers);
        followersScore = normalize(
            logFollowers,
            Math.log10(1000), // Lowered benchmark from 10k to 1k
            Math.log10(1000000) // Lowered from 2M to 1M for more realistic institutional ceiling
        );
    }

    // Engagement score: if we have engagement data
    let engagementScore = 0; // Default to 0 for missing data

    if (metrics.engagement30d) {
        const totalEngagement =
            (metrics.engagement30d.likes || 0) +
            (metrics.engagement30d.retweets || 0) +
            (metrics.engagement30d.replies || 0);

        // Normalize based on followers (engagement rate)
        // Realistic benchmark: 1.5% engagement is excellent for institutional accounts
        if (metrics.followers > 0 && totalEngagement > 0) {
            const engagementRate = (totalEngagement / metrics.followers) * 100;
            // Cap engagement rate at 100% to handle viral posts
            engagementScore = normalize(Math.min(100, engagementRate), 0, 1.5);
        }
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
    let userGrowthScore = 0;
    if (
        onchain.monthlyActiveUsers &&
        onchain.dailyActiveUsers &&
        onchain.monthlyActiveUsers > 0
    ) {
        // Cap DAU/MAU ratio at 100% (DAU cannot exceed MAU in normal circumstances)
        const dauMauRatio = Math.min(
            100,
            (onchain.dailyActiveUsers / onchain.monthlyActiveUsers) * 100
        );
        // Realistic benchmark: 5% DAU/MAU is excellent for DeFi protocols
        // (Users don't trade every day, but active protocols see 3-7% ratios)
        userGrowthScore = normalize(dauMauRatio, 0, 5);
    } else if (onchain.uniqueWallets30d && onchain.uniqueWallets30d > 0) {
        // Fallback: use unique wallets as proxy for users
        // Adjusted benchmark: 10 to 10,000 wallets (was 0 to 100,000)
        // This way even small protocols with 100 wallets get ~1% score
        // And protocols with 1,000 wallets get ~10% score
        userGrowthScore = normalize(
            onchain.uniqueWallets30d,
            10,
            10000
        );
    }

    // Transaction score: based on transaction volume
    let transactionScore = 0;
    if (onchain.transactionCount30d && onchain.transactionCount30d > 0) {
        // Adjusted benchmark: 10 to 100,000 transactions (was 0 to 1,000,000)
        // Even protocols with 100 txs get ~0.1% score
        // Protocols with 1,000 txs get ~1% score
        // Protocols with 10,000 txs get ~10% score
        transactionScore = normalize(
            onchain.transactionCount30d,
            10,
            100000
        );
    }

    // TVL score: if available (would need external API like DeFi Llama)
    let tvlScore = 0;
    if (onchain.tvl && onchain.tvl > 0) {
        // Handle log10(0) edge case
        const logTvl = Math.log10(onchain.tvl);
        if (isFinite(logTvl)) {
            tvlScore = normalize(
                logTvl,
                Math.log10(1000000),
                Math.log10(10000000000)
            ); // $1M to $10B
        }
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
 * Calculate Partnership Score (Ecosystem Word-of-Mouth) - AI-Enhanced
 * Uses LLM to detect and rate partnership quality with context understanding
 */
export async function calculatePartnershipScore(
    news?: IndexData["news"],
    aiAnalyses?: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>
): Promise<number> {
    if (!news || news.length === 0) return 0;

    // If AI analyses provided, use them (preferred)
    if (aiAnalyses && aiAnalyses.length === news.length) {
        return calculateAIPartnershipScore(news, aiAnalyses);
    }

    // Otherwise fall back to regex-based detection
    return calculateRegexPartnershipScore(news);
}

/**
 * AI-powered partnership scoring with quality tiers
 */
function calculateAIPartnershipScore(
    news: IndexData["news"],
    analyses: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>
): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    let score = 0;
    const now = new Date();

    // Quality tier weights
    const qualityWeights = {
        tier1: 50, // Major companies (Coinbase, a16z, etc.)
        tier2: 30, // Established protocols (Uniswap, Aave, etc.)
        tier3: 15, // Smaller partners
        none: 0,
    };

    news.forEach((item, index) => {
        // Ensure we have a corresponding analysis for this news item
        if (index >= analyses.length) return;

        const analysis = analyses[index];
        if (!analysis || !analysis.isPartnership) return;

        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const daysAgo = Math.max(
            0,
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Recent partnerships more valuable (30 day window)
        const freshness = normalize(daysAgo, 30, 0);

        // Quality-weighted score with confidence adjustment
        const baseScore = qualityWeights[analysis.quality];
        const confidenceMultiplier = analysis.confidence / 100;
        const freshnessMultiplier = freshness / 100 + 0.2; // Min 0.2 for older news

        score += baseScore * confidenceMultiplier * freshnessMultiplier;
    });

    return Math.min(100, Math.round(score));
}

/**
 * Fallback regex-based partnership scoring (when AI unavailable)
 */
function calculateRegexPartnershipScore(news: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    const partnershipKeywords = [
        /\bpartnership\b/i,
        /\bintegration\b/i,
        /\bintegrated\b/i,
        /\bcollaboration\b/i,
        /\bcollaborates?\b/i,
        /\bteam up\b/i,
        /\bjoins? forces\b/i,
        /\bannounces.*with\b/i,
        /\bpartners? with\b/i,
    ];

    let score = 0;
    const now = new Date();

    news.forEach((item) => {
        const title = item.title || "";
        const content = item.content || "";
        const combined = `${title} ${content}`;

        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const matchCount = partnershipKeywords.filter((k) =>
            k.test(combined)
        ).length;

        if (matchCount > 0) {
            const daysAgo = Math.max(
                0,
                (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Recent partnerships more valuable (30 day window)
            const freshness = normalize(daysAgo, 30, 0);
            // Base points + bonus for multiple partnership keywords
            score += (20 + matchCount * 10) * (freshness / 100 + 0.2);
        }
    });

    return Math.min(100, Math.round(score));
}

/**
 * Calculate News-based Growth Signals
 * Rewards shipping pace and high-impact announcements
 */
export function calculateIndexNewsScore(news?: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    // Use word boundaries for better keyword synergy (avoids false positives like "disintegrated")
    const keywords = [
        /\blaunch\b/i,
        /\bmainnet\b/i,
        /\bfunding\b/i,
        /\braised\b/i,
        /\bpartner\b/i,
        /\bintegrated\b/i,
        /\blisting\b/i,
        /\brelease\b/i,
        /\bscale\b/i,
        /\blive\b/i,
    ];
    let signalStrength = 0;
    const now = new Date();

    news.forEach((item) => {
        const title = item.title || "";
        const date = new Date(item.date);

        // Validate date
        if (isNaN(date.getTime())) return;

        const daysAgo = Math.max(
            0,
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Keyword Synergy with word boundaries
        const matchCount = keywords.filter((k) => k.test(title)).length;
        if (matchCount > 0) {
            // Freshness Multiplier: News within 14 days is high signal
            // Fresh (0 days ago) = 100 points, Old (14 days ago) = 0 points
            const freshness = normalize(daysAgo, 14, 0);
            signalStrength += (10 + matchCount * 5) * (freshness / 100 + 0.5);
        }
    });

    return Math.min(100, Math.round(signalStrength));
}

/**
 * Calculate Virality Score (Word-of-Mouth Indicator)
 * Measures how much content is being shared vs just liked
 */
export function calculateViralityScore(engagement30d: {
    likes: number;
    retweets: number;
    replies: number;
}): number {
    const { likes, retweets, replies } = engagement30d;

    if (likes === 0 && retweets === 0 && replies === 0) return 0;

    // Retweet ratio: measures sharing behavior (word-of-mouth)
    // Benchmark: 20% retweet rate is excellent for institutional accounts
    const retweetRatio = likes > 0 ? (retweets / likes) * 100 : 0;
    const retweetScore = normalize(retweetRatio, 0, 20);

    // Reply ratio: measures conversation depth and community engagement
    // Benchmark: 10% reply rate indicates strong engagement
    const replyRatio = likes > 0 ? (replies / likes) * 100 : 0;
    const replyScore = normalize(replyRatio, 0, 10);

    // Sharing (retweets) weighted higher as it indicates word-of-mouth spread
    return Math.round(retweetScore * 0.6 + replyScore * 0.4);
}

/**
 * Calculate Attention Velocity
 * Proxies for web impressions via social engagement rate
 * Falls back to follower count when engagement data is unavailable
 */
export function calculateAttentionScore(twitter: TwitterMetrics): number {
    // Calculate total engagement if data exists
    const totalEngagement = twitter.engagement30d
        ? (twitter.engagement30d.likes || 0) +
          (twitter.engagement30d.retweets || 0) +
          (twitter.engagement30d.replies || 0)
        : 0;

    // Primary: Use engagement velocity if we have engagement data
    if (totalEngagement > 0) {
        // If no followers but has engagement, use a small denominator to avoid division by zero
        const effectiveFollowers = Math.max(twitter.followers || 1, 1);

        // Engagement Velocity: High engagement relative to size indicates a "Visibility Spike"
        const velocity = (totalEngagement / effectiveFollowers) * 100;

        // Benchmark: 2% velocity is viral/high-attention for Web3
        // Cap at 100% to handle viral posts
        return normalize(Math.min(100, velocity), 0, 2);
    }

    // Fallback: If no engagement data but have followers, use followers as attention proxy
    // Large follower base = accumulated attention over time
    // Benchmark: 10k to 1M+ followers (Uniswap has 1M+)
    if (twitter.followers && twitter.followers > 0) {
        return normalize(twitter.followers, 10000, 1000000);
    }

    return 0;
}

/**
 * Calculate Web Activity / Shipping Pace Score (0-100)
 */
export function calculateWebScore(news?: IndexData["news"]): number {
    if (!news || !Array.isArray(news) || news.length === 0) return 0;

    const now = new Date();
    const updateDates = news
        .map((item) => new Date(item.date))
        .filter((date) => !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime());

    if (updateDates.length === 0) return 0;

    const latestUpdate = updateDates[0];
    const daysSinceLastUpdate = Math.max(
        0,
        (now.getTime() - latestUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Recent (0 days ago) = 100 points, Old (30 days ago) = 0 points
    const recencyScore = normalize(daysSinceLastUpdate, 30, 0);

    // Frequency score: based on number of updates and average days between updates
    // More updates = higher score, more frequent updates = higher score
    const newsCountScore = normalize(news.length, 0, 5);

    // Calculate average days between updates
    let avgDaysBetween = 30; // Default to 30 if only one update
    if (updateDates.length > 1) {
        const oldestUpdate = updateDates[updateDates.length - 1];
        const totalDays = Math.max(
            1,
            (latestUpdate.getTime() - oldestUpdate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        avgDaysBetween = totalDays / (updateDates.length - 1);
    }

    // Lower average days between updates = higher frequency score
    // Normalize with reversed order: 30 days = 0, 1 day = 100
    const frequencyScore = normalize(avgDaysBetween, 30, 1);

    const combinedFrequencyScore = newsCountScore * 0.5 + frequencyScore * 0.5;

    return Math.round(recencyScore * 0.6 + combinedFrequencyScore * 0.4);
}

/**
 * Calculate Overall Index Score
 * Fully automated - uses RPC-derived metrics and dynamic weight shifting
 * Now supports AI-enhanced partnership detection
 */
export async function calculateIndexScore(
    github: GitHubTeamMetrics,
    twitter: TwitterMetrics,
    onchain: Partial<OnChainMetrics>,
    category:
        | "defi"
        | "nft"
        | "gaming"
        | "infrastructure"
        | "dao" = "infrastructure",
    news?: IndexData["news"],
    partnershipAnalyses?: Array<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: string;
        confidence: number;
        reasoning: string;
    }>
): Promise<IndexScore> {
    const githubScore = calculateGitHubScore(github);
    const twitterScore = calculateTwitterScore(twitter);
    const onchainScore = calculateOnChainScore(onchain);
    const webScore = calculateWebScore(news);
    const indexNewsScore = calculateIndexNewsScore(news);
    const partnershipScore = await calculatePartnershipScore(
        news,
        partnershipAnalyses
    );
    const attentionScore = calculateAttentionScore(twitter);
    const viralityScore = twitter.engagement30d
        ? calculateViralityScore(twitter.engagement30d)
        : 0;

    // Initial Weights based on category (Wallet redistributed to GitHub/Growth)
    let weights = {
        github: 0.4,
        growth: 0.45,
        social: 0.15,
        wallet: 0,
    };

    const tvl = onchain.tvl || 0;

    if (category === "defi") {
        // High-TVL DeFi: Proven protocols prioritize real growth over development activity
        if (tvl >= 1_000_000_000) {
            // $1B+ TVL: Mature protocols with proven product-market fit
            // Reduce GitHub weight (25%), increase Growth weight (65%)
            weights = { github: 0.25, growth: 0.65, social: 0.1, wallet: 0 };
        } else {
            // Standard DeFi weighting
            weights = { github: 0.35, growth: 0.55, social: 0.1, wallet: 0 };
        }
    } else if (category === "infrastructure") {
        weights = { github: 0.55, growth: 0.35, social: 0.1, wallet: 0 };
    } else if (category === "gaming" || category === "nft") {
        weights = { github: 0.3, growth: 0.4, social: 0.3, wallet: 0 };
    }

    // --- Signal Presence Detection & Weight Redistribution ---
    const hasTwitter = twitter.followers > 0 || (twitter.tweetCount || 0) > 0;

    // If a project has NO social signal, redistribute Social weight to GitHub/Growth
    if (!hasTwitter) {
        const socialWeight = weights.social;
        const totalOtherWeight = weights.github + weights.growth;
        if (totalOtherWeight > 0) {
            const ratio = weights.github / totalOtherWeight;
            weights.github += socialWeight * ratio;
            weights.growth += socialWeight * (1 - ratio);
        } else {
            // Fallback: split evenly if both are zero (shouldn't happen)
            weights.github += socialWeight * 0.5;
            weights.growth += socialWeight * 0.5;
        }
        weights.social = 0;
    }

    // --- Signal Fusion: Revamped Growth Score with Word-of-Mouth ---
    // Adaptive weighting based on on-chain strength:
    // - Exceptional (>75 + TVL >$1B): Dominant on-chain weight (80%)
    // - Strong on-chain (>70): Prioritize real usage metrics (60%)
    // - Weak on-chain (<30): Prioritize web/social/partnership signals
    // - Medium: Balanced approach
    let combinedGrowthScore = 0;

    // Use tvl already defined above
    const isExceptional = onchainScore.score >= 75 && tvl >= 1_000_000_000;

    if (isExceptional) {
        // Exceptional protocols: Top-tier with $1B+ TVL and strong on-chain
        // These protocols have proven product-market fit through real usage
        // Massively prioritize actual usage metrics (80%)
        combinedGrowthScore =
            onchainScore.score * 0.8 +
            Math.max(webScore, indexNewsScore) * 0.08 +
            partnershipScore * 0.07 +
            attentionScore * 0.05;
    } else if (onchainScore.score >= 70) {
        // Strong on-chain: Established protocols with proven usage
        // Give much more weight to actual usage metrics (60%)
        // Reduce weight on marketing/news signals (40%)
        combinedGrowthScore =
            onchainScore.score * 0.6 +
            Math.max(webScore, indexNewsScore) * 0.15 +
            partnershipScore * 0.15 +
            attentionScore * 0.1;
    } else if ((onchain.transactionCount30d || 0) < 10) {
        // Extremely low on-chain: SaaS/Stealth/Pre-launch
        // Shift weight to Web/Social/Partnership Growth
        // This is critical for Fabrknt which has no real on-chain activity
        combinedGrowthScore =
            Math.max(webScore, indexNewsScore) * 0.35 +
            partnershipScore * 0.35 +
            attentionScore * 0.3;
    } else {
        // Medium on-chain: Balanced scoring
        // Growth = (On-Chain * 0.35) + (News * 0.25) + (Partnerships * 0.20) + (Attention * 0.20)
        combinedGrowthScore =
            onchainScore.score * 0.35 +
            Math.max(webScore, indexNewsScore) * 0.25 +
            partnershipScore * 0.2 +
            attentionScore * 0.2;
    }

    // --- Dynamic Weight Shifting for Private Development ---
    if (github.totalCommits30d < 5) {
        const originalGithubWeight = weights.github;
        weights.github = originalGithubWeight * 0.2;
        const shiftAmount = originalGithubWeight - weights.github;

        // Redistribute public maintenance weight to growth (real world utility)
        weights.growth += shiftAmount;
    }

    // Ensure weights sum to 1.0 (normalize if needed due to floating point precision)
    const totalWeight =
        weights.github + weights.growth + weights.social + weights.wallet;
    if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.001) {
        weights.github /= totalWeight;
        weights.growth /= totalWeight;
        weights.social /= totalWeight;
        weights.wallet /= totalWeight;
    }

    const overall =
        githubScore.score * weights.github +
        combinedGrowthScore * weights.growth +
        twitterScore.score * weights.social;

    return {
        overall: Math.round(overall),
        teamHealth: githubScore.score,
        growthScore: Math.round(combinedGrowthScore),
        walletQuality: 0,
        socialScore: twitterScore.score,
        breakdown: {
            github: githubScore.breakdown,
            onchain: {
                ...onchainScore.breakdown,
                webActivityScore: webScore,
                newsGrowthScore: indexNewsScore,
                partnershipScore,
                attentionScore,
                viralityScore,
            } as any,
            wallet: {
                distributionScore: 0,
                smartMoneyScore: 0,
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
    const trendWeight = trend === "up" ? 20 : trend === "stable" ? 10 : 0;
    const growthBalance = growthScore * 0.7 + teamScore * 0.3;
    return Math.min(100, Math.round(growthBalance + trendWeight));
}
