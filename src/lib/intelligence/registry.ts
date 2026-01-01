/**
 * Intelligence Module Registry
 * Maps company slugs to their intelligence module functions and chain information
 */

import { Company } from "./companies";
import { IntelligenceData, IntelligenceScore } from "@/lib/api/types";

// Supported blockchain chains
export type SupportedChain =
    | "ethereum"
    | "solana"
    | "polygon"
    | "arbitrum"
    | "optimism"
    | "base";

// Company metadata
export interface CompanyMetadata {
    chain: SupportedChain;
    name: string;
    description?: string;
}

// Type for intelligence module functions
export interface IntelligenceModule {
    fetchData: () => Promise<IntelligenceData>;
    calculateScore: (data?: IntelligenceData) => Promise<IntelligenceScore>;
    getCompanyData: (
        data?: IntelligenceData,
        score?: IntelligenceScore
    ) => Promise<Company>;
}

// Registry entry combining metadata and module loader
export interface RegistryEntry {
    metadata: CompanyMetadata;
    loader: () => Promise<IntelligenceModule>;
}

// Registry mapping company slugs to their metadata and module paths
export const INTELLIGENCE_REGISTRY: Record<string, RegistryEntry> = {
    uniswap: {
        metadata: {
            chain: "ethereum",
            name: "Uniswap",
            description: "Leading decentralized exchange protocol",
        },
        loader: async () => {
            const module = await import("./uniswap");
            return {
                fetchData: module.fetchUniswapData,
                calculateScore: module.calculateUniswapScore,
                getCompanyData: module.getUniswapCompanyData,
            };
        },
    },
    jupiter: {
        metadata: {
            chain: "solana",
            name: "Jupiter",
            description: "Solana's leading DEX aggregator",
        },
        loader: async () => {
            const module = await import("./jupiter");
            return {
                fetchData: module.fetchJupiterData,
                calculateScore: module.calculateJupiterScore,
                getCompanyData: module.getJupiterCompanyData,
            };
        },
    },
    // Ethereum companies
    morpho: {
        metadata: {
            chain: "ethereum",
            name: "Morpho",
            description: "Peer-to-peer lending protocol",
        },
        loader: async () => {
            const module = await import("./morpho");
            return {
                fetchData: module.fetchMorphoData,
                calculateScore: module.calculateMorphoScore,
                getCompanyData: module.getMorphoCompanyData,
            };
        },
    },
    euler: {
        metadata: {
            chain: "ethereum",
            name: "Euler",
            description: "Permissionless lending protocol",
        },
        loader: async () => {
            const module = await import("./euler");
            return {
                fetchData: module.fetchEulerData,
                calculateScore: module.calculateEulerScore,
                getCompanyData: module.getEulerCompanyData,
            };
        },
    },
    rocketpool: {
        metadata: {
            chain: "ethereum",
            name: "Rocket Pool",
            description: "Decentralized Ethereum staking protocol",
        },
        loader: async () => {
            const module = await import("./rocketpool");
            return {
                fetchData: module.fetchRocketpoolData,
                calculateScore: module.calculateRocketpoolScore,
                getCompanyData: module.getRocketpoolCompanyData,
            };
        },
    },
    blur: {
        metadata: {
            chain: "ethereum",
            name: "Blur",
            description: "NFT marketplace and aggregator",
        },
        loader: async () => {
            const module = await import("./blur");
            return {
                fetchData: module.fetchBlurData,
                calculateScore: module.calculateBlurScore,
                getCompanyData: module.getBlurCompanyData,
            };
        },
    },
    safe: {
        metadata: {
            chain: "ethereum",
            name: "Safe",
            description: "Multi-sig wallet infrastructure",
        },
        loader: async () => {
            const module = await import("./safe");
            return {
                fetchData: module.fetchSafeData,
                calculateScore: module.calculateSafeScore,
                getCompanyData: module.getSafeCompanyData,
            };
        },
    },
    // Solana companies
    orca: {
        metadata: {
            chain: "solana",
            name: "Orca",
            description: "User-friendly AMM on Solana",
        },
        loader: async () => {
            const module = await import("./orca");
            return {
                fetchData: module.fetchOrcaData,
                calculateScore: module.calculateOrcaScore,
                getCompanyData: module.getOrcaCompanyData,
            };
        },
    },
    drift: {
        metadata: {
            chain: "solana",
            name: "Drift Protocol",
            description: "Decentralized perpetuals and spot trading",
        },
        loader: async () => {
            const module = await import("./drift");
            return {
                fetchData: module.fetchDriftData,
                calculateScore: module.calculateDriftScore,
                getCompanyData: module.getDriftCompanyData,
            };
        },
    },
    marginfi: {
        metadata: {
            chain: "solana",
            name: "MarginFi",
            description: "Lending and borrowing protocol",
        },
        loader: async () => {
            const module = await import("./marginfi");
            return {
                fetchData: module.fetchMarginfiData,
                calculateScore: module.calculateMarginfiScore,
                getCompanyData: module.getMarginfiCompanyData,
            };
        },
    },
    kamino: {
        metadata: {
            chain: "solana",
            name: "Kamino Finance",
            description: "Automated liquidity management",
        },
        loader: async () => {
            const module = await import("./kamino");
            return {
                fetchData: module.fetchKaminoData,
                calculateScore: module.calculateKaminoScore,
                getCompanyData: module.getKaminoCompanyData,
            };
        },
    },
    tensor: {
        metadata: {
            chain: "solana",
            name: "Tensor",
            description: "NFT marketplace on Solana",
        },
        loader: async () => {
            const module = await import("./tensor");
            return {
                fetchData: module.fetchTensorData,
                calculateScore: module.calculateTensorScore,
                getCompanyData: module.getTensorCompanyData,
            };
        },
    },
    // Additional Ethereum companies
    lido: {
        metadata: {
            chain: "ethereum",
            name: "Lido",
            description: "Liquid staking protocol for Ethereum",
        },
        loader: async () => {
            const module = await import("./lido");
            return {
                fetchData: module.fetchLidoData,
                calculateScore: module.calculateLidoScore,
                getCompanyData: module.getLidoCompanyData,
            };
        },
    },
    zora: {
        metadata: {
            chain: "ethereum",
            name: "Zora",
            description: "NFT marketplace and protocol",
        },
        loader: async () => {
            const module = await import("./zora");
            return {
                fetchData: module.fetchZoraData,
                calculateScore: module.calculateZoraScore,
                getCompanyData: module.getZoraCompanyData,
            };
        },
    },
    zerox: {
        metadata: {
            chain: "ethereum",
            name: "0x Protocol",
            description: "DEX aggregation and liquidity protocol",
        },
        loader: async () => {
            const module = await import("./zerox");
            return {
                fetchData: module.fetchZeroxData,
                calculateScore: module.calculateZeroxScore,
                getCompanyData: module.getZeroxCompanyData,
            };
        },
    },
    parallel: {
        metadata: {
            chain: "ethereum",
            name: "Parallel",
            description: "Sci-fi card game on Ethereum",
        },
        loader: async () => {
            const module = await import("./parallel");
            return {
                fetchData: module.fetchParallelData,
                calculateScore: module.calculateParallelScore,
                getCompanyData: module.getParallelCompanyData,
            };
        },
    },
    velodrome: {
        metadata: {
            chain: "ethereum",
            name: "Velodrome",
            description: "AMM and ve(3,3) model on Optimism",
        },
        loader: async () => {
            const module = await import("./velodrome");
            return {
                fetchData: module.fetchVelodromeData,
                calculateScore: module.calculateVelodromeScore,
                getCompanyData: module.getVelodromeCompanyData,
            };
        },
    },
    // Additional Solana companies
    metaplex: {
        metadata: {
            chain: "solana",
            name: "Metaplex",
            description: "NFT standard and tools on Solana",
        },
        loader: async () => {
            const module = await import("./metaplex");
            return {
                fetchData: module.fetchMetaplexData,
                calculateScore: module.calculateMetaplexScore,
                getCompanyData: module.getMetaplexCompanyData,
            };
        },
    },
    jito: {
        metadata: {
            chain: "solana",
            name: "Jito",
            description: "MEV infrastructure on Solana",
        },
        loader: async () => {
            const module = await import("./jito");
            return {
                fetchData: module.fetchJitoData,
                calculateScore: module.calculateJitoScore,
                getCompanyData: module.getJitoCompanyData,
            };
        },
    },
    staratlas: {
        metadata: {
            chain: "solana",
            name: "Star Atlas",
            description: "Space MMO on Solana",
        },
        loader: async () => {
            const module = await import("./staratlas");
            return {
                fetchData: module.fetchStaratlasData,
                calculateScore: module.calculateStaratlasScore,
                getCompanyData: module.getStaratlasCompanyData,
            };
        },
    },
    aurory: {
        metadata: {
            chain: "solana",
            name: "Aurory",
            description: "RPG and NFT game on Solana",
        },
        loader: async () => {
            const module = await import("./aurory");
            return {
                fetchData: module.fetchAuroryData,
                calculateScore: module.calculateAuroryScore,
                getCompanyData: module.getAuroryCompanyData,
            };
        },
    },
    mangomarkets: {
        metadata: {
            chain: "solana",
            name: "Mango Markets",
            description: "Decentralized trading platform on Solana",
        },
        loader: async () => {
            const module = await import("./mangomarkets");
            return {
                fetchData: module.fetchMangomarketsData,
                calculateScore: module.calculateMangomarketsScore,
                getCompanyData: module.getMangomarketsCompanyData,
            };
        },
    },
};

/**
 * Get intelligence module for a company slug
 */
export async function getIntelligenceModule(
    slug: string
): Promise<IntelligenceModule | null> {
    const entry = INTELLIGENCE_REGISTRY[slug.toLowerCase()];
    if (!entry) {
        return null;
    }
    return entry.loader();
}

/**
 * Get company metadata for a slug
 */
export function getCompanyMetadata(slug: string): CompanyMetadata | null {
    const entry = INTELLIGENCE_REGISTRY[slug.toLowerCase()];
    return entry?.metadata || null;
}

/**
 * Get all available company slugs
 */
export function getAvailableCompanySlugs(): string[] {
    return Object.keys(INTELLIGENCE_REGISTRY);
}

/**
 * Get all companies for a specific chain
 */
export function getCompaniesByChain(chain: SupportedChain): string[] {
    return Object.entries(INTELLIGENCE_REGISTRY)
        .filter(([_, entry]) => entry.metadata.chain === chain)
        .map(([slug]) => slug);
}

/**
 * Get RPC configuration info for a chain
 */
export function getChainRpcInfo(chain: SupportedChain): {
    envVar: string;
    defaultUrl?: string;
    description: string;
} {
    switch (chain) {
        case "ethereum":
            return {
                envVar: "ETHEREUM_RPC_URL",
                defaultUrl: "Public RPC endpoints",
                description:
                    "Ethereum RPC (supports Alchemy API key or custom RPC)",
            };
        case "solana":
            return {
                envVar: "SOLANA_RPC_URL",
                defaultUrl: "Public Solana RPC",
                description:
                    "Solana RPC (supports Helius API key or custom RPC)",
            };
        default:
            return {
                envVar: `${chain.toUpperCase()}_RPC_URL`,
                description: `${chain} RPC endpoint`,
            };
    }
}
