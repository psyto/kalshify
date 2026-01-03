/**
 * DefiLlama API Client
 * Fetches DeFi protocol metrics: TVL, volume, fees
 *
 * API is FREE and requires no authentication
 * Docs: https://defillama.com/docs/api
 */

export interface DefiLlamaProtocol {
    name: string;
    symbol?: string;
    tvl: number;
    chainTvls?: Record<string, number>;
    change_1h?: number;
    change_1d?: number;
    change_7d?: number;
    mcap?: number;
}

export interface DefiLlamaProtocolDetails extends DefiLlamaProtocol {
    category?: string;
    chains?: string[];
    currentChainTvls?: Record<string, number>;
    historicalTvl?: Array<{
        date: number;
        totalLiquidityUSD: number;
    }>;
    tokensInUsd?: Array<{
        date: number;
        tokens: Record<string, number>;
    }>;
}

/**
 * Get protocol TVL and basic metrics
 * @param protocol Protocol slug (e.g., "uniswap", "aave", "compound")
 */
export async function getProtocolTVL(
    protocol: string
): Promise<DefiLlamaProtocolDetails | null> {
    try {
        const response = await fetch(
            `https://api.llama.fi/protocol/${protocol}`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Protocol "${protocol}" not found on DefiLlama`);
                return null;
            }
            throw new Error(
                `DefiLlama API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // Calculate total TVL from currentChainTvls (sum of all chains)
        let totalTvl = 0;
        if (data.currentChainTvls) {
            totalTvl = Object.values(data.currentChainTvls).reduce(
                (sum: number, chainTvl: any) => sum + (chainTvl || 0),
                0
            );
        }

        return {
            ...data,
            tvl: totalTvl, // Add computed total TVL
        };
    } catch (error) {
        console.error(`Error fetching DefiLlama data for ${protocol}:`, error);
        return null;
    }
}

/**
 * Get historical TVL for a protocol
 * @param protocol Protocol slug
 * @returns Array of TVL snapshots with dates
 */
export async function getHistoricalTVL(
    protocol: string
): Promise<Array<{ date: number; tvl: number }> | null> {
    try {
        const data = await getProtocolTVL(protocol);
        if (!data || !data.historicalTvl) return null;

        return data.historicalTvl.map((snapshot) => ({
            date: snapshot.date,
            tvl: snapshot.totalLiquidityUSD,
        }));
    } catch (error) {
        console.error(
            `Error fetching historical TVL for ${protocol}:`,
            error
        );
        return null;
    }
}

/**
 * Get current TVL across all protocols (summary)
 * Useful for comparing protocol sizes
 */
export async function getAllProtocolsTVL(): Promise<DefiLlamaProtocol[]> {
    try {
        const response = await fetch("https://api.llama.fi/protocols", {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(
                `DefiLlama API error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching all protocols TVL:", error);
        return [];
    }
}

/**
 * Estimate daily active users from TVL and category
 * Uses tiered multipliers - larger protocols have broader adoption
 */
export function estimateDailyUsers(tvl: number, category: string): number {
    // Base ratios per category
    const baseRatios: Record<string, number> = {
        dex: 0.00001, // DEXes: ~1 user per $100k TVL (baseline)
        lending: 0.000005, // Lending: ~1 user per $200k TVL
        derivatives: 0.000002, // Derivatives: ~1 user per $500k TVL
        default: 0.00001,
    };

    const baseRatio = baseRatios[category] || baseRatios.default;

    // Apply tiered multipliers for large protocols
    // Large protocols have network effects and broader adoption
    let multiplier = 1;
    if (tvl >= 5_000_000_000) {
        // $5B+: Top-tier protocols (Uniswap, Aave, etc.)
        multiplier = 5; // 5x more users per dollar (proven mass adoption)
    } else if (tvl >= 1_000_000_000) {
        // $1B-$5B: Major protocols
        multiplier = 3; // 3x more users per dollar
    } else if (tvl >= 100_000_000) {
        // $100M-$1B: Established protocols
        multiplier = 1.5; // 1.5x more users per dollar
    }

    return Math.floor(tvl * baseRatio * multiplier);
}

/**
 * Estimate monthly transactions from daily users
 * Assumes users make multiple transactions per month
 */
export function estimateMonthlyTransactions(
    dailyUsers: number,
    category: string
): number {
    // Different protocol types have different transaction frequencies
    const txPerUserPerMonth: Record<string, number> = {
        dex: 20, // DEX users trade ~20x per month
        lending: 8, // Lending users transact ~8x per month (deposit/withdraw/borrow/repay)
        derivatives: 30, // Derivatives traders are more active
        default: 15,
    };

    const frequency =
        txPerUserPerMonth[category] || txPerUserPerMonth.default;
    return Math.floor(dailyUsers * frequency * 30); // 30 days
}

/**
 * Get comprehensive metrics for a DeFi protocol
 * Combines TVL with estimated user/transaction metrics
 */
export async function getProtocolMetrics(protocol: string, category: string = "dex"): Promise<{
    tvl: number;
    estimatedDailyUsers: number;
    estimatedMonthlyUsers: number;
    estimatedMonthlyTransactions: number;
    chains: string[];
} | null> {
    const data = await getProtocolTVL(protocol);
    if (!data || !data.tvl) return null;

    const dailyUsers = estimateDailyUsers(data.tvl, category);
    const monthlyUsers = Math.floor(dailyUsers * 20); // Assume 20x monthly vs daily
    const monthlyTx = estimateMonthlyTransactions(dailyUsers, category);

    return {
        tvl: data.tvl,
        estimatedDailyUsers: dailyUsers,
        estimatedMonthlyUsers: monthlyUsers,
        estimatedMonthlyTransactions: monthlyTx,
        chains: data.chains || [],
    };
}
