import { PoolForAI } from "@/lib/ai/types";

// DeFiLlama API endpoints
const DEFILLAMA_YIELDS_API = "https://yields.llama.fi/pools";

// Known stablecoins
const STABLECOINS = new Set([
    "USDC", "USDT", "DAI", "FRAX", "LUSD", "GUSD", "BUSD", "TUSD", "USDP",
    "USDD", "PYUSD", "GHO", "crvUSD", "DOLA", "MIM", "UST", "SUSD", "RAI",
    "USDS", "SUSDS", "USD0", "EURC", "EURT", "EURS"
]);

// Blue chip assets
const BLUE_CHIP_ASSETS = new Set([
    "ETH", "WETH", "STETH", "WSTETH", "RETH", "CBETH", "WEETH",
    "BTC", "WBTC", "CBBTC", "TBTC",
    "SOL", "WSOL", "MSOL", "JITOSOL", "BSOL",
    ...STABLECOINS
]);

// Established protocols
const ESTABLISHED_PROTOCOLS = new Set([
    "aave-v3", "aave", "compound-v3", "compound", "maker", "lido", "rocket-pool",
    "uniswap-v3", "uniswap", "curve-dex", "convex-finance", "yearn-finance",
    "balancer", "frax", "instadapp", "morpho", "spark", "sky-lending",
    "jito-liquid-staking", "marinade-finance", "raydium", "orca", "jupiter"
]);

interface YieldPool {
    pool: string;
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase?: number;
    apyReward?: number;
    rewardTokens?: string[];
    underlyingTokens?: string[];
    poolMeta?: string;
    ilRisk?: string;
    exposure?: string;
    stablecoin?: boolean;
}

interface RiskBreakdown {
    tvlScore: number;
    apyScore: number;
    stableScore: number;
    ilScore: number;
    protocolScore: number;
}

interface LiquidityRisk {
    score: number;
    poolTvl: number;
    maxSafeAllocation: number;
    safeAllocationPercent: number;
    slippageEstimates: {
        at100k: number;
        at500k: number;
        at1m: number;
        at5m: number;
        at10m: number;
    };
    exitabilityRating: "excellent" | "good" | "moderate" | "poor" | "very_poor";
}

function parseUnderlyingAssets(symbol: string): string[] {
    const cleaned = symbol
        .replace(/[\(\)]/g, "")
        .replace(/-\d+(\.\d+)?%/g, "")
        .replace(/\s+/g, "");

    const parts = cleaned.split(/[-\/]/).filter(Boolean);

    return parts.map(asset => {
        const upper = asset.toUpperCase();
        if (["WETH", "STETH", "WSTETH", "CBETH", "WEETH"].includes(upper)) return "ETH";
        if (["WBTC", "CBBTC", "TBTC"].includes(upper)) return "BTC";
        if (["WSOL", "MSOL", "JITOSOL", "BSOL"].includes(upper)) return "SOL";
        return upper;
    }).filter((v, i, a) => a.indexOf(v) === i);
}

function calculateLiquidityRisk(tvlUsd: number, projectSlug: string): LiquidityRisk {
    const isLendingProtocol = [
        "aave", "aave-v3", "compound", "compound-v3", "morpho", "spark",
        "maker", "sky-lending", "maple", "euler", "radiant", "benqi", "venus"
    ].some(p => projectSlug.includes(p));

    const isLiquidStaking = [
        "lido", "rocket-pool", "jito", "marinade", "ether.fi", "frax-ether"
    ].some(p => projectSlug.includes(p));

    const slippageFactor = isLiquidStaking ? 0.3 : isLendingProtocol ? 0.5 : 1.0;

    let safeAllocationPercent: number;
    if (tvlUsd >= 1_000_000_000) safeAllocationPercent = 5;
    else if (tvlUsd >= 100_000_000) safeAllocationPercent = 3;
    else if (tvlUsd >= 10_000_000) safeAllocationPercent = 2;
    else safeAllocationPercent = 1;

    if (isLendingProtocol) safeAllocationPercent *= 2;

    const maxSafeAllocation = tvlUsd * (safeAllocationPercent / 100);

    const calculateSlippage = (positionSize: number): number => {
        if (tvlUsd === 0) return 100;
        const ratio = positionSize / tvlUsd;
        const slippage = ratio * 100 * slippageFactor * (1 + ratio * 2);
        return Math.min(Math.round(slippage * 100) / 100, 100);
    };

    const slippageEstimates = {
        at100k: calculateSlippage(100_000),
        at500k: calculateSlippage(500_000),
        at1m: calculateSlippage(1_000_000),
        at5m: calculateSlippage(5_000_000),
        at10m: calculateSlippage(10_000_000),
    };

    let score: number;
    if (tvlUsd >= 1_000_000_000) score = 5;
    else if (tvlUsd >= 500_000_000) score = 10;
    else if (tvlUsd >= 100_000_000) score = 20;
    else if (tvlUsd >= 50_000_000) score = 30;
    else if (tvlUsd >= 10_000_000) score = 45;
    else if (tvlUsd >= 5_000_000) score = 60;
    else if (tvlUsd >= 1_000_000) score = 75;
    else score = 90;

    if (isLendingProtocol) score = Math.max(0, score - 10);
    if (isLiquidStaking) score = Math.max(0, score - 15);
    if (slippageEstimates.at1m > 5) score = Math.min(100, score + 10);
    else if (slippageEstimates.at1m < 0.5) score = Math.max(0, score - 10);

    let exitabilityRating: LiquidityRisk["exitabilityRating"];
    if (score <= 15) exitabilityRating = "excellent";
    else if (score <= 30) exitabilityRating = "good";
    else if (score <= 50) exitabilityRating = "moderate";
    else if (score <= 70) exitabilityRating = "poor";
    else exitabilityRating = "very_poor";

    return {
        score,
        poolTvl: tvlUsd,
        maxSafeAllocation,
        safeAllocationPercent,
        slippageEstimates,
        exitabilityRating,
    };
}

function calculateRiskScore(
    pool: YieldPool,
    projectSlug: string,
    underlyingAssets: string[]
): { score: number; level: "low" | "medium" | "high" | "very_high"; breakdown: RiskBreakdown } {
    const breakdown: RiskBreakdown = {
        tvlScore: 0,
        apyScore: 0,
        stableScore: 0,
        ilScore: 0,
        protocolScore: 0,
    };

    // TVL Score (0-30)
    if (pool.tvlUsd >= 1_000_000_000) breakdown.tvlScore = 0;
    else if (pool.tvlUsd >= 100_000_000) breakdown.tvlScore = 10;
    else if (pool.tvlUsd >= 10_000_000) breakdown.tvlScore = 20;
    else breakdown.tvlScore = 30;

    // APY Score (0-25)
    const rewardRatio = pool.apyReward ? (pool.apyReward / (pool.apy || 1)) : 0;
    if (pool.apy > 50) breakdown.apyScore = 25;
    else if (pool.apy > 20) breakdown.apyScore = 15;
    else if (pool.apy > 10) breakdown.apyScore = 10;
    else breakdown.apyScore = 0;
    if (rewardRatio > 0.7) breakdown.apyScore += 5;

    // Stablecoin Score (0-20)
    const allStable = underlyingAssets.every(a => STABLECOINS.has(a));
    const hasStable = underlyingAssets.some(a => STABLECOINS.has(a));
    const allBlueChip = underlyingAssets.every(a => BLUE_CHIP_ASSETS.has(a));

    if (pool.stablecoin || allStable) breakdown.stableScore = 0;
    else if (hasStable && allBlueChip) breakdown.stableScore = 5;
    else if (allBlueChip) breakdown.stableScore = 10;
    else breakdown.stableScore = 20;

    // IL Score (0-15)
    if (pool.ilRisk === "no") breakdown.ilScore = 0;
    else if (pool.ilRisk === "yes" && underlyingAssets.length <= 1) breakdown.ilScore = 0;
    else if (pool.exposure === "single") breakdown.ilScore = 0;
    else if (underlyingAssets.length === 2) {
        const [a, b] = underlyingAssets;
        const correlated = (a === b) || (STABLECOINS.has(a) && STABLECOINS.has(b));
        breakdown.ilScore = correlated ? 5 : 15;
    } else {
        breakdown.ilScore = 15;
    }

    // Protocol Score (0-10)
    if (ESTABLISHED_PROTOCOLS.has(projectSlug)) breakdown.protocolScore = 0;
    else if (pool.tvlUsd > 100_000_000) breakdown.protocolScore = 3;
    else breakdown.protocolScore = 10;

    const totalScore = breakdown.tvlScore + breakdown.apyScore + breakdown.stableScore +
                       breakdown.ilScore + breakdown.protocolScore;

    let level: "low" | "medium" | "high" | "very_high";
    if (totalScore <= 20) level = "low";
    else if (totalScore <= 40) level = "medium";
    else if (totalScore <= 60) level = "high";
    else level = "very_high";

    return { score: totalScore, level, breakdown };
}

/**
 * Fetch and process pools directly from DeFiLlama API.
 * This avoids self-referencing HTTP requests in serverless environments.
 */
export async function fetchPoolsForAI(options?: {
    limit?: number;
    minTvl?: number;
}): Promise<PoolForAI[]> {
    const limit = options?.limit ?? 150;
    const minTvl = options?.minTvl ?? 1_000_000;

    const response = await fetch(DEFILLAMA_YIELDS_API, {
        next: { revalidate: 300 }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch yields from DeFiLlama: ${response.statusText}`);
    }

    const data = await response.json();
    const pools: YieldPool[] = data.data || [];

    // Process and filter pools
    const processed: PoolForAI[] = [];

    for (const pool of pools) {
        // Skip invalid pools
        if (pool.tvlUsd < minTvl || pool.apy <= 0 || pool.apy > 10000) continue;

        const projectSlug = pool.project.toLowerCase().replace(/\s+/g, "-");
        const underlyingAssets = parseUnderlyingAssets(pool.symbol);
        const { score, level, breakdown } = calculateRiskScore(pool, projectSlug, underlyingAssets);
        const liquidityRisk = calculateLiquidityRisk(pool.tvlUsd, projectSlug);

        processed.push({
            id: pool.pool,
            chain: pool.chain,
            project: pool.project,
            symbol: pool.symbol,
            tvlUsd: pool.tvlUsd,
            apy: pool.apy,
            apyBase: pool.apyBase || 0,
            apyReward: pool.apyReward || 0,
            stablecoin: pool.stablecoin || false,
            ilRisk: pool.ilRisk || "unknown",
            riskScore: score,
            riskLevel: level,
            riskBreakdown: breakdown,
            liquidityRisk: {
                score: liquidityRisk.score,
                maxSafeAllocation: liquidityRisk.maxSafeAllocation,
                exitabilityRating: liquidityRisk.exitabilityRating,
                slippageEstimates: {
                    at100k: liquidityRisk.slippageEstimates.at100k,
                    at500k: liquidityRisk.slippageEstimates.at500k,
                    at1m: liquidityRisk.slippageEstimates.at1m,
                },
            },
            underlyingAssets,
        });
    }

    // Sort by TVL and limit
    return processed
        .sort((a, b) => b.tvlUsd - a.tvlUsd)
        .slice(0, limit);
}

// Types for alternative yields
interface AlternativeYield {
    id: string;
    name: string;
    symbol: string;
    category: "restaking" | "perp_lp" | "rwa";
    protocol: string;
    chain: string;
    tvlUsd: number;
    apy: number;
    apyBreakdown?: {
        base?: number;
        mev?: number;
        ncn?: number;
        fees?: number;
    };
    riskLevel: "low" | "medium" | "high";
    description: string;
}

interface JLPData {
    tvl: number;
    fees30d: number;
    apy: number;
}

interface FragmetricToken {
    address: string;
    symbol: string;
    displayName: string;
    data: {
        apy: number;
        tvlAsUSD: number;
        mintAddress: string;
    };
    updatedAt: string;
}

async function fetchJLPData(): Promise<JLPData | null> {
    try {
        const tvlResponse = await fetch(
            "https://api.llama.fi/protocol/jupiter-perpetual-exchange",
            { next: { revalidate: 300 } }
        );
        if (!tvlResponse.ok) return null;
        const tvlData = await tvlResponse.json();
        const tvl = tvlData.currentChainTvls?.Solana || 0;

        const feesResponse = await fetch(
            "https://api.llama.fi/summary/fees/jupiter-perpetual-exchange",
            { next: { revalidate: 300 } }
        );
        if (!feesResponse.ok) return null;
        const feesData = await feesResponse.json();
        const fees30d = feesData.total30d || 0;

        const jlpFees30d = fees30d * 0.75;
        const apy = tvl > 0 ? (jlpFees30d * 12 / tvl) * 100 : 0;

        return { tvl, fees30d, apy };
    } catch {
        return null;
    }
}

async function fetchFragmetricData(): Promise<FragmetricToken[]> {
    try {
        const response = await fetch(
            "https://api.fragmetric.xyz/v1/public/feeds?types=FRAGMETRIC_RESTAKED_TOKEN",
            { next: { revalidate: 300 } }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return Object.values(data) as FragmetricToken[];
    } catch {
        return [];
    }
}

/**
 * Fetch alternative yields (restaking, perp LP) and convert to PoolForAI format
 */
export async function fetchAlternativeYieldsForAI(): Promise<PoolForAI[]> {
    const pools: PoolForAI[] = [];

    // Fetch JLP data
    const jlpData = await fetchJLPData();
    if (jlpData && jlpData.tvl > 0 && jlpData.apy > 0) {
        const riskLevel = jlpData.tvl > 500_000_000 ? "medium" : "high";
        const riskScore = riskLevel === "medium" ? 35 : 50;

        pools.push({
            id: "jlp-native",
            chain: "Solana",
            project: "Jupiter",
            symbol: "JLP",
            tvlUsd: jlpData.tvl,
            apy: Math.round(jlpData.apy * 100) / 100,
            apyBase: Math.round(jlpData.apy * 100) / 100,
            apyReward: 0,
            stablecoin: false,
            ilRisk: "yes", // Exposure to multiple assets
            riskScore,
            riskLevel,
            category: "perp_lp",
            categoryDescription: "Perpetual exchange LP - earns 75% of trading fees with exposure to SOL, ETH, BTC, stablecoins",
            riskBreakdown: {
                tvlScore: 5, // Very high TVL
                apyScore: 15, // High APY from fees
                stableScore: 10, // Multi-asset exposure
                ilScore: 5, // Some IL risk from rebalancing
                protocolScore: 0, // Established protocol
            },
            liquidityRisk: {
                score: 15,
                maxSafeAllocation: jlpData.tvl * 0.02,
                exitabilityRating: "good",
                slippageEstimates: {
                    at100k: 0.1,
                    at500k: 0.3,
                    at1m: 0.5,
                },
            },
            underlyingAssets: ["SOL", "ETH", "BTC", "USDC", "USDT"],
        });
    }

    // Fetch Fragmetric data
    const fragmetricTokens = await fetchFragmetricData();
    for (const token of fragmetricTokens) {
        if (token.data.tvlAsUSD < 100000) continue; // Skip very small pools
        const apy = Math.round(token.data.apy * 10000) / 100;
        if (apy <= 0) continue; // Skip zero APY

        const riskLevel = token.data.tvlAsUSD > 20_000_000 ? "medium" : "high";
        const riskScore = riskLevel === "medium" ? 38 : 55;

        // Determine underlying asset
        const symbolMap: Record<string, { name: string; underlying: string; description: string }> = {
            fragSOL: {
                name: "Fragmetric Restaked SOL",
                underlying: "SOL",
                description: "Liquid restaking for SOL - earns staking + MEV + NCN rewards",
            },
            fragJTO: {
                name: "Fragmetric Restaked JTO",
                underlying: "JTO",
                description: "Stake JTO to secure TipRouter NCN - earns MEV rewards",
            },
            fragBTC: {
                name: "Fragmetric Restaked BTC",
                underlying: "BTC",
                description: "Restaked BTC on Solana with additional yield",
            },
        };

        const info = symbolMap[token.symbol] || {
            name: token.displayName,
            underlying: token.symbol.replace("frag", ""),
            description: `Fragmetric restaking token: ${token.symbol}`,
        };

        pools.push({
            id: `fragmetric-${token.symbol.toLowerCase()}`,
            chain: "Solana",
            project: "Fragmetric",
            symbol: token.symbol,
            tvlUsd: token.data.tvlAsUSD,
            apy,
            apyBase: apy * 0.7, // ~70% from staking
            apyReward: apy * 0.3, // ~30% from MEV/NCN
            stablecoin: false,
            ilRisk: "no", // Liquid staking, no IL
            riskScore,
            riskLevel,
            category: "restaking",
            categoryDescription: info.description,
            riskBreakdown: {
                tvlScore: token.data.tvlAsUSD > 20_000_000 ? 15 : 25,
                apyScore: 10,
                stableScore: 10,
                ilScore: 0, // No IL for liquid staking
                protocolScore: 8, // Newer protocol
            },
            liquidityRisk: {
                score: 40,
                maxSafeAllocation: token.data.tvlAsUSD * 0.02,
                exitabilityRating: "moderate",
                slippageEstimates: {
                    at100k: 0.5,
                    at500k: 1.5,
                    at1m: 3.0,
                },
            },
            underlyingAssets: [info.underlying],
        });
    }

    return pools;
}

/**
 * Fetch all pools including alternative yields for AI recommendations
 */
export async function fetchAllPoolsForAI(options?: {
    limit?: number;
    minTvl?: number;
    includeAlternativeYields?: boolean;
}): Promise<PoolForAI[]> {
    const limit = options?.limit ?? 150;
    const includeAltYields = options?.includeAlternativeYields ?? true;

    // Fetch main pools
    const mainPools = await fetchPoolsForAI({ limit: limit - 10, minTvl: options?.minTvl });

    if (!includeAltYields) {
        return mainPools;
    }

    // Fetch alternative yields
    const altYields = await fetchAlternativeYieldsForAI();

    // Merge and sort by TVL
    const allPools = [...mainPools, ...altYields];
    return allPools.sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, limit);
}
