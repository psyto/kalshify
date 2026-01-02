/**
 * Orca Intelligence Data Fetcher
 * Combines all data sources to create comprehensive Orca intelligence
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/solana";
import { calculateIntelligenceScore } from "./calculators/score-calculator";
import { IntelligenceData, IntelligenceScore } from "@/lib/api/types";
import { Company } from "./companies";

const ORCA_PROGRAM_ID = "whirLbMiicVdio4qvUfM5DAg3K5nRp6oP2Y"; // Orca Whirlpool program

export async function fetchOrcaData(): Promise<IntelligenceData> {
    try {
        console.log("Fetching Orca intelligence data...");

        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("orca-so").catch((err) => {
                console.error("GitHub fetch error:", err);
                return {
                    totalContributors: 0,
                    activeContributors30d: 0,
                    totalCommits30d: 0,
                    avgCommitsPerDay: 0,
                    topContributors: [],
                    commitActivity: [],
                };
            }),
            getEngagementMetrics("orca_so").catch((err) => {
                console.error("Twitter fetch error:", err);
                throw err;
            }),
            getOnChainMetrics(ORCA_PROGRAM_ID).catch((err) => {
                console.error("Solana RPC fetch error:", err);
                return {
                    contractAddress: ORCA_PROGRAM_ID,
                    chain: "solana",
                    transactionCount24h: 0,
                    transactionCount7d: 0,
                    transactionCount30d: 0,
                    uniqueWallets24h: 0,
                    uniqueWallets7d: 0,
                    uniqueWallets30d: 0,
                };
            }),
        ]);

        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;

        return {
            companyName: "Orca",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Orca data:", error);
        throw error;
    }
}

export async function calculateOrcaScore(
    data?: IntelligenceData
): Promise<IntelligenceScore> {
    const intelligenceData = data || (await fetchOrcaData());
    return calculateIntelligenceScore(
        intelligenceData.github,
        intelligenceData.twitter,
        intelligenceData.onchain, intelligenceData.category
    );
}

export function convertToCompany(
    data: IntelligenceData,
    score: IntelligenceScore
): Company {
    return {
        slug: "orca",
        name: "Orca",
        category: "defi",
        description:
            "User-friendly AMM and concentrated liquidity DEX on Solana",
        logo: "🐋",
        website: "https://www.orca.so",
        teamHealth: {
            score: score.teamHealth,
            githubCommits30d: data.github.totalCommits30d,
            activeContributors: data.github.activeContributors30d,
            contributorRetention: Math.round(
                (data.github.activeContributors30d /
                    Math.max(data.github.totalContributors, 1)) *
                    100
            ),
            codeQuality: 90,
        },
        growth: {
            score: score.growthScore,
            onChainActivity30d: data.onchain.transactionCount30d || 0,
            walletGrowth: 20,
            userGrowthRate: 20,
            tvl: undefined,
            volume30d: 0,
        },
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

export async function getOrcaCompanyData(
    data?: IntelligenceData,
    score?: IntelligenceScore
): Promise<Company> {
    const intelligenceData = data || (await fetchOrcaData());
    const intelligenceScore =
        score || (await calculateOrcaScore(intelligenceData));
    return convertToCompany(intelligenceData, intelligenceScore);
}
