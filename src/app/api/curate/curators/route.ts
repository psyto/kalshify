import { NextResponse } from "next/server";
import { getAllCurators } from "@/lib/curate/curators";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour cache

export async function GET() {
    try {
        const curators = getAllCurators();

        return NextResponse.json({
            curators: curators.map(curator => ({
                id: curator.id,
                name: curator.name,
                slug: curator.slug,
                description: curator.description,
                website: curator.website,
                twitter: curator.twitter,
                trustScore: curator.trustScore,
                aum: curator.aum,
                trackRecord: curator.trackRecord,
                platformCount: curator.platforms.length,
                platforms: curator.platforms.map(p => ({
                    protocol: p.protocol,
                    chain: p.chain,
                    role: p.role,
                })),
            })),
            metadata: {
                count: curators.length,
                generatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Failed to fetch curators:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to fetch curators",
                curators: [],
            },
            { status: 500 }
        );
    }
}
