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
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        throw new Error(
            `Ethereum RPC error: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Ethereum RPC error: ${data.error.message}`);
    }

    return data.result;
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
 */
export async function getContractLogs(
    contractAddress: string,
    fromBlock: number,
    toBlock: number,
    options?: EthereumAPIOptions
): Promise<any[]> {
    try {
        const MAX_BLOCK_RANGE = 10000; // ~1.4 days, safe limit for eth_getLogs
        const blockRange = toBlock - fromBlock;

        // If range is small enough, fetch directly
        if (blockRange <= MAX_BLOCK_RANGE) {
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
        }

        // For large ranges, split into chunks
        const chunks: Promise<any[]>[] = [];
        let currentFrom = fromBlock;

        while (currentFrom < toBlock) {
            const currentTo = Math.min(currentFrom + MAX_BLOCK_RANGE, toBlock);

            chunks.push(
                ethereumRpcFetch(
                    "eth_getLogs",
                    [
                        {
                            address: contractAddress,
                            fromBlock: `0x${currentFrom.toString(16)}`,
                            toBlock: `0x${currentTo.toString(16)}`,
                        },
                    ],
                    options
                ).catch((err) => {
                    console.error(
                        `Error fetching logs chunk ${currentFrom}-${currentTo}:`,
                        err
                    );
                    return [];
                })
            );

            currentFrom = currentTo + 1;
        }

        // Fetch all chunks in parallel and combine results
        const chunkResults = await Promise.all(chunks);
        return chunkResults.flat();
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
        throw error;
    }
}

/**
 * Uniswap V3: Get metrics for Uniswap V3 Factory contract
 * Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984
 *
 * Note: This provides transaction counts and unique wallets.
 * For volume/fees data, use Dune Analytics or parse Swap events from pool contracts.
 */
export async function getUniswapMetrics(
    options?: EthereumAPIOptions
): Promise<Partial<OnChainMetrics>> {
    const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const metrics = await getOnChainMetrics(UNISWAP_V3_FACTORY, options);

    // Use transaction counts as proxy for activity
    // Note: This is approximate - actual volume requires parsing Swap events
    return {
        ...metrics,
        // Estimate monthly active users from unique wallets
        monthlyActiveUsers: metrics.uniqueWallets30d || 0,
    };
}
