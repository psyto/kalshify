/**
 * 0x Protocol Intelligence Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIntelligenceScore } from "./calculators/score-calculator";
import { IntelligenceData, IntelligenceScore } from "@/lib/api/types";
import { Company } from "./companies";

const ZEROX_CONTRACT = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";

export async function fetchZeroxData(): Promise<IntelligenceData> {
    try {
        console.log("Fetching 0x Protocol intelligence data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("0xProject").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("0xProject").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(ZEROX_CONTRACT).catch(() => ({
                contractAddress: ZEROX_CONTRACT,
                chain: "ethereum",
                transactionCount24h: 0,
                transactionCount7d: 0,
                transactionCount30d: 0,
                uniqueWallets24h: 0,
                uniqueWallets7d: 0,
                uniqueWallets30d: 0,
            })),
        ]);
        (onchain as any).monthlyActiveUsers = onchain.uniqueWallets30d || 0;
        (onchain as any).dailyActiveUsers = onchain.uniqueWallets24h || 0;
        (onchain as any).weeklyActiveUsers = onchain.uniqueWallets7d || 0;
        return {
            companyName: "0x Protocol",
            category: "infrastructure",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching 0x Protocol data:", error);
        throw error;
    }
}

export async function calculateZeroxScore(
    data?: IntelligenceData
): Promise<IntelligenceScore> {
    const intelligenceData = data || (await fetchZeroxData());
    return calculateIntelligenceScore(
        intelligenceData.github,
        intelligenceData.twitter,
        intelligenceData.onchain
    );
}

export function convertToCompany(
    data: IntelligenceData,
    score: IntelligenceScore
): Company {
    return {
        slug: "zerox",
        name: "0x Protocol",
        category: "infrastructure",
        description: "DEX aggregation and liquidity protocol",
        logo: "0️⃣",
        website: "https://0x.org",
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
            walletGrowth: 15,
            userGrowthRate: 15,
            tvl: undefined,
            volume30d: 0,
        },
        overallScore: score.overall,
        trend: "up" as const,
        isListed: false,
    };
}

export async function getZeroxCompanyData(
    data?: IntelligenceData,
    score?: IntelligenceScore
): Promise<Company> {
    const intelligenceData = data || (await fetchZeroxData());
    const intelligenceScore =
        score || (await calculateZeroxScore(intelligenceData));
    return convertToCompany(intelligenceData, intelligenceScore);
}
