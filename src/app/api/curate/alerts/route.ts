import { NextRequest, NextResponse } from "next/server";
import { analyzeForRebalance, getAllCurrentPoolData } from "@/lib/curate/rebalance-detector";
import { generateRecommendation } from "@/lib/curate/recommendation-engine";
import { RiskTolerance } from "@/components/curate/quick-start";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const riskTolerance = (searchParams.get("riskTolerance") || "balanced") as RiskTolerance;
        const amount = parseFloat(searchParams.get("amount") || "10000");

        // Generate recommendation for this risk profile
        const recommendation = generateRecommendation(amount, riskTolerance);

        // Analyze for rebalance alerts
        const analysis = analyzeForRebalance(recommendation, riskTolerance);

        return NextResponse.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch alerts" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { allocations, riskTolerance } = body;

        if (!allocations || !riskTolerance) {
            return NextResponse.json(
                { success: false, error: "Missing allocations or riskTolerance" },
                { status: 400 }
            );
        }

        // Use provided allocations directly
        const recommendation = {
            allocations,
            summary: {
                totalAmount: 0,
                expectedApy: 0,
                expectedYield: 0,
                overallRisk: "medium" as const,
                diversificationScore: 0,
            },
            insights: [],
            warnings: [],
        };

        const analysis = analyzeForRebalance(recommendation, riskTolerance);

        return NextResponse.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error("Error analyzing allocations:", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze allocations" },
            { status: 500 }
        );
    }
}

// Get current pool data for display
export async function PUT() {
    try {
        const poolData = getAllCurrentPoolData();
        return NextResponse.json({
            success: true,
            data: poolData,
        });
    } catch (error) {
        console.error("Error fetching pool data:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch pool data" },
            { status: 500 }
        );
    }
}
