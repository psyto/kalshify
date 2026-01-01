/**
 * Dune Analytics API Client
 *
 * NOTE: Dune queries require manual creation on dune.com - cannot be automated.
 * This module is OPTIONAL - the system works perfectly with RPC-derived metrics.
 *
 * Dune is only useful if you want:
 * - More accurate volume/fee calculations
 * - Historical data analysis
 * - Complex aggregations across multiple contracts
 *
 * For most use cases, RPC metrics are sufficient and fully automated.
 */

import { DuneQueryResult, DuneMetrics } from "./types";

const DUNE_API_KEY =
    process.env.DUNE_API_KEY || process.env.NEXT_PUBLIC_DUNE_API_KEY;
const DUNE_API_BASE = "https://api.dune.com/api/v1";

interface DuneAPIOptions {
    apiKey?: string;
}

/**
 * Make authenticated Dune API request
 */
async function duneFetch(
    endpoint: string,
    options?: DuneAPIOptions
): Promise<any> {
    const apiKey = options?.apiKey || DUNE_API_KEY;

    if (!apiKey) {
        throw new Error("Dune API key is required");
    }

    const headers: HeadersInit = {
        "X-Dune-API-Key": apiKey,
        "Content-Type": "application/json",
    };

    const response = await fetch(`${DUNE_API_BASE}${endpoint}`, {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(
            `Dune API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}

/**
 * Execute a Dune query
 */
export async function executeQuery(
    queryId: number,
    parameters?: Record<string, any>
): Promise<string> {
    const body: any = {};

    if (parameters) {
        body.query_parameters = parameters;
    }

    const response = await fetch(`${DUNE_API_BASE}/query/${queryId}/execute`, {
        method: "POST",
        headers: {
            "X-Dune-API-Key": DUNE_API_KEY || "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Dune query execution error: ${response.status}`);
    }

    const data = await response.json();
    return data.execution_id;
}

/**
 * Get query execution status
 */
export async function getExecutionStatus(
    executionId: string
): Promise<DuneQueryResult> {
    const data = await duneFetch(`/execution/${executionId}/status`);
    return data;
}

/**
 * Get query results
 */
export async function getQueryResults(
    executionId: string
): Promise<DuneQueryResult> {
    const data = await duneFetch(`/execution/${executionId}/results`);
    return data;
}

/**
 * Execute query and wait for results with increased timeout and better error handling
 */
export async function executeAndWaitForResults(
    queryId: number,
    parameters?: Record<string, any>,
    maxWaitTime = 180000 // 180 seconds (3 minutes) - increased for complex queries
): Promise<DuneQueryResult> {
    const executionId = await executeQuery(queryId, parameters);

    const startTime = Date.now();
    let checkInterval = 2000; // Start with 2 second intervals

    while (Date.now() - startTime < maxWaitTime) {
        try {
            const status = await getExecutionStatus(executionId);

            if (status.state === "QUERY_STATE_COMPLETED") {
                return getQueryResults(executionId);
            }

            if (status.state === "QUERY_STATE_FAILED") {
                throw new Error(`Query execution failed: ${status.state}`);
            }

            // Exponential backoff: increase check interval for long-running queries
            const elapsed = Date.now() - startTime;
            if (elapsed > 60000) {
                // After 1 minute, check every 5 seconds
                checkInterval = 5000;
            } else if (elapsed > 120000) {
                // After 2 minutes, check every 10 seconds
                checkInterval = 10000;
            }

            await new Promise((resolve) => setTimeout(resolve, checkInterval));
        } catch (error: any) {
            // If we're close to timeout, throw the error
            if (Date.now() - startTime > maxWaitTime - 5000) {
                throw new Error(
                    `Query execution timeout after ${Math.round(
                        (Date.now() - startTime) / 1000
                    )}s: ${error.message}`
                );
            }
            // Otherwise, continue retrying
            await new Promise((resolve) => setTimeout(resolve, checkInterval));
        }
    }

    throw new Error(
        `Query execution timeout after ${Math.round(
            maxWaitTime / 1000
        )}s. Query may be too complex or Dune API may be slow.`
    );
}

/**
 * Get Uniswap V3 metrics from Dune
 *
 * Example query structure for Uniswap V3:
 * - Volume: dex.trades filtered by project = 'uniswap' and version = '3'
 * - Fees: volume * fee_tier
 * - Users: COUNT(DISTINCT trader_a)
 *
 * You'll need to create your own queries on Dune and use their query IDs here
 */

/**
 * Parse Dune results into DuneMetrics
 */
export function parseDuneMetrics(result: DuneQueryResult): DuneMetrics {
    if (!result.rows || result.rows.length === 0) {
        throw new Error("No data returned from Dune query");
    }

    const row = result.rows[0];

    return {
        volume24h: row.volume_24h || 0,
        volume7d: row.volume_7d || 0,
        volume30d: row.volume_30d || 0,
        fees24h: row.fees_24h || 0,
        fees7d: row.fees_7d || 0,
        fees30d: row.fees_30d || 0,
        users24h: row.users_24h || 0,
        users7d: row.users_7d || 0,
        users30d: row.users_30d || 0,
    };
}

/**
 * Get Uniswap metrics
 *
 * NOTE: You need to create a Dune query that returns these metrics and replace
 * the query ID below with your actual query ID from Dune.
 *
 * Example query to create on Dune:
 * ```sql
 * SELECT
 *   SUM(CASE WHEN block_time >= NOW() - INTERVAL '1' DAY THEN amount_usd ELSE 0 END) as volume_24h,
 *   SUM(CASE WHEN block_time >= NOW() - INTERVAL '7' DAY THEN amount_usd ELSE 0 END) as volume_7d,
 *   SUM(CASE WHEN block_time >= NOW() - INTERVAL '30' DAY THEN amount_usd ELSE 0 END) as volume_30d,
 *   COUNT(DISTINCT CASE WHEN block_time >= NOW() - INTERVAL '1' DAY THEN tx_from END) as users_24h,
 *   COUNT(DISTINCT CASE WHEN block_time >= NOW() - INTERVAL '7' DAY THEN tx_from END) as users_7d,
 *   COUNT(DISTINCT CASE WHEN block_time >= NOW() - INTERVAL '30' DAY THEN tx_from END) as users_30d
 * FROM dex.trades
 * WHERE project = 'uniswap' AND version = '3'
 * ```
 */
/**
 * Get Dune metrics for a specific query ID
 *
 * ⚠️ IMPORTANT: Dune queries must be created MANUALLY on dune.com - cannot be automated.
 * This function is OPTIONAL - the system works perfectly without it using RPC metrics.
 *
 * When to use Dune (optional enhancement):
 * - You need very accurate volume/fee calculations
 * - You want historical trend analysis
 * - You need complex multi-contract aggregations
 *
 * When NOT to use Dune (recommended):
 * - You want fully automated setup (just add company to registry)
 * - RPC metrics are sufficient for your use case
 * - You don't want to manually create/maintain queries
 *
 * To use Dune (if you want the enhancement):
 * 1. Manually create a query on Dune Analytics (https://dune.com)
 * 2. Set DUNE_API_KEY in environment variables
 * 3. Add duneQueryId to company metadata in registry
 *
 * Query should return columns:
 * - volume_24h, volume_7d, volume_30d
 * - fees_24h, fees_7d, fees_30d
 * - users_24h, users_7d, users_30d
 */
export async function getDuneMetrics(
    queryId: number,
    parameters?: Record<string, any>
): Promise<DuneMetrics | null> {
    // Check if Dune API key is configured
    const DUNE_API_KEY =
        process.env.DUNE_API_KEY || process.env.NEXT_PUBLIC_DUNE_API_KEY;

    if (!DUNE_API_KEY) {
        console.warn(
            "Dune API key not configured. Skipping Dune metrics. Use RPC-derived metrics instead."
        );
        return null;
    }

    if (!queryId || queryId === 0) {
        console.warn("Dune query ID not provided. Skipping Dune metrics.");
        return null;
    }

    try {
        const result = await executeAndWaitForResults(
            queryId,
            parameters,
            180000
        );
        return parseDuneMetrics(result);
    } catch (error: any) {
        console.warn(
            `Dune query ${queryId} failed, using RPC-derived metrics instead:`,
            error.message
        );
        return null;
    }
}

/**
 * Get Uniswap metrics from Dune Analytics (legacy function for backward compatibility)
 * @deprecated Use getDuneMetrics(queryId) instead
 */
export async function getUniswapMetrics(): Promise<DuneMetrics | null> {
    // Legacy query ID for Uniswap
    return getDuneMetrics(6448170);
}
