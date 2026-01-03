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
            const maxMatch = errorMessage.match(/max(?:imum)?\s+(?:is\s+)?(\d+)/i);
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

        // Get signatures for different time periods
        // Note: This is approximate since Solana doesn't have direct slot-to-time mapping
        let signatures30d: any[] = [];
        try {
            signatures30d = await getSignaturesForAddress(
                programId,
                slot30dAgo,
                currentSlot,
                options
            );
        } catch (err) {
            console.warn(
                "30-day signature fetch failed, trying 14-day range:",
                err
            );
            const slot14dAgo = await getSlotFromDaysAgo(14, options);
            signatures30d = await getSignaturesForAddress(
                programId,
                slot14dAgo,
                currentSlot,
                options
            );
        }

        const [signatures24h, signatures7d] = await Promise.all([
            getSignaturesForAddress(
                programId,
                slot24hAgo,
                currentSlot,
                options
            ),
            getSignaturesForAddress(programId, slot7dAgo, currentSlot, options),
        ]);

        // Get unique addresses (sample-based for performance)
        const [uniqueWallets24h, uniqueWallets7d, uniqueWallets30d] =
            await Promise.all([
                getUniqueAddressesFromSignatures(signatures24h, options),
                getUniqueAddressesFromSignatures(signatures7d, options),
                getUniqueAddressesFromSignatures(signatures30d, options),
            ]);

        return {
            transactionCount24h: signatures24h.length,
            transactionCount7d: signatures7d.length,
            transactionCount30d: signatures30d.length,
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
 * Jupiter Aggregator: Get metrics for Jupiter program
 * Main Program: JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
 *
 * Note: This provides transaction counts and unique wallets.
 * For volume/fees data, use Dune Analytics or parse swap events.
 */
export async function getJupiterMetrics(): Promise<Partial<OnChainMetrics>> {
    const JUPITER_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
    const metrics = await getOnChainMetrics(JUPITER_PROGRAM_ID);

    // Use transaction counts as proxy for activity
    // Note: This is approximate - actual volume requires parsing Swap events
    return {
        ...metrics,
        // Estimate monthly active users from unique wallets
        monthlyActiveUsers: metrics.uniqueWallets30d || 0,
    };
}
