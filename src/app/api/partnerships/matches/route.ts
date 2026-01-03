import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { matchingEngine } from "@/lib/matching-engine";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { companySlug, companies, limit = 50 } = body;

    if (!companySlug || !companies) {
      return NextResponse.json(
        { error: "Missing required fields: companySlug, companies" },
        { status: 400 }
      );
    }

    // Get matches from AI engine
    const matches = await matchingEngine.findMatches(
      companySlug,
      companies,
      limit
    );

    // Transform matches to include full partner object
    const enrichedMatches = matches.map((match) => {
      const partner = companies.find((c: any) => c.slug === match.partnerSlug);
      return {
        partner,
        matchScore: match.matchScore,
        compatibility: match.compatibility,
        projectedImpact: match.projectedImpact,
        partnershipType: match.partnershipType,
        reasoning: match.reasoning,
      };
    });

    return NextResponse.json({
      matches: enrichedMatches,
      count: enrichedMatches.length,
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
