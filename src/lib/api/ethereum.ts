/**
 * Ethereum RPC API Client
 * Fetches on-chain Ethereum data: transactions, active addresses, contract data
 *
 * Supports both Alchemy (with API key) and standard Ethereum RPC endpoints (public)
 * Uses standard JSON-RPC methods compatible with any Ethereum RPC provider
 */

import { OnChainMetrics } from "./types";

// Support Alchemy API key (optional)
const ALCHEMY_API_KEY =
    process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Support custom Ethereum RPC URL (optional)
const ETHEREUM_RPC_URL =
    process.env.ETHEREUM_RPC_URL || process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL;

// Public RPC endpoints (fallback, no API key needed)
const PUBLIC_RPC_ENDPOINTS = [
    "https://eth.llamarpc.com", // LlamaRPC - reliable, free
    "https://rpc.ankr.com/eth", // Ankr - reliable, free
    "https://ethereum.publicnode.com", // PublicNode - community-run
];

interface EthereumAPIOptions {
    apiKey?: string;
    rpcUrl?: string;
}

/**
 * Get Ethereum RPC URL
 * Priority: Custom RPC URL > Alchemy (if API key) > Public RPC endpoints
 */
function getEthereumRpcUrl(options?: EthereumAPIOptions): string {
    // Use custom RPC URL if provided
    if (options?.rpcUrl) {
        return options.rpcUrl;
    }
    if (ETHEREUM_RPC_URL) {
        return ETHEREUM_RPC_URL;
    }

    // Use Alchemy if API key is available
    const apiKey = options?.apiKey || ALCHEMY_API_KEY;
    if (apiKey) {
        return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    }

    // Fallback to public RPC endpoints (use first one)
    return PUBLIC_RPC_ENDPOINTS[0];
}

/**
 * Make Ethereum JSON-RPC request
 * Works with any Ethereum RPC provider (Alchemy, Infura, public RPC, etc.)
 */
async function ethereumRpcFetch(
    method: string,
    params: any[],
    options?: EthereumAPIOptions
): Promise<any> {
    const rpcUrl = getEthereumRpcUrl(options);

    // Add timeout using AbortController (increased to 5 minutes for RPC calls)
    const controller = new AbortController();
    const timeoutMs = 300000; // 300 seconds (5 minutes) - increased to handle slow RPCs and rate limits
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(rpcUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method,
                params,
            }),
            signal: controller.signal,
            next: { revalidate: 300 }, // Cache for 5 minutes
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            // Check for rate limit errors (429)
            // Note: Ethereum RPC typically doesn't provide retry-after header,
            // so we'll rely on exponential backoff in retry.ts
            if (response.status === 429) {
                const error: any = new Error(
                    `Ethereum RPC error: ${response.status} ${response.statusText} (rate limit exceeded)`
                );
                error.status = 429;
                // Don't set retryAfter - Ethereum RPC doesn't provide this info
                // retry.ts will use exponential backoff instead
                throw error;
            }

            throw new Error(
                `Ethereum RPC error: ${response.status} ${response.statusText}`
            );
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error(
                `Ethereum RPC error: Invalid JSON response (status ${response.status})`
            );
        }

        if (data.error) {
            // Check for rate limit errors in JSON-RPC error response
            const errorCode = data.error?.code;
            const errorMessage = data.error?.message || "";

            if (
                errorCode === 429 ||
                errorMessage.toLowerCase().includes("rate limit") ||
                errorMessage.toLowerCase().includes("too many requests")
            ) {
                // Ethereum RPC typically doesn't provide retry-after info
                // retry.ts will use exponential backoff instead
                const error: any = new Error(
                    `Ethereum RPC error: ${errorMessage} (rate limit exceeded)`
                );
                error.status = 429;
                // Don't set retryAfter - rely on exponential backoff
                throw error;
            }

            throw new Error(`Ethereum RPC error: ${errorMessage}`);
        }

        // Handle case where result is undefined (some RPC providers return empty responses)
        if (data.result === undefined && !data.error) {
            throw new Error("Ethereum RPC error: no response");
        }

        return data.result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        // Handle abort/timeout errors
        if (error.name === "AbortError" || controller.signal.aborted) {
            throw new Error(
                `Ethereum RPC request timed out after ${timeoutMs}ms`
            );
        }
        throw error;
    }
}

/**
 * Get transaction count for an address in a block range
 */
export async function getTransactionCount(
    address: string,
    fromBlock: string,
    toBlock: string,
    options?: EthereumAPIOptions
): Promise<number> {
    try {
        // This is a simplified approach - in production you'd want to use getLogs
        // or enhanced APIs from providers like Alchemy
        const logs = await ethereumRpcFetch(
            "eth_getLogs",
            [
                {
                    address,
                    fromBlock,
                    toBlock,
                },
            ],
            options
        );

        return logs.length;
    } catch (error) {
        console.error("Error fetching transaction count:", error);
        return 0;
    }
}

/**
 * Get current block number
 */
export async function getCurrentBlock(
    options?: EthereumAPIOptions
): Promise<number> {
    const blockHex = await ethereumRpcFetch("eth_blockNumber", [], options);
    return parseInt(blockHex, 16);
}

/**
 * Get block timestamp
 */
export async function getBlockTimestamp(
    blockNumber: number,
    options?: EthereumAPIOptions
): Promise<number> {
    const block = await ethereumRpcFetch(
        "eth_getBlockByNumber",
        [`0x${blockNumber.toString(16)}`, false],
        options
    );

    return parseInt(block.timestamp, 16);
}

/**
 * Calculate block number from days ago
 */
export async function getBlockFromDaysAgo(
    days: number,
    options?: EthereumAPIOptions
): Promise<number> {
    const currentBlock = await getCurrentBlock(options);
    const blocksPerDay = 7200; // Approximate blocks per day on Ethereum
    const blocksAgo = Math.floor(days * blocksPerDay);

    return currentBlock - blocksAgo;
}

/**
 * Get logs/events for a contract in a time range
 * Automatically chunks large ranges to avoid API limits
 * Handles "range is too large" errors by dynamically adjusting chunk size
 */
async function getContractLogsWithChunkSize(
    contractAddress: string,
    fromBlock: number,
    toBlock: number,
    chunkSize: number,
    options?: EthereumAPIOptions
): Promise<any[]> {
    const blockRange = toBlock - fromBlock;

    // If range is small enough, fetch directly
    if (blockRange <= chunkSize) {
        try {
            const logs = await ethereumRpcFetch(
                "eth_getLogs",
                [
                    {
                        address: contractAddress,
                        fromBlock: `0x${fromBlock.toString(16)}`,
                        toBlock: `0x${toBlock.toString(16)}`,
                    },
                ],
                options
            );

            return logs || [];
        } catch (error: any) {
            // Check if error is about range being too large
            const errorMessage = error?.message || String(error);
            if (
                errorMessage.includes("range is too large") ||
                errorMessage.includes("max is") ||
                errorMessage.includes("too many blocks")
            ) {
                // Extract max block count from error message (e.g., "max is 1k blocks" -> 1000)
                const maxMatch = errorMessage.match(/max is\s+(\d+)\s*(k|K)?\s*blocks?/i);
                if (maxMatch) {
                    let maxBlocks = parseInt(maxMatch[1], 10);
                    if (maxMatch[2] && (maxMatch[2].toLowerCase() === "k")) {
                        maxBlocks *= 1000;
                    }
                    // Retry with smaller chunk size (use 80% of max to be safe)
                    const newChunkSize = Math.floor(maxBlocks * 0.8);
                    console.warn(
                        `Block range too large (${blockRange} blocks). Retrying with chunk size ${newChunkSize}...`
                    );
                    return getContractLogsWithChunkSize(
                        contractAddress,
                        fromBlock,
                        toBlock,
                        newChunkSize,
                        options
                    );
                }
                // If we can't extract max, try with half the current chunk size
                const newChunkSize = Math.floor(chunkSize / 2);
                if (newChunkSize >= 100) {
                    // Minimum chunk size of 100 blocks
                    console.warn(
                        `Block range too large. Retrying with smaller chunk size ${newChunkSize}...`
                    );
                    return getContractLogsWithChunkSize(
                        contractAddress,
                        fromBlock,
                        toBlock,
                        newChunkSize,
                        options
                    );
                }
            }
            throw error;
        }
    }

    // For large ranges, split into chunks
    // Limit concurrent requests to avoid overwhelming RPC endpoints
    const MAX_CONCURRENT_REQUESTS = 5;
    const chunks: Array<{ from: number; to: number }> = [];
    let currentFrom = fromBlock;

    while (currentFrom < toBlock) {
        const currentTo = Math.min(currentFrom + chunkSize, toBlock);
        chunks.push({ from: currentFrom, to: currentTo });
        currentFrom = currentTo + 1;
    }

    // Process chunks in batches to limit concurrent requests
    const results: any[] = [];
    for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = chunks.slice(i, i + MAX_CONCURRENT_REQUESTS);
        const batchPromises = batch.map(({ from, to }) =>
            getContractLogsWithChunkSize(
                contractAddress,
                from,
                to,
                chunkSize,
                options
            ).catch((err) => {
                console.error(
                    `Error fetching logs chunk ${from}-${to}:`,
                    err.message || err
                );
                return [];
            })
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.flat());

        // Small delay between batches to avoid overwhelming RPC
        if (i + MAX_CONCURRENT_REQUESTS < chunks.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Get logs/events for a contract in a time range
 * Automatically chunks large ranges to avoid API limits
 */
export async function getContractLogs(
    contractAddress: string,
    fromBlock: number,
    toBlock: number,
    options?: EthereumAPIOptions
): Promise<any[]> {
    try {
        // Start with a conservative chunk size (1000 blocks)
        // Some RPC providers have stricter limits (e.g., 1k blocks)
        const INITIAL_CHUNK_SIZE = 1000;
        return await getContractLogsWithChunkSize(
            contractAddress,
            fromBlock,
            toBlock,
            INITIAL_CHUNK_SIZE,
            options
        );
    } catch (error) {
        console.error("Error fetching contract logs:", error);
        return [];
    }
}

/**
 * Get unique addresses from logs (simplified - counts unique 'from' addresses)
 */
export function getUniqueAddressesFromLogs(logs: any[]): number {
    const addresses = new Set<string>();

    logs.forEach((log) => {
        // Extract addresses from topics (simplified)
        if (log.topics && log.topics.length > 0) {
            log.topics.forEach((topic: string) => {
                // Topics are padded addresses, we need to extract the actual address
                if (topic.length === 66) {
                    const address = "0x" + topic.slice(-40);
                    addresses.add(address.toLowerCase());
                }
            });
        }
    });

    return addresses.size;
}

/**
 * Get on-chain metrics for a contract
 * Note: This is a simplified version. In production, you'd use Dune for more accurate metrics
 *
 * For 30-day metrics, we use a sampling approach to avoid hitting API limits:
 * - Fetch logs in smaller chunks
 * - For very active contracts, consider using Dune Analytics instead
 */
export async function getOnChainMetrics(
    contractAddress: string,
    options?: EthereumAPIOptions
): Promise<Partial<OnChainMetrics>> {
    try {
        const currentBlock = await getCurrentBlock(options);
        const block24hAgo = await getBlockFromDaysAgo(1, options);
        const block7dAgo = await getBlockFromDaysAgo(7, options);
        const block30dAgo = await getBlockFromDaysAgo(30, options);

        // Get logs for different time periods
        // Note: Large ranges will be automatically chunked by getContractLogs
        let logs30d: any[] = [];
        try {
            logs30d = await getContractLogs(
                contractAddress,
                block30dAgo,
                currentBlock,
                options
            );
        } catch (err) {
            // If 30-day fetch fails, try a smaller range (14 days) as fallback
            console.warn("30-day log fetch failed, trying 14-day range:", err);
            const block14dAgo = await getBlockFromDaysAgo(14, options);
            logs30d = await getContractLogs(
                contractAddress,
                block14dAgo,
                currentBlock,
                options
            );
        }

        const [logs24h, logs7d] = await Promise.all([
            getContractLogs(
                contractAddress,
                block24hAgo,
                currentBlock,
                options
            ),
            getContractLogs(contractAddress, block7dAgo, currentBlock, options),
        ]);

        return {
            transactionCount24h: logs24h.length,
            transactionCount7d: logs7d.length,
            transactionCount30d: logs30d.length,
            uniqueWallets24h: getUniqueAddressesFromLogs(logs24h),
            uniqueWallets7d: getUniqueAddressesFromLogs(logs7d),
            uniqueWallets30d: getUniqueAddressesFromLogs(logs30d),
            contractAddress,
            chain: "ethereum",
        };
    } catch (error) {
        console.error("Error fetching on-chain metrics:", error);
        return {
            transactionCount24h: 0,
            transactionCount7d: 0,
            transactionCount30d: 0,
            uniqueWallets24h: 0,
            uniqueWallets7d: 0,
            uniqueWallets30d: 0,
            contractAddress,
            chain: "ethereum",
            monthlyActiveUsers: 0,
        };
    }
}

/**
 * Uniswap V3: Get comprehensive metrics using DefiLlama + on-chain data
 * Combines real TVL data from DefiLlama with estimated user/transaction metrics
 *
 * Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984
 */
export async function getUniswapMetrics(
    options?: EthereumAPIOptions
): Promise<Partial<OnChainMetrics>> {
    const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

    try {
        // Import DefiLlama client dynamically
        const { getProtocolMetrics } = await import("./defillama");

        // Get real TVL and estimated metrics from DefiLlama
        const defiMetrics = await getProtocolMetrics("uniswap", "dex");

        if (defiMetrics) {
            console.log(
                `✓ DefiLlama: Uniswap TVL = $${(defiMetrics.tvl / 1e9).toFixed(2)}B`
            );

            return {
                contractAddress: UNISWAP_V3_FACTORY,
                chain: "ethereum",
                tvl: defiMetrics.tvl,
                // Use DefiLlama-estimated metrics (more accurate than factory contract)
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
            "DefiLlama fetch failed, falling back to on-chain factory metrics:",
            error
        );
    }

    // Fallback: Use factory contract metrics if DefiLlama fails
    const metrics = await getOnChainMetrics(UNISWAP_V3_FACTORY, options);
    return {
        ...metrics,
        monthlyActiveUsers: metrics.uniqueWallets30d || 0,
    };
}
