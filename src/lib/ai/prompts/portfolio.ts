import { PortfolioRequest, PoolForAI } from "../types";

export function buildPortfolioPrompt(
    pools: PoolForAI[],
    request: PortfolioRequest
): string {
    const targetPoolCount =
        request.diversification === "focused" ? 3 :
        request.diversification === "balanced" ? 4 : 5;

    const riskThreshold =
        request.riskTolerance === "conservative" ? 25 :
        request.riskTolerance === "moderate" ? 40 : 60;

    const maxPerPool =
        request.riskTolerance === "conservative" ? 30 :
        request.riskTolerance === "moderate" ? 35 : 40;

    // Pre-filter pools
    const filteredPools = pools
        .filter(p => {
            if (request.excludeChains?.includes(p.chain)) return false;
            if (request.includeStablecoins === false && p.stablecoin) return false;
            if (p.riskScore > riskThreshold + 15) return false;
            // Must be able to safely allocate at least 10% of total
            if (p.liquidityRisk.maxSafeAllocation < request.totalAllocation * 0.1) return false;
            return true;
        })
        .sort((a, b) => {
            // Sort by risk-adjusted APY
            const aRatio = a.apy / (a.riskScore || 1);
            const bRatio = b.apy / (b.riskScore || 1);
            return bRatio - aRatio;
        })
        .slice(0, 25);

    const poolsText = filteredPools.map(p => {
        const categoryInfo = p.category ? `\n- Category: ${p.category}${p.categoryDescription ? ` (${p.categoryDescription})` : ""}` : "";
        return `
Pool: ${p.id}
- ${p.project} (${p.chain}): ${p.symbol}${categoryInfo}
- APY: ${p.apy.toFixed(2)}% (Base: ${p.apyBase.toFixed(2)}%, Reward: ${p.apyReward.toFixed(2)}%)
- Risk: ${p.riskScore}/100 (${p.riskLevel})
- TVL: $${(p.tvlUsd / 1_000_000).toFixed(1)}M
- Safe Allocation: $${(p.liquidityRisk.maxSafeAllocation / 1_000).toFixed(0)}K
- Stablecoin: ${p.stablecoin ? "Yes" : "No"}
- IL Risk: ${p.ilRisk}
`;
    }).join("\n");

    return `You are a DeFi portfolio manager. Construct an optimal yield allocation.

## Investment Parameters
- Total Capital: $${request.totalAllocation.toLocaleString()}
- Risk Tolerance: ${request.riskTolerance} (target risk score: <${riskThreshold})
- Diversification: ${request.diversification} (${targetPoolCount} pools)
- Max per Pool: ${maxPerPool}%

## Yield Categories
- **lending/lp**: Traditional DeFi lending and liquidity pools
- **restaking**: Liquid restaking (e.g., Fragmetric) - extra yield from securing NCNs, no IL
- **perp_lp**: Perpetual exchange LP (e.g., Jupiter JLP) - earns trading fees, multi-asset

## Risk Tolerance Guidelines
- Conservative: Prioritize stablecoins, established protocols, base APY over rewards. Avoid perp_lp.
- Moderate: Balance stables and volatile assets, accept some reward dependency. Can include restaking.
- Aggressive: Higher APY acceptable, can take IL risk. perp_lp and restaking are good options.

## Position Sizing Rules
1. Never allocate more than 50% of a pool's maxSafeAllocation
2. Never exceed ${maxPerPool}% in a single pool
3. Ensure chain diversification when possible
4. Consider protocol diversification (don't over-concentrate)

## Available Pools (${filteredPools.length} filtered)
${poolsText}

## Task
Select exactly ${targetPoolCount} pools and allocate $${request.totalAllocation.toLocaleString()} across them.
Allocations must sum to 100%.

Consider:
1. Position sizing vs pool liquidity
2. Chain diversification
3. Protocol diversification
4. Risk budget alignment
5. Yield optimization within constraints

Return ONLY valid JSON (no markdown):
{
  "allocations": [
    {
      "poolId": "exact-pool-id-from-above",
      "allocationPercent": 35,
      "rationale": "One sentence explaining why this pool and allocation size."
    }
  ],
  "reasoning": "2-3 sentences explaining the overall portfolio strategy and trade-offs.",
  "riskWarnings": ["Specific warning 1", "Specific warning 2"]
}`;
}
