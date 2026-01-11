import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getYieldAdvisor } from "@/lib/ai/yield-advisor";
import { PortfolioRequest } from "@/lib/ai/types";
import { fetchPoolsForAI } from "@/lib/curate/fetch-pools";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const advisor = getYieldAdvisor();

        if (!advisor.isAvailable()) {
            return NextResponse.json(
                { error: "AI service unavailable", code: "AI_UNAVAILABLE" },
                { status: 503 }
            );
        }

        const body = await request.json();

        // Validate request
        if (!body.totalAllocation || body.totalAllocation <= 0) {
            return NextResponse.json(
                { error: "Invalid total allocation amount" },
                { status: 400 }
            );
        }

        const portfolioRequest: PortfolioRequest = {
            totalAllocation: body.totalAllocation,
            riskTolerance: body.riskTolerance || "moderate",
            diversification: body.diversification || "balanced",
            excludeChains: body.excludeChains || [],
            includeStablecoins: body.includeStablecoins,
        };

        // Validate enum values
        if (!["conservative", "moderate", "aggressive"].includes(portfolioRequest.riskTolerance)) {
            return NextResponse.json(
                { error: "Invalid risk tolerance" },
                { status: 400 }
            );
        }

        if (!["focused", "balanced", "diversified"].includes(portfolioRequest.diversification)) {
            return NextResponse.json(
                { error: "Invalid diversification level" },
                { status: 400 }
            );
        }

        // Fetch pools directly from DeFiLlama (avoids self-referencing HTTP in serverless)
        const pools = await fetchPoolsForAI({ limit: 150, minTvl: 1_000_000 });

        // Get portfolio optimization from AI
        const result = await advisor.optimizePortfolio(pools, portfolioRequest);

        // Enrich allocations with full pool data and calculate metrics
        const enrichedAllocations = result.allocations.map(alloc => {
            const pool = pools.find(p => p.id === alloc.poolId);
            if (!pool) return null;

            const allocationUsd = (alloc.allocationPercent / 100) * portfolioRequest.totalAllocation;
            const expectedAnnualYield = allocationUsd * (pool.apy / 100);

            return {
                pool,
                allocationPercent: alloc.allocationPercent,
                allocationUsd,
                expectedAnnualYield,
                rationale: alloc.rationale,
            };
        }).filter(a => a !== null);

        // Calculate summary metrics
        const totalAllocatedPercent = enrichedAllocations.reduce((sum, a) => sum + a.allocationPercent, 0);
        const totalExpectedYield = enrichedAllocations.reduce((sum, a) => sum + a.expectedAnnualYield, 0);
        const weightedApy = (totalExpectedYield / portfolioRequest.totalAllocation) * 100;
        const weightedRiskScore = enrichedAllocations.reduce(
            (sum, a) => sum + (a.pool.riskScore * a.allocationPercent / 100),
            0
        );

        // Calculate diversification score (chains and protocols)
        const uniqueChains = new Set(enrichedAllocations.map(a => a.pool.chain));
        const uniqueProtocols = new Set(enrichedAllocations.map(a => a.pool.project));
        const diversificationScore = Math.min(100,
            (uniqueChains.size * 15) + (uniqueProtocols.size * 15) + 40
        );

        return NextResponse.json({
            allocations: enrichedAllocations,
            summary: {
                totalAllocation: portfolioRequest.totalAllocation,
                totalAllocatedPercent,
                expectedAnnualYield: totalExpectedYield,
                weightedApy,
                combinedRiskScore: Math.round(weightedRiskScore),
                diversificationScore,
                poolCount: enrichedAllocations.length,
            },
            reasoning: result.reasoning,
            riskWarnings: result.riskWarnings,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to optimize portfolio:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to optimize portfolio",
                code: "GENERATION_FAILED",
            },
            { status: 500 }
        );
    }
}
