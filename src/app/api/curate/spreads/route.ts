import { NextRequest, NextResponse } from "next/server";
import { fetchAndDetectSpreads } from "@/lib/curate/yield-spreads";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minute cache

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const chain = searchParams.get("chain") || undefined;
        const minSpread = searchParams.get("minSpread")
            ? parseFloat(searchParams.get("minSpread")!)
            : undefined;
        const asset = searchParams.get("asset") || undefined;
        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit")!)
            : undefined;

        const result = await fetchAndDetectSpreads({
            chain,
            minSpread,
            asset,
            limit,
        });

        return NextResponse.json({
            ...result,
            filters: {
                chain: chain || "all",
                minSpread: minSpread || 1.0,
                asset: asset || "all",
            },
        });
    } catch (error) {
        console.error("Failed to detect yield spreads:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to detect spreads",
                spreads: [],
                topOpportunities: [],
                metadata: {
                    assetsAnalyzed: 0,
                    poolsCompared: 0,
                    spreadsFound: 0,
                    generatedAt: new Date().toISOString(),
                },
            },
            { status: 500 }
        );
    }
}
