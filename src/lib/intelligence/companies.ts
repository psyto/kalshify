import { loadCompanyFromJson, loadAllCompaniesFromJson } from "./data-loader";
import { calculateMomentumIndex } from "./calculators/score-calculator";

export type CompanyCategory =
    | "defi"
    | "infrastructure"
    | "nft"
    | "dao"
    | "gaming";
export type TrendDirection = "up" | "down" | "stable";

export interface Company {
    slug: string;
    name: string;
    category: CompanyCategory;
    description: string;
    logo: string;
    website: string;

    // Team metrics (from PULSE)
    teamHealth: {
        score: number; // 0-100
        githubCommits30d: number;
        activeContributors: number;
        contributorRetention: number; // percentage
        codeQuality: number; // 0-100
    };

    // Growth metrics (from TRACE)
    growth: {
        score: number; // 0-100
        onChainActivity30d: number;
        walletGrowth: number; // percentage
        userGrowthRate: number; // percentage
        tvl?: number; // Total Value Locked (for DeFi)
        volume30d?: number; // Trading volume (for NFT, DeFi)
    };

    // Overall intelligence
    overallScore: number; // 0-100 (combined health score)
    trend: TrendDirection; // 30-day trend
    isListed: boolean; // Listed in MARKETPLACE
    listingId?: string; // Reference to marketplace listing
    news?: {
        title: string;
        url: string;
        date: string;
        summary?: string;
        source: string;
    }[];
}

// Load all verified companies from disk
export function loadCompanies(): Company[] {
    return loadAllCompaniesFromJson();
}

// Export the merged companies array (real data where available, mock data as fallback)
// Deprecated: use getCompanies() for the most up-to-date data
export const companies: Company[] = loadCompanies();

/**
 * Get all companies with the most up-to-date information from disk
 */
export function getCompanies(): Company[] {
    return loadCompanies();
}

// Helper functions
export function getCompanyBySlug(slug: string): Company | undefined {
    // Load real data from JSON
    return loadCompanyFromJson(slug) || undefined;
}

export function getCompaniesByCategory(category: CompanyCategory): Company[] {
    const allCompanies = getCompanies();
    return allCompanies.filter((c) => c.category === category);
}

export function getTopCompanies(limit: number = 10): Company[] {
    const allCompanies = getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, limit);
}

export function getFastestGrowing(limit: number = 10): Company[] {
    const allCompanies = getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.growth.score - a.growth.score)
        .slice(0, limit);
}

export function getMostActiveTeams(limit: number = 10): Company[] {
    const allCompanies = getCompanies();
    return [...allCompanies]
        .sort((a, b) => b.teamHealth.score - a.teamHealth.score)
        .slice(0, limit);
}

export function getRisingStars(limit: number = 10): Company[] {
    const allCompanies = getCompanies();
    return [...allCompanies]
        .sort((a, b) => {
            // Priority 1: Trend
            if (a.trend === "up" && b.trend !== "up") return -1;
            if (a.trend !== "up" && b.trend === "up") return 1;

            // Priority 2: Momentum calculation
            const aMomentum = calculateMomentumIndex(a.growth.score, a.teamHealth.score, a.trend);
            const bMomentum = calculateMomentumIndex(b.growth.score, b.teamHealth.score, b.trend);
            return bMomentum - aMomentum;
        })
        .slice(0, limit);
}

export function getListedCompanies(): Company[] {
    const allCompanies = getCompanies();
    return allCompanies.filter((c) => c.isListed);
}

export function getCategoryLeaders(): Record<CompanyCategory, Company> {
    const allCompanies = getCompanies();
    const categories: CompanyCategory[] = [
        "defi",
        "infrastructure",
        "nft",
        "dao",
        "gaming",
    ];
    const leaders: Partial<Record<CompanyCategory, Company>> = {};

    categories.forEach((category) => {
        const categoryCompanies = allCompanies.filter(
            (c) => c.category === category
        );
        const leader = categoryCompanies.sort(
            (a, b) => b.overallScore - a.overallScore
        )[0];
        if (leader) {
            leaders[category] = leader;
        }
    });

    return leaders as Record<CompanyCategory, Company>;
}
