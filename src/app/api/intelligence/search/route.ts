import { NextRequest, NextResponse } from "next/server";
import { searchCompanies } from "@/lib/intelligence/company-queries";

/**
 * GET /api/intelligence/search?q=query
 * Search companies in Intelligence database
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const category = searchParams.get("category") || undefined;
        const limit = parseInt(searchParams.get("limit") || "100");

        // Use shared search function
        const companies = await searchCompanies(
            query || undefined,
            category,
            limit
        );

        return NextResponse.json(companies);
    } catch (error) {
        console.error("GET /api/intelligence/search error:", error);
        return NextResponse.json(
            { error: "Failed to search companies" },
            { status: 500 }
        );
    }
}
