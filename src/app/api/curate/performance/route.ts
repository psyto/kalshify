import { NextRequest, NextResponse } from "next/server";
import {
    getPerformanceSummaries,
    getPerformanceSummary,
    getHistoricalPerformance,
    createAllDailySnapshots,
    seedHistoricalSnapshots,
    updateActualReturns,
} from "@/lib/curate/performance-tracker";
import { RiskTolerance } from "@/components/curate/quick-start";

const VALID_RISK_PROFILES = ["conservative", "moderate", "aggressive"];

/**
 * GET /api/curate/performance
 *
 * Query params:
 * - profile: Filter by risk profile (conservative, moderate, aggressive)
 * - history: Include historical data for charting (true/false)
 * - days: Number of days for historical data (default 30)
 *
 * Returns performance summaries for allocation recommendations
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const profile = searchParams.get("profile");
        const includeHistory = searchParams.get("history") === "true";
        const days = parseInt(searchParams.get("days") || "30", 10);

        // Validate profile if provided
        if (profile && !VALID_RISK_PROFILES.includes(profile)) {
            return NextResponse.json(
                { error: `Invalid profile. Must be one of: ${VALID_RISK_PROFILES.join(", ")}` },
                { status: 400 }
            );
        }

        // Get performance data
        if (profile) {
            // Single profile request
            const summary = await getPerformanceSummary(profile as RiskTolerance);

            let history = null;
            if (includeHistory) {
                history = await getHistoricalPerformance(profile as RiskTolerance, days);
            }

            return NextResponse.json({
                summary,
                history,
                metadata: {
                    generatedAt: new Date().toISOString(),
                },
            });
        }

        // All profiles
        const summaries = await getPerformanceSummaries();

        // Optionally include history for all profiles
        let histories: Record<string, Awaited<ReturnType<typeof getHistoricalPerformance>>> | null = null;
        if (includeHistory) {
            histories = {};
            for (const p of VALID_RISK_PROFILES) {
                histories[p] = await getHistoricalPerformance(p as RiskTolerance, days);
            }
        }

        return NextResponse.json({
            summaries,
            histories,
            metadata: {
                profileCount: summaries.length,
                generatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error fetching performance data:", error);
        return NextResponse.json(
            { error: "Failed to fetch performance data" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/curate/performance
 *
 * Admin endpoint to create snapshots or seed historical data
 *
 * Body:
 * - action: "snapshot" | "seed" | "update"
 * - days: Number of days to seed (for seed action)
 *
 * Note: In production, this should be protected with authentication
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, days = 30 } = body;

        // In production, add authentication check here
        // For now, check for a simple API key
        const authHeader = request.headers.get("x-api-key");
        const expectedKey = process.env.ADMIN_API_KEY;

        if (expectedKey && authHeader !== expectedKey) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        switch (action) {
            case "snapshot":
                // Create today's snapshots
                await createAllDailySnapshots();
                return NextResponse.json({
                    success: true,
                    message: "Daily snapshots created",
                });

            case "seed":
                // Seed historical data
                await seedHistoricalSnapshots(days);
                return NextResponse.json({
                    success: true,
                    message: `Seeded ${days} days of historical snapshots`,
                });

            case "update":
                // Update actual returns for past snapshots
                await updateActualReturns();
                return NextResponse.json({
                    success: true,
                    message: "Updated actual returns for past snapshots",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action. Must be: snapshot, seed, or update" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Error in performance action:", error);
        return NextResponse.json(
            { error: "Failed to execute performance action" },
            { status: 500 }
        );
    }
}
