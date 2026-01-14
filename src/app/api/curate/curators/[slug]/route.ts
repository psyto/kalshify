import { NextResponse } from "next/server";
import { getCuratorWithStrategies } from "@/lib/curate/curator-strategies";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minute cache

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const data = getCuratorWithStrategies(slug);

        if (!data) {
            return NextResponse.json(
                { error: "Curator not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            profile: data.profile,
            strategies: data.strategies,
            insight: data.insight,
            lastUpdated: data.lastUpdated,
        });
    } catch (error) {
        console.error("Failed to fetch curator:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to fetch curator",
            },
            { status: 500 }
        );
    }
}
