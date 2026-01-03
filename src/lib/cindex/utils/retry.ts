/**
 * Retry Utility
 * Implements retry logic with exponential backoff for transient failures
 */

import { TimeoutError } from "./timeout";

export interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    retryableErrors?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelayMs: 2000, // Start with 2s delay (increased from 1s)
    maxDelayMs: 120000, // Allow up to 2min delays for rate limits (increased from 30s)
    retryableErrors: (error: any) => {
        // Retry on timeouts and network errors
        if (error instanceof TimeoutError) {
            return true;
        }
        // Retry on network errors
        if (error instanceof TypeError && error.message.includes("fetch")) {
            return true;
        }
        // Retry on 429 (rate limit) and 5xx errors
        if (
            error?.status === 429 ||
            (error?.status >= 500 && error?.status < 600)
        ) {
            return true;
        }
        // GitHub 403 can be rate limit - check error message
        if (error?.status === 403) {
            const errorMsg = error?.message || "";
            // Retry if it's a rate limit error (GitHub returns 403 for rate limits)
            if (
                errorMsg.includes("rate limit") ||
                errorMsg.includes("403") ||
                errorMsg.includes("Too Many Requests")
            ) {
                return true;
            }
            // Don't retry on auth errors
            return false;
        }
        // Don't retry on permanent errors (401, 404)
        if (error?.status === 401 || error?.status === 404) {
            return false;
        }
        // Retry on other errors by default (could be transient network issues)
        return true;
    },
};

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry (should return a Promise)
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries exhausted
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if error is retryable
            if (!opts.retryableErrors(error)) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt >= opts.maxRetries) {
                break;
            }

            // Calculate delay with exponential backoff
            let delayMs = Math.min(
                opts.initialDelayMs * Math.pow(2, attempt),
                opts.maxDelayMs
            );

            // Special handling for rate limit errors (429, 403 rate limit)
            const isRateLimit =
                error?.status === 429 ||
                (error?.status === 403 &&
                    (error?.message?.includes("rate limit") ||
                        error?.message?.includes("403")));

            if (isRateLimit) {
                // For rate limits, use longer delays and check for retry-after header
                const retryAfter =
                    error?.retryAfter || error?.headers?.get?.("retry-after");
                if (retryAfter) {
                    // retryAfter is in seconds (from GitHub API x-ratelimit-reset header)
                    // Convert to milliseconds
                    const retryAfterSeconds =
                        typeof retryAfter === "number"
                            ? retryAfter
                            : parseInt(retryAfter, 10);
                    const retryAfterMs = retryAfterSeconds * 1000;

                    // Use the retry-after time, but cap at 15 minutes to avoid waiting too long
                    delayMs = Math.min(retryAfterMs, 900000); // Cap at 15 minutes

                    // If retry-after is very long, log it
                    if (retryAfterMs > 300000) {
                        const minutes = Math.round(retryAfterMs / 60000);
                        console.warn(
                            `Rate limit resets in ${minutes} minutes. Waiting up to 15 minutes...`
                        );
                    }
                } else {
                    // Use longer exponential backoff for rate limits: 5s, 10s, 20s, 40s, 80s
                    delayMs = Math.min(
                        5000 * Math.pow(2, attempt),
                        300000 // Cap at 5 minutes for rate limits without retry-after
                    );
                }
            }

            const delaySeconds = Math.round(delayMs / 1000);
            const delayMinutes = Math.round(delaySeconds / 60);

            let retryMessage = `Attempt ${attempt + 1}/${
                opts.maxRetries + 1
            } failed: ${error.message}`;

            if (isRateLimit) {
                if (delaySeconds >= 60) {
                    retryMessage += `. Rate limit detected - Waiting ${delayMinutes} minute${
                        delayMinutes > 1 ? "s" : ""
                    } until rate limit resets...`;
                } else {
                    retryMessage += `. Rate limit detected - Retrying in ${delaySeconds}s...`;
                }
            } else {
                retryMessage += `. Retrying in ${delaySeconds}s...`;
            }

            console.warn(retryMessage);

            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
}
