/**
 * Euler Intelligence Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIntelligenceScore } from "./calculators/score-calculator";
import { IntelligenceData, IntelligenceScore } from "@/lib/api/types";
import { Company } from "./companies";

const EULER_CONTRACT = "0x27182842E098f60e3D576794A5bFFb0777E025d3";

export async function fetchEulerData(): Promise<IntelligenceData> {
    try {
        console.log("Fetching Euler intelligence data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("euler-xyz").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("eulerfinance").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(EULER_CONTRACT).catch(() => ({
                contractAddress: EULER_CONTRACT,
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
            companyName: "Euler",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Euler data:", error);
        throw error;
    }
}

export async function calculateEulerScore(
    data?: IntelligenceData
): Promise<IntelligenceScore> {
    const intelligenceData = data || (await fetchEulerData());
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
        slug: "euler",
        name: "Euler",
        category: "defi",
        description: "Permissionless lending protocol on Ethereum",
        logo: "📐",
        website: "https://www.euler.finance",
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

export async function getEulerCompanyData(
    data?: IntelligenceData,
    score?: IntelligenceScore
): Promise<Company> {
    const intelligenceData = data || (await fetchEulerData());
    const intelligenceScore =
        score || (await calculateEulerScore(intelligenceData));
    return convertToCompany(intelligenceData, intelligenceScore);
}
