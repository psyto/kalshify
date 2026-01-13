import { NextResponse } from "next/server";

// Cache for 5 minutes
export const revalidate = 300;

// Types
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
    tokenMint?: string;
    url?: string;
    lastUpdated: string;
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
        decimals: number;
    };
    updatedAt: string;
}

// Fetch Jupiter Perp (JLP) data from DefiLlama
async function fetchJLPData(): Promise<JLPData | null> {
    try {
        // Fetch TVL
        const tvlResponse = await fetch(
            "https://api.llama.fi/protocol/jupiter-perpetual-exchange",
            { next: { revalidate: 300 } }
        );
        if (!tvlResponse.ok) return null;
        const tvlData = await tvlResponse.json();
        const tvl = tvlData.currentChainTvls?.Solana || 0;

        // Fetch fees
        const feesResponse = await fetch(
            "https://api.llama.fi/summary/fees/jupiter-perpetual-exchange",
            { next: { revalidate: 300 } }
        );
        if (!feesResponse.ok) return null;
        const feesData = await feesResponse.json();
        const fees30d = feesData.total30d || 0;

        // Calculate APY: JLP gets 75% of fees, annualized
        const jlpFees30d = fees30d * 0.75;
        const apy = tvl > 0 ? (jlpFees30d * 12 / tvl) * 100 : 0;

        return { tvl, fees30d, apy };
    } catch (error) {
        console.error("Error fetching JLP data:", error);
        return null;
    }
}

// Fetch Fragmetric restaking data
async function fetchFragmetricData(): Promise<FragmetricToken[]> {
    try {
        const response = await fetch(
            "https://api.fragmetric.xyz/v1/public/feeds?types=FRAGMETRIC_RESTAKED_TOKEN",
            { next: { revalidate: 300 } }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return Object.values(data) as FragmetricToken[];
    } catch (error) {
        console.error("Error fetching Fragmetric data:", error);
        return [];
    }
}

// Calculate risk level based on TVL and protocol maturity
function calculateRiskLevel(tvlUsd: number, category: string): "low" | "medium" | "high" {
    // JLP and established restaking with high TVL are medium risk
    if (category === "perp_lp") {
        return tvlUsd > 500_000_000 ? "medium" : "high";
    }
    // Restaking is newer, so slightly higher risk
    if (category === "restaking") {
        if (tvlUsd > 20_000_000) return "medium";
        return "high";
    }
    return "medium";
}

export async function GET() {
    try {
        const yields: AlternativeYield[] = [];

        // Fetch JLP data
        const jlpData = await fetchJLPData();
        if (jlpData && jlpData.tvl > 0) {
            yields.push({
                id: "jlp-native",
                name: "Jupiter Perps LP",
                symbol: "JLP",
                category: "perp_lp",
                protocol: "Jupiter",
                chain: "Solana",
                tvlUsd: jlpData.tvl,
                apy: Math.round(jlpData.apy * 100) / 100,
                apyBreakdown: {
                    fees: Math.round(jlpData.apy * 100) / 100,
                },
                riskLevel: calculateRiskLevel(jlpData.tvl, "perp_lp"),
                description: "Earn 75% of Jupiter Perps trading fees. Exposure to SOL, ETH, BTC, USDC, USDT.",
                tokenMint: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
                url: "https://jup.ag/perps/jlp-earn",
                lastUpdated: new Date().toISOString(),
            });
        }

        // Fetch Fragmetric data
        const fragmetricTokens = await fetchFragmetricData();
        for (const token of fragmetricTokens) {
            // Skip tokens with very low TVL
            if (token.data.tvlAsUSD < 50000) continue;

            // Map symbol to readable name
            const symbolMap: Record<string, { name: string; description: string }> = {
                fragSOL: {
                    name: "Fragmetric Restaked SOL",
                    description: "Liquid restaking for SOL. Earn staking + MEV + NCN rewards.",
                },
                fragJTO: {
                    name: "Fragmetric Restaked JTO",
                    description: "Stake JTO to secure TipRouter NCN. Earn MEV rewards.",
                },
                fragBTC: {
                    name: "Fragmetric Restaked BTC",
                    description: "Restaked BTC on Solana with yield.",
                },
                fragSWTCH: {
                    name: "Fragmetric Restaked SWTCH",
                    description: "Restaked Switchboard tokens.",
                },
                FRAG2: {
                    name: "Fragmetric Squared",
                    description: "Meta restaking token.",
                },
            };

            const info = symbolMap[token.symbol] || {
                name: token.displayName,
                description: `Fragmetric restaking token: ${token.symbol}`,
            };

            yields.push({
                id: `fragmetric-${token.symbol.toLowerCase()}`,
                name: info.name,
                symbol: token.symbol,
                category: "restaking",
                protocol: "Fragmetric",
                chain: "Solana",
                tvlUsd: token.data.tvlAsUSD,
                apy: Math.round(token.data.apy * 10000) / 100, // Convert to percentage
                apyBreakdown: {
                    base: Math.round(token.data.apy * 7000) / 100, // Estimate ~70% from staking
                    mev: Math.round(token.data.apy * 2000) / 100, // ~20% from MEV
                    ncn: Math.round(token.data.apy * 1000) / 100, // ~10% from NCN
                },
                riskLevel: calculateRiskLevel(token.data.tvlAsUSD, "restaking"),
                description: info.description,
                tokenMint: token.data.mintAddress,
                url: "https://fragmetric.xyz",
                lastUpdated: token.updatedAt,
            });
        }

        // Sort by TVL
        yields.sort((a, b) => b.tvlUsd - a.tvlUsd);

        // Calculate totals
        const totalTvl = yields.reduce((sum, y) => sum + y.tvlUsd, 0);
        const categories = [...new Set(yields.map(y => y.category))];

        return NextResponse.json({
            yields,
            metadata: {
                totalYields: yields.length,
                totalTvl,
                categories,
                fetchedAt: new Date().toISOString(),
                sources: ["DefiLlama (JLP)", "Fragmetric API"],
            },
        });
    } catch (error) {
        console.error("Error fetching alternative yields:", error);
        return NextResponse.json(
            {
                yields: [],
                metadata: {
                    totalYields: 0,
                    totalTvl: 0,
                    error: "Failed to fetch alternative yields",
                },
            },
            { status: 500 }
        );
    }
}
