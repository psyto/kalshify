/**
 * Twitter API Client (X API v2)
 * Fetches social metrics: followers, engagement, growth
 */

import { TwitterMetrics } from "./types";

const TWITTER_API_BASE = "https://api.twitter.com/2";
const TWITTER_BEARER_TOKEN =
    process.env.TWITTER_BEARER_TOKEN ||
    process.env.NEXT_PUBLIC_TWITTER_BEARER_TOKEN;

interface TwitterAPIOptions {
    token?: string;
}

// Simple in-memory cache to avoid redundant API calls
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint: string): string {
    return `twitter:${endpoint}`;
}

function getCached(endpoint: string): any | null {
    const key = getCacheKey(endpoint);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    if (cached) {
        cache.delete(key);
    }
    return null;
}

function setCache(endpoint: string, data: any): void {
    const key = getCacheKey(endpoint);
    cache.set(key, {
        data,
        expires: Date.now() + CACHE_TTL,
    });
}

/**
 * Make authenticated Twitter API request with retry logic for rate limiting
 */
async function twitterFetch(
    endpoint: string,
    options?: TwitterAPIOptions,
    retryCount = 0,
    maxRetries = 3
): Promise<any> {
    // Check cache first
    const cached = getCached(endpoint);
    if (cached) {
        return cached;
    }

    const token = options?.token || TWITTER_BEARER_TOKEN;

    if (!token) {
        throw new Error("Twitter Bearer Token is required");
    }

    const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // Add timeout using AbortController (increased to 5 minutes for Twitter API)
    const controller = new AbortController();
    const timeoutMs = 300000; // 300 seconds (5 minutes) - increased to handle rate limits
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${TWITTER_API_BASE}${endpoint}`, {
            headers,
            signal: controller.signal,
            next: { revalidate: 3600 }, // Cache for 1 hour
        });
        clearTimeout(timeoutId);

        // Handle rate limiting (429) - let retry.ts handle the retry logic
        if (response.status === 429) {
            // Get retry-after header (x-rate-limit-reset is Unix timestamp in seconds)
            const rateLimitReset = response.headers.get("x-rate-limit-reset");
            let errorMsg = `Twitter API error: ${response.status} ${response.statusText} (rate limit exceeded)`;

            if (rateLimitReset) {
                const resetTime = new Date(parseInt(rateLimitReset, 10) * 1000);
                errorMsg += ` - Resets at ${resetTime.toISOString()}`;
            }

            const error: any = new Error(errorMsg);
            error.status = 429;
            error.retryAfter = rateLimitReset
                ? Math.max(
                      0,
                      parseInt(rateLimitReset, 10) -
                          Math.floor(Date.now() / 1000)
                  )
                : undefined;
            throw error;
        }

        if (!response.ok) {
            throw new Error(
                `Twitter API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // Cache successful responses
        setCache(endpoint, data);

        return data;
    } catch (error: any) {
        clearTimeout(timeoutId);
        // Handle abort/timeout errors
        if (error.name === "AbortError" || controller.signal.aborted) {
            throw new Error(
                `Twitter API request timed out after ${timeoutMs}ms`
            );
        }
        throw error;
    }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<any> {
    const data = await twitterFetch(
        `/users/by/username/${username}?user.fields=created_at,description,public_metrics,verified`
    );

    return data.data;
}

/**
 * Get user metrics
 */
export async function getUserMetrics(
    username: string
): Promise<TwitterMetrics> {
    try {
        const user = await getUserByUsername(username);

        return {
            followers: user.public_metrics.followers_count,
            following: user.public_metrics.following_count,
            tweetCount: user.public_metrics.tweet_count,
            verified: user.verified || false,
            createdAt: user.created_at,
        };
    } catch (error) {
        console.error("Error fetching Twitter metrics:", error);
        throw error;
    }
}

/**
 * Get user tweets (for engagement analysis)
 */
export async function getUserTweets(
    userId: string,
    maxResults = 100
): Promise<any[]> {
    try {
        const data = await twitterFetch(
            `/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`
        );

        return data.data || [];
    } catch (error) {
        console.error("Error fetching user tweets:", error);
        return [];
    }
}

/**
 * Calculate engagement metrics from recent tweets
 */
export async function getEngagementMetrics(
    username: string
): Promise<TwitterMetrics> {
    try {
        const user = await getUserByUsername(username);
        const tweets = await getUserTweets(user.id, 100);

        // Calculate total engagement from last 100 tweets
        let totalLikes = 0;
        let totalRetweets = 0;
        let totalReplies = 0;

        tweets.forEach((tweet: any) => {
            if (tweet.public_metrics) {
                totalLikes += tweet.public_metrics.like_count || 0;
                totalRetweets += tweet.public_metrics.retweet_count || 0;
                totalReplies += tweet.public_metrics.reply_count || 0;
            }
        });

        return {
            followers: user.public_metrics.followers_count,
            following: user.public_metrics.following_count,
            tweetCount: user.public_metrics.tweet_count,
            verified: user.verified || false,
            createdAt: user.created_at,
            engagement30d: {
                likes: totalLikes,
                retweets: totalRetweets,
                replies: totalReplies,
            },
        };
    } catch (error) {
        console.error(
            `Error fetching engagement metrics for ${username}:`,
            error
        );
        // Return default limited metrics instead of throwing to allow script to proceed
        return {
            followers: 0,
            following: 0,
            tweetCount: 0,
            verified: false,
            createdAt: new Date().toISOString(),
            engagement30d: {
                likes: 0,
                retweets: 0,
                replies: 0,
            },
        };
    }
}

/**
 * Uniswap-specific: Get metrics for @Uniswap
 */
export async function getUniswapMetrics(): Promise<TwitterMetrics> {
    return getEngagementMetrics("Uniswap");
}
/**
 * Fabrknt-specific: Get metrics for @fabrknt
 */
export async function getFabrkntMetrics(): Promise<TwitterMetrics> {
    return getEngagementMetrics("fabrknt");
}
