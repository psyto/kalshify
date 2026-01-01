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
        const signatures: any[] = [];

        let before: string | undefined = undefined;
        let hasMore = true;

        while (hasMore && signatures.length < MAX_SIGNATURES) {
            const batch = await connection.getSignaturesForAddress(publicKey, {
                limit: 1000,
                before,
            });

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
            if (batch.length < 1000) {
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
        }

        return signatures;
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        console.error("Error fetching on-chain metrics:", error);
        throw error;
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
