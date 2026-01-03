/**
 * Solana RPC API Client
 * Fetches on-chain Solana data: transactions, active addresses, program data
 */

import { OnChainMetrics } from "./types";
import { Connection, PublicKey } from "@solana/web3.js";

// Support Helius API key (optional, but recommended for better rate limits)
const HELIUS_API_KEY =
    process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;

// Support custom Solana RPC URL (optional)
const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

// Public RPC endpoints (fallback, no API key needed)
const PUBLIC_RPC_ENDPOINTS = [
    "https://api.mainnet-beta.solana.com", // Official Solana RPC
    "https://solana-api.projectserum.com", // Project Serum RPC
];

interface SolanaAPIOptions {
    rpcUrl?: string;
    apiKey?: string;
}

/**
 * Get Solana RPC URL
 * Priority: Custom RPC URL > Helius (if API key) > Public RPC endpoints
 */
function getSolanaRpcUrl(options?: SolanaAPIOptions): string {
    // Use custom RPC URL if provided
    if (options?.rpcUrl) {
        return options.rpcUrl;
    }
    if (SOLANA_RPC_URL) {
        return SOLANA_RPC_URL;
    }

    // Use Helius if API key is available
    const apiKey = options?.apiKey || HELIUS_API_KEY;
    if (apiKey) {
        return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
    }

    // Fallback to public RPC endpoints (use first one)
    return PUBLIC_RPC_ENDPOINTS[0];
}

// Simple in-memory cache to avoid redundant API calls
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(key: string): string {
    return `solana:${key}`;
}

function getCached(key: string): any | null {
    const cacheKey = getCacheKey(key);
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    if (cached) {
        cache.delete(cacheKey);
    }
    return null;
}

function setCache(key: string, data: any): void {
    const cacheKey = getCacheKey(key);
    cache.set(cacheKey, {
        data,
        expires: Date.now() + CACHE_TTL,
    });
}

/**
 * Get Solana connection
 */
function getConnection(options?: SolanaAPIOptions): Connection {
    const rpcUrl = getSolanaRpcUrl(options);
    return new Connection(rpcUrl, "confirmed");
}

/**
 * Get current slot
 */
export async function getCurrentSlot(
    options?: SolanaAPIOptions
): Promise<number> {
    const cacheKey = `currentSlot`;
    const cached = getCached(cacheKey);
    if (cached) {
        return cached;
    }

    const connection = getConnection(options);
    const slot = await connection.getSlot();
    setCache(cacheKey, slot);
    return slot;
}

/**
 * Get block time (Unix timestamp)
 */
export async function getBlockTime(
    slot: number,
    options?: SolanaAPIOptions
): Promise<number | null> {
    const connection = getConnection(options);
    return connection.getBlockTime(slot);
}

/**
 * Get slot from days ago (approximate)
 */
export async function getSlotFromDaysAgo(
    days: number,
    options?: SolanaAPIOptions
): Promise<number> {
    const currentSlot = await getCurrentSlot(options);
    const slotsPerDay = 432000; // ~432k slots per day on Solana (400ms per slot)
    const slotsAgo = Math.floor(days * slotsPerDay);

    return Math.max(0, currentSlot - slotsAgo);
}

/**
 * Get signatures for an address with a specific limit
 * Handles "limit is too large" errors by dynamically adjusting limit
 */
async function getSignaturesForAddressWithLimit(
    publicKey: PublicKey,
    limit: number,
    before: string | undefined,
    options?: SolanaAPIOptions
): Promise<any[]> {
    const connection = getConnection(options);

    try {
        const batch = await connection.getSignaturesForAddress(publicKey, {
            limit,
            before,
        });
        return batch;
    } catch (error: any) {
        const errorMessage = error?.message || String(error);

        // Check for limit too large errors
        if (
            errorMessage.includes("limit") &&
            (errorMessage.includes("too large") ||
                errorMessage.includes("exceeded") ||
                errorMessage.includes("max is") ||
                errorMessage.includes("maximum"))
        ) {
            // Extract max limit from error message if available
            const maxMatch = errorMessage.match(
                /max(?:imum)?\s+(?:is\s+)?(\d+)/i
            );
            if (maxMatch) {
                const maxLimit = parseInt(maxMatch[1], 10);
                // Use 80% of max to be safe
                const newLimit = Math.floor(maxLimit * 0.8);
                if (newLimit >= 10) {
                    // Minimum limit of 10
                    console.warn(
                        `Limit ${limit} is too large. Retrying with limit ${newLimit}...`
                    );
                    return getSignaturesForAddressWithLimit(
                        publicKey,
                        newLimit,
                        before,
                        options
                    );
                }
            }
            // If we can't extract max, try with half the current limit
            const newLimit = Math.floor(limit / 2);
            if (newLimit >= 10) {
                console.warn(
                    `Limit ${limit} is too large. Retrying with smaller limit ${newLimit}...`
                );
                return getSignaturesForAddressWithLimit(
                    publicKey,
                    newLimit,
                    before,
                    options
                );
            }
        }

        // Re-throw other errors (rate limits, etc.)
        throw error;
    }
}

/**
 * Get signatures for an address in a time range
 */
export async function getSignaturesForAddress(
    address: string,
    fromSlot: number,
    toSlot: number,
    options?: SolanaAPIOptions
): Promise<any[]> {
    try {
        const connection = getConnection(options);
        const publicKey = new PublicKey(address);

        // Solana RPC doesn't support slot-based filtering directly
        // We'll use before/after signatures with limits
        // For large ranges, we'll need to paginate
        const MAX_SIGNATURES = 1000; // RPC limit
        const INITIAL_LIMIT = 1000; // Start with 1000, adjust if needed
        const signatures: any[] = [];

        let before: string | undefined = undefined;
        let hasMore = true;
        let currentLimit = INITIAL_LIMIT;

        while (hasMore && signatures.length < MAX_SIGNATURES) {
            try {
                const batch = await getSignaturesForAddressWithLimit(
                    publicKey,
                    currentLimit,
                    before,
                    options
                );

                if (batch.length === 0) {
                    hasMore = false;
                    break;
                }

                // Filter by slot range
                const filtered = batch.filter((sig) => {
                    if (sig.slot === null) return false;
                    return sig.slot >= fromSlot && sig.slot <= toSlot;
                });

                signatures.push(...filtered);

                // If we got fewer than requested, we're done
                if (batch.length < currentLimit) {
                    hasMore = false;
                } else {
                    before = batch[batch.length - 1].signature;
                }

                // If the last signature's slot is before our fromSlot, we're done
                if (
                    batch.length > 0 &&
                    batch[batch.length - 1].slot !== null &&
                    batch[batch.length - 1].slot! < fromSlot
                ) {
                    hasMore = false;
                }
            } catch (error: any) {
                // If limit was adjusted, continue with the new limit
                // Otherwise, check for rate limit errors
                const errorMessage = error?.message || String(error);
                if (
                    errorMessage.includes("429") ||
                    errorMessage.includes("Too Many Requests") ||
                    errorMessage.includes("rate limit")
                ) {
                    const rateLimitError: any = new Error(
                        `Solana RPC error: ${errorMessage} (rate limit exceeded)`
                    );
                    rateLimitError.status = 429;
                    throw rateLimitError;
                }
                // Re-throw other errors
                throw error;
            }
        }

        return signatures;
    } catch (error: any) {
        // Check for rate limit errors (429) in Solana RPC
        // Note: Solana RPC doesn't provide retry-after info, so we'll rely on exponential backoff
        const errorMessage = error?.message || String(error);
        if (
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests") ||
            errorMessage.includes("rate limit")
        ) {
            const rateLimitError: any = new Error(
                `Solana RPC error: ${errorMessage} (rate limit exceeded)`
            );
            rateLimitError.status = 429;
            // Don't set retryAfter - Solana RPC doesn't provide this info
            // retry.ts will use exponential backoff instead
            throw rateLimitError;
        }

        console.error("Error fetching signatures:", error);
        return [];
    }
}

/**
 * Get unique addresses from signatures (extract unique signers)
 */
export async function getUniqueAddressesFromSignatures(
    signatures: any[],
    options?: SolanaAPIOptions
): Promise<number> {
    const addresses = new Set<string>();

    // Get transaction details to extract signers
    const connection = getConnection(options);
    const signatureStrings = signatures
        .slice(0, 100) // Limit to avoid too many requests
        .map((sig) => sig.signature);

    if (signatureStrings.length === 0) {
        return 0;
    }

    try {
        const transactions = await connection.getParsedTransactions(
            signatureStrings,
            {
                maxSupportedTransactionVersion: 0,
            }
        );

        transactions.forEach((tx) => {
            if (tx?.transaction?.message?.accountKeys) {
                tx.transaction.message.accountKeys.forEach((key: any) => {
                    if (key.pubkey) {
                        addresses.add(key.pubkey.toString());
                    }
                });
            }
        });
    } catch (error: any) {
        // Check for rate limit errors (429) in Solana RPC
        // Note: Solana RPC doesn't provide retry-after info, so we'll rely on exponential backoff
        const errorMessage = error?.message || String(error);
        if (
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests") ||
            errorMessage.includes("rate limit")
        ) {
            const rateLimitError: any = new Error(
                `Solana RPC error: ${errorMessage} (rate limit exceeded)`
            );
            rateLimitError.status = 429;
            // Don't set retryAfter - Solana RPC doesn't provide this info
            // retry.ts will use exponential backoff instead
            throw rateLimitError;
        }

        console.error("Error parsing transactions:", error);
        // Fallback: just count unique signatures
        return new Set(signatures.map((sig) => sig.signature)).size;
    }

    return addresses.size;
}

/**
 * Get on-chain metrics for a Solana program
 * Note: This is a simplified version. For production, use specialized APIs like Helius or QuickNode
 *
 * Strategy: Fetch sequentially with delays to avoid rate limits
 * - Start with shorter time periods (24h, 7d) which are more likely to succeed
 * - Use shorter time ranges if 30d fails
 * - Add delays between requests to respect rate limits
 */
export async function getOnChainMetrics(
    programId: string,
    options?: SolanaAPIOptions
): Promise<Partial<OnChainMetrics>> {
    try {
        const currentSlot = await getCurrentSlot(options);
        const slot24hAgo = await getSlotFromDaysAgo(1, options);
        const slot7dAgo = await getSlotFromDaysAgo(7, options);
        const slot30dAgo = await getSlotFromDaysAgo(30, options);

        // Helper function to add delay between requests
        const delay = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        // Fetch sequentially with delays to avoid rate limits
        // Start with 24h (most recent, smallest range)
        let signatures24h: any[] = [];
        try {
            signatures24h = await getSignaturesForAddress(
                programId,
                slot24hAgo,
                currentSlot,
                options
            );
            // Add delay before next request
            await delay(2000); // 2 second delay
        } catch (err: any) {
            console.warn("24h signature fetch failed:", err?.message || err);
            // Continue with empty array - will use zeros
        }

        // Fetch 7d data
        let signatures7d: any[] = [];
        try {
            signatures7d = await getSignaturesForAddress(
                programId,
                slot7dAgo,
                currentSlot,
                options
            );
            // Add delay before next request
            await delay(2000); // 2 second delay
        } catch (err: any) {
            console.warn("7d signature fetch failed:", err?.message || err);
            // Continue with empty array - will use zeros
        }

        // Try 30d, but fallback to shorter ranges if it fails
        let signatures30d: any[] = [];
        try {
            signatures30d = await getSignaturesForAddress(
                programId,
                slot30dAgo,
                currentSlot,
                options
            );
        } catch (err: any) {
            // If 30d fails, try 14d as fallback
            console.warn(
                "30-day signature fetch failed, trying 14-day range:",
                err?.message || err
            );
            try {
                await delay(3000); // Longer delay before retry
                const slot14dAgo = await getSlotFromDaysAgo(14, options);
                signatures30d = await getSignaturesForAddress(
                    programId,
                    slot14dAgo,
                    currentSlot,
                    options
                );
            } catch (fallbackErr: any) {
                console.warn(
                    "14-day signature fetch also failed:",
                    fallbackErr?.message || fallbackErr
                );
                // If both fail, estimate 30d from 7d data (rough approximation)
                if (signatures7d.length > 0) {
                    console.warn("Using 7d data to estimate 30d metrics");
                    signatures30d = signatures7d; // Will be scaled below
                }
            }
        }

        // Get unique addresses sequentially with delays to avoid rate limits
        // Only fetch unique addresses if we have signatures
        let uniqueWallets24h = 0;
        let uniqueWallets7d = 0;
        let uniqueWallets30d = 0;

        if (signatures24h.length > 0) {
            try {
                uniqueWallets24h = await getUniqueAddressesFromSignatures(
                    signatures24h,
                    options
                );
                await delay(2000); // Delay before next request
            } catch (err: any) {
                console.warn(
                    "Failed to get unique wallets for 24h:",
                    err?.message || err
                );
                // Fallback: estimate from signature count
                uniqueWallets24h = Math.min(signatures24h.length, 100);
            }
        }

        if (signatures7d.length > 0) {
            try {
                uniqueWallets7d = await getUniqueAddressesFromSignatures(
                    signatures7d,
                    options
                );
                await delay(2000); // Delay before next request
            } catch (err: any) {
                console.warn(
                    "Failed to get unique wallets for 7d:",
                    err?.message || err
                );
                // Fallback: estimate from signature count
                uniqueWallets7d = Math.min(signatures7d.length, 500);
            }
        }

        if (signatures30d.length > 0) {
            try {
                uniqueWallets30d = await getUniqueAddressesFromSignatures(
                    signatures30d,
                    options
                );
            } catch (err: any) {
                console.warn(
                    "Failed to get unique wallets for 30d:",
                    err?.message || err
                );
                // Fallback: estimate from signature count or scale from 7d
                if (signatures30d === signatures7d) {
                    // If we used 7d data, scale it
                    uniqueWallets30d = Math.min(
                        Math.round(uniqueWallets7d * 4.3),
                        signatures30d.length
                    );
                } else {
                    uniqueWallets30d = Math.min(signatures30d.length, 2000);
                }
            }
        }

        // If 30d was estimated from 7d, scale transaction count too
        let transactionCount30d = signatures30d.length;
        if (signatures30d === signatures7d && signatures7d.length > 0) {
            // Rough estimate: 30d ≈ 4.3x 7d
            transactionCount30d = Math.round(signatures7d.length * 4.3);
        }

        return {
            transactionCount24h: signatures24h.length,
            transactionCount7d: signatures7d.length,
            transactionCount30d,
            uniqueWallets24h,
            uniqueWallets7d,
            uniqueWallets30d,
            contractAddress: programId,
            chain: "solana",
            // Use unique wallets as proxy for monthly active users
            monthlyActiveUsers: uniqueWallets30d,
        };
    } catch (error: any) {
        // Check for rate limit errors (429) in Solana RPC
        // Note: Solana RPC doesn't provide retry-after info, so we'll rely on exponential backoff
        const errorMessage = error?.message || String(error);
        if (
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests") ||
            errorMessage.includes("rate limit")
        ) {
            const rateLimitError: any = new Error(
                `Solana RPC error: ${errorMessage} (rate limit exceeded)`
            );
            rateLimitError.status = 429;
            // Don't set retryAfter - Solana RPC doesn't provide this info
            // retry.ts will use exponential backoff instead
            throw rateLimitError;
        }

        console.error("Error fetching on-chain metrics:", error);
        return {
            transactionCount24h: 0,
            transactionCount7d: 0,
            transactionCount30d: 0,
            uniqueWallets24h: 0,
            uniqueWallets7d: 0,
            uniqueWallets30d: 0,
            chain: "solana",
            monthlyActiveUsers: 0,
        };
    }
}

/**
 * Jupiter Aggregator: Get comprehensive metrics using DefiLlama + on-chain data
 * Combines real TVL data from DefiLlama with estimated user/transaction metrics
 *
 * Program: JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
 */
export async function getJupiterMetrics(): Promise<Partial<OnChainMetrics>> {
    const JUPITER_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";

    try {
        // Import DefiLlama client dynamically
        const { getProtocolMetrics } = await import("./defillama");

        // Get real TVL and estimated metrics from DefiLlama
        const defiMetrics = await getProtocolMetrics("jupiter", "dex");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: Jupiter TVL = $${(defiMetrics.tvl / 1e9).toFixed(2)}B`
            );

            return {
                chain: "solana",
                tvl: defiMetrics.tvl,
                // Use DefiLlama-estimated metrics (more accurate than RPC signature counting)
                dailyActiveUsers: defiMetrics.estimatedDailyUsers,
                monthlyActiveUsers: defiMetrics.estimatedMonthlyUsers,
                transactionCount30d: defiMetrics.estimatedMonthlyTransactions,
                transactionCount24h: Math.floor(
                    defiMetrics.estimatedMonthlyTransactions / 30
                ),
                transactionCount7d: Math.floor(
                    (defiMetrics.estimatedMonthlyTransactions / 30) * 7
                ),
                // Estimate unique wallets from users
                uniqueWallets30d: defiMetrics.estimatedMonthlyUsers,
                uniqueWallets24h: defiMetrics.estimatedDailyUsers,
                uniqueWallets7d: Math.floor(defiMetrics.estimatedDailyUsers * 5),
            };
        }
    } catch (error) {
        console.warn(
            "DefiLlama fetch failed, falling back to minimal RPC metrics:",
            error
        );
    }

    // Fallback: Use minimal RPC metrics if DefiLlama fails
    // Note: This may hit rate limits for high-traffic protocols
    const metrics = await getOnChainMetrics(JUPITER_PROGRAM_ID);
    return {
        ...metrics,
        monthlyActiveUsers: metrics.uniqueWallets30d || 0,
    };
}

/**
 * Kamino: Get comprehensive metrics using DefiLlama
 * Kamino is a lending/liquidity protocol on Solana
 */
export async function getKaminoMetrics(): Promise<Partial<OnChainMetrics>> {
    try {
        const { getProtocolMetrics } = await import("./defillama");
        const defiMetrics = await getProtocolMetrics("kamino", "lending");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: Kamino TVL = $${(defiMetrics.tvl / 1e9).toFixed(2)}B`
            );

            return {
                chain: "solana",
                tvl: defiMetrics.tvl,
                dailyActiveUsers: defiMetrics.estimatedDailyUsers,
                monthlyActiveUsers: defiMetrics.estimatedMonthlyUsers,
                transactionCount30d: defiMetrics.estimatedMonthlyTransactions,
                transactionCount24h: Math.floor(
                    defiMetrics.estimatedMonthlyTransactions / 30
                ),
                transactionCount7d: Math.floor(
                    (defiMetrics.estimatedMonthlyTransactions / 30) * 7
                ),
                uniqueWallets30d: defiMetrics.estimatedMonthlyUsers,
                uniqueWallets24h: defiMetrics.estimatedDailyUsers,
                uniqueWallets7d: Math.floor(defiMetrics.estimatedDailyUsers * 5),
            };
        }
    } catch (error) {
        console.warn("DefiLlama fetch failed for Kamino:", error);
    }

    return {
        chain: "solana",
        transactionCount24h: 0,
        transactionCount30d: 0,
        monthlyActiveUsers: 0,
    };
}

/**
 * Drift: Get comprehensive metrics using DefiLlama
 * Drift is a perpetuals DEX on Solana
 */
export async function getDriftMetrics(): Promise<Partial<OnChainMetrics>> {
    try {
        const { getProtocolMetrics } = await import("./defillama");
        const defiMetrics = await getProtocolMetrics("drift", "derivatives");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: Drift TVL = $${(defiMetrics.tvl / 1e6).toFixed(2)}M`
            );

            return {
                chain: "solana",
                tvl: defiMetrics.tvl,
                dailyActiveUsers: defiMetrics.estimatedDailyUsers,
                monthlyActiveUsers: defiMetrics.estimatedMonthlyUsers,
                transactionCount30d: defiMetrics.estimatedMonthlyTransactions,
                transactionCount24h: Math.floor(
                    defiMetrics.estimatedMonthlyTransactions / 30
                ),
                transactionCount7d: Math.floor(
                    (defiMetrics.estimatedMonthlyTransactions / 30) * 7
                ),
                uniqueWallets30d: defiMetrics.estimatedMonthlyUsers,
                uniqueWallets24h: defiMetrics.estimatedDailyUsers,
                uniqueWallets7d: Math.floor(defiMetrics.estimatedDailyUsers * 5),
            };
        }
    } catch (error) {
        console.warn("DefiLlama fetch failed for Drift:", error);
    }

    return {
        chain: "solana",
        transactionCount24h: 0,
        transactionCount30d: 0,
        monthlyActiveUsers: 0,
    };
}

/**
 * Orca: Get comprehensive metrics using DefiLlama
 * Orca is a DEX on Solana
 */
export async function getOrcaMetrics(): Promise<Partial<OnChainMetrics>> {
    try {
        const { getProtocolMetrics } = await import("./defillama");
        const defiMetrics = await getProtocolMetrics("orca", "dex");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: Orca TVL = $${(defiMetrics.tvl / 1e6).toFixed(2)}M`
            );

            return {
                chain: "solana",
                tvl: defiMetrics.tvl,
                dailyActiveUsers: defiMetrics.estimatedDailyUsers,
                monthlyActiveUsers: defiMetrics.estimatedMonthlyUsers,
                transactionCount30d: defiMetrics.estimatedMonthlyTransactions,
                transactionCount24h: Math.floor(
                    defiMetrics.estimatedMonthlyTransactions / 30
                ),
                transactionCount7d: Math.floor(
                    (defiMetrics.estimatedMonthlyTransactions / 30) * 7
                ),
                uniqueWallets30d: defiMetrics.estimatedMonthlyUsers,
                uniqueWallets24h: defiMetrics.estimatedDailyUsers,
                uniqueWallets7d: Math.floor(defiMetrics.estimatedDailyUsers * 5),
            };
        }
    } catch (error) {
        console.warn("DefiLlama fetch failed for Orca:", error);
    }

    return {
        chain: "solana",
        transactionCount24h: 0,
        transactionCount30d: 0,
        monthlyActiveUsers: 0,
    };
}

/**
 * MarginFi: Get comprehensive metrics using DefiLlama
 * MarginFi is a lending protocol on Solana
 */
export async function getMarginFiMetrics(): Promise<Partial<OnChainMetrics>> {
    try {
        const { getProtocolMetrics } = await import("./defillama");
        const defiMetrics = await getProtocolMetrics("marginfi", "lending");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: MarginFi TVL = $${(defiMetrics.tvl / 1e6).toFixed(2)}M`
            );

            return {
                chain: "solana",
                tvl: defiMetrics.tvl,
                dailyActiveUsers: defiMetrics.estimatedDailyUsers,
                monthlyActiveUsers: defiMetrics.estimatedMonthlyUsers,
                transactionCount30d: defiMetrics.estimatedMonthlyTransactions,
                transactionCount24h: Math.floor(
                    defiMetrics.estimatedMonthlyTransactions / 30
                ),
                transactionCount7d: Math.floor(
                    (defiMetrics.estimatedMonthlyTransactions / 30) * 7
                ),
                uniqueWallets30d: defiMetrics.estimatedMonthlyUsers,
                uniqueWallets24h: defiMetrics.estimatedDailyUsers,
                uniqueWallets7d: Math.floor(defiMetrics.estimatedDailyUsers * 5),
            };
        }
    } catch (error) {
        console.warn("DefiLlama fetch failed for MarginFi:", error);
    }

    return {
        chain: "solana",
        transactionCount24h: 0,
        transactionCount30d: 0,
        monthlyActiveUsers: 0,
    };
}
