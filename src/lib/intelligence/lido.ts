/**
 * Lido Intelligence Data Fetcher
 */

import { getOrganizationMetrics } from "@/lib/api/github";
import { getEngagementMetrics } from "@/lib/api/twitter";
import { getOnChainMetrics } from "@/lib/api/ethereum";
import { calculateIntelligenceScore } from "./calculators/score-calculator";
import { IntelligenceData, IntelligenceScore } from "@/lib/api/types";
import { Company } from "./companies";

const LIDO_CONTRACT = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";

export async function fetchLidoData(): Promise<IntelligenceData> {
    try {
        console.log("Fetching Lido intelligence data...");
        const [github, twitter, onchain] = await Promise.all([
            getOrganizationMetrics("lidofinance").catch(() => ({
                totalContributors: 0,
                activeContributors30d: 0,
                totalCommits30d: 0,
                avgCommitsPerDay: 0,
                topContributors: [],
                commitActivity: [],
            })),
            getEngagementMetrics("LidoFinance").catch((err) => {
                throw err;
            }),
            getOnChainMetrics(LIDO_CONTRACT).catch(() => ({
                contractAddress: LIDO_CONTRACT,
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
            companyName: "Lido",
            category: "defi",
            github,
            twitter,
            onchain: onchain as any,
            calculatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error fetching Lido data:", error);
        throw error;
    }
}

export async function calculateLidoScore(
    data?: IntelligenceData
): Promise<IntelligenceScore> {
    const intelligenceData = data || (await fetchLidoData());
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
        slug: "lido",
        name: "Lido",
        category: "defi",
        description: "Liquid staking protocol for Ethereum",
        logo: "🌊",
        website: "https://lido.fi",
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

export async function getLidoCompanyData(
    data?: IntelligenceData,
    score?: IntelligenceScore
): Promise<Company> {
    const intelligenceData = data || (await fetchLidoData());
    const intelligenceScore =
        score || (await calculateLidoScore(intelligenceData));
    return convertToCompany(intelligenceData, intelligenceScore);
}
