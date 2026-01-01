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

    const response = await fetch(`${TWITTER_API_BASE}${endpoint}`, {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    // Handle rate limiting (429) with exponential backoff
    if (response.status === 429) {
        if (retryCount >= maxRetries) {
            throw new Error(
                `Twitter API rate limit exceeded after ${maxRetries} retries. Please wait before trying again.`
            );
        }

        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get("x-rate-limit-reset");
        let waitTime: number;

        if (retryAfter) {
            const resetTime = parseInt(retryAfter, 10) * 1000; // Convert to milliseconds
            waitTime = Math.max(0, resetTime - Date.now());
        } else {
            // Exponential backoff: 2^retryCount seconds (2s, 4s, 8s)
            waitTime = Math.pow(2, retryCount) * 1000;
        }

        // Cap wait time at 5 minutes
        waitTime = Math.min(waitTime, 5 * 60 * 1000);

        console.warn(
            `Twitter API rate limit hit. Retrying in ${Math.round(
                waitTime / 1000
            )}s... (attempt ${retryCount + 1}/${maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));

        // Retry the request
        return twitterFetch(endpoint, options, retryCount + 1, maxRetries);
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
        console.error("Error fetching engagement metrics:", error);
        throw error;
    }
}

/**
 * Uniswap-specific: Get metrics for @Uniswap
 */
export async function getUniswapMetrics(): Promise<TwitterMetrics> {
    return getEngagementMetrics("Uniswap");
}
