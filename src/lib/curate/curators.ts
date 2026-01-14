/**
 * Curator profiles and constants for DeFi strategy tracking
 */

export interface CuratorPlatform {
    protocol: string;
    chain: string;
    role: "vault_curator" | "risk_curator" | "strategy_advisor";
    description: string;
    startDate?: string;
}

export interface CuratorProfile {
    id: string;
    name: string;
    slug: string;
    description: string;
    website: string;
    twitter?: string;
    platforms: CuratorPlatform[];
    trustScore: number;
    aum: number;
    trackRecord: string;
    highlights: string[];
}

// Gauntlet profile - the primary curator we're tracking
export const GAUNTLET_PROFILE: CuratorProfile = {
    id: "gauntlet",
    name: "Gauntlet",
    slug: "gauntlet",
    description: "Leading DeFi risk management and optimization firm. Specializes in protocol parameter tuning, risk modeling, and vault curation across major DeFi platforms.",
    website: "https://gauntlet.network",
    twitter: "gaaborhonyi",
    platforms: [
        {
            protocol: "kamino",
            chain: "Solana",
            role: "risk_curator",
            description: "Manages risk parameters and lending market configurations",
            startDate: "2023-06",
        },
        {
            protocol: "jupiter",
            chain: "Solana",
            role: "strategy_advisor",
            description: "Advises on JLP vault strategy and risk management",
            startDate: "2023-09",
        },
        {
            protocol: "morpho",
            chain: "Ethereum",
            role: "vault_curator",
            description: "Curates MetaMorpho vaults with optimized yield strategies",
            startDate: "2023-11",
        },
        {
            protocol: "aave",
            chain: "Ethereum",
            role: "risk_curator",
            description: "Risk parameter optimization for Aave V3",
            startDate: "2021-01",
        },
        {
            protocol: "compound",
            chain: "Ethereum",
            role: "risk_curator",
            description: "Risk management for Compound V3",
            startDate: "2022-01",
        },
    ],
    trustScore: 95,
    aum: 500_000_000, // Approximate AUM across platforms
    trackRecord: "4+ years in DeFi risk management, no major incidents",
    highlights: [
        "Pioneer in DeFi risk modeling and simulation",
        "Works with top-tier protocols (Aave, Compound, Maker)",
        "Expanded to Solana ecosystem in 2023",
        "Data-driven, quantitative approach to risk",
    ],
};

// Additional curators for future expansion
export const STEAKHOUSE_PROFILE: CuratorProfile = {
    id: "steakhouse",
    name: "Steakhouse Financial",
    slug: "steakhouse",
    description: "DeFi-native financial advisory firm specializing in treasury management and yield optimization.",
    website: "https://steakhouse.financial",
    twitter: "SteakhouseFi",
    platforms: [
        {
            protocol: "morpho",
            chain: "Ethereum",
            role: "vault_curator",
            description: "Curates MetaMorpho USDC vault",
            startDate: "2023-12",
        },
        {
            protocol: "maker",
            chain: "Ethereum",
            role: "strategy_advisor",
            description: "Advises on MakerDAO treasury strategies",
            startDate: "2022-06",
        },
    ],
    trustScore: 88,
    aum: 200_000_000,
    trackRecord: "2+ years, trusted by MakerDAO",
    highlights: [
        "Deep expertise in stablecoin yield",
        "MakerDAO Strategic Finance Core Unit alumni",
        "Focus on institutional-grade strategies",
    ],
};

export const RE7_PROFILE: CuratorProfile = {
    id: "re7",
    name: "RE7 Capital",
    slug: "re7",
    description: "Institutional crypto asset manager focused on DeFi yield strategies.",
    website: "https://re7.capital",
    twitter: "re7capital",
    platforms: [
        {
            protocol: "morpho",
            chain: "Ethereum",
            role: "vault_curator",
            description: "Curates aggressive yield MetaMorpho vaults",
            startDate: "2024-01",
        },
    ],
    trustScore: 82,
    aum: 100_000_000,
    trackRecord: "1+ year active vault management",
    highlights: [
        "Higher risk-reward strategies",
        "Active rebalancing approach",
        "Focus on maximizing yield",
    ],
};

// All curators registry
export const CURATORS: Record<string, CuratorProfile> = {
    gauntlet: GAUNTLET_PROFILE,
    steakhouse: STEAKHOUSE_PROFILE,
    re7: RE7_PROFILE,
};

// Get curator by slug
export function getCurator(slug: string): CuratorProfile | null {
    return CURATORS[slug.toLowerCase()] || null;
}

// Get all curators
export function getAllCurators(): CuratorProfile[] {
    return Object.values(CURATORS);
}

// Get curators for a specific protocol
export function getCuratorsForProtocol(protocol: string): CuratorProfile[] {
    return Object.values(CURATORS).filter(curator =>
        curator.platforms.some(p => p.protocol.toLowerCase() === protocol.toLowerCase())
    );
}
