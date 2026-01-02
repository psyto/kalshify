import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/intelligence/[companyId]
 * Get company Intelligence data with PULSE + TRACE scores
 * Supports both ID and slug lookup
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { companyId: string } }
) {
    try {
        // Try ID first, then slug
        const company = await prisma.company.findFirst({
            where: {
                OR: [{ id: params.companyId }, { slug: params.companyId }],
            },
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                description: true,
                logo: true,
                website: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                walletQualityScore: true,
                trend: true,
                isListed: true,
                intelligenceData: true,
                lastFetchedAt: true,
            },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        // Extract PULSE + TRACE data from intelligenceData JSON
        const intelligenceData = company.intelligenceData as any;

        const response = {
            ...company,
            pulse: intelligenceData?.github
                ? {
                      vitality_score: company.teamHealthScore,
                      developer_activity_score:
                          intelligenceData.github.totalCommits30d || 0,
                      team_retention_score:
                          intelligenceData.github.activeContributors30d || 0,
                      active_contributors:
                          intelligenceData.github.activeContributors30d || 0,
                  }
                : null,
            trace: intelligenceData?.onchain
                ? {
                      growth_score: company.growthScore,
                      verified_roi:
                          intelligenceData.onchain.transactionCount30d || 0,
                      roi_multiplier: 0,
                      quality_score: company.overallScore,
                  }
                : null,
            revenue_verified: 0, // Placeholder - would come from on-chain verification
            fabrknt_score: company.overallScore,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error(
            `GET /api/intelligence/${params.companyId} error:`,
            error
        );
        return NextResponse.json(
            { error: "Failed to fetch company data" },
            { status: 500 }
        );
    }
}
