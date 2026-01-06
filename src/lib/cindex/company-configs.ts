/**
 * Company Configuration Registry
 * Single source of truth for all company metadata
 */

import { CompanyCategory, CompanySubcategory, Chain } from "./companies";

export type SupportedChain =
    | "ethereum"
    | "solana"
    | "polygon"
    | "arbitrum"
    | "optimism"
    | "base";

export interface CompanyConfig {
    // Core identifiers
    slug: string;
    name: string;
    category: CompanyCategory;
    subcategory?: CompanySubcategory;
    chains?: Chain[]; // Multi-chain support (if not specified, uses onchain.chain)

    // Display metadata
    description: string;
    logo: string;
    website: string;

    // API identifiers
    github: {
        org: string;
        customMetricsFunction?: "getUniswapMetrics" | "getFabrkntMetrics";
    };
    twitter: {
        handle: string;
    };
    onchain: {
        chain: SupportedChain;
        address: string;
        customMetricsFunction?:
            | "getUniswapMetrics"
            | "getJupiterMetrics"
            | "getKaminoMetrics"
            | "getDriftMetrics"
            | "getOrcaMetrics"
            | "getMarginFiMetrics";
    };

    // Optional URLs for news crawling
    blogUrl?: string;
    mediumUrl?: string;

    // Special behavior flags
    features?: {
        useCrawler?: boolean; // For companies like Fabrknt
        hasTVL?: boolean; // For DeFi companies
        hasVolume?: boolean; // For NFT/DeFi companies
    };

    // Static display values (placeholders)
    defaults?: {
        walletGrowth?: number;
        userGrowthRate?: number;
        codeQuality?: number;
        trend?: "up" | "stable" | "down";
        tvl?: number;
    };
}

export const COMPANY_CONFIGS: CompanyConfig[] = [
    {
        slug: "adamik",
        name: "Adamik",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A universal API startup that allows developers to connect to 40+ blockchains via a single, standardized interface",
        logo: "🔌",
        website: "https://adamik.io",
        github: {
            org: "adamikio",
        },
        twitter: {
            handle: "adamikio",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "altlayer",
        name: "AltLayer",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A Restaked Rollup provider that adds a layer of security to small Arbitrum-based chains",
        logo: "🔒",
        website: "https://altlayer.io",
        github: {
            org: "alt-research",
        },
        twitter: {
            handle: "alt_layer",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "anza",
        name: "Anza",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A new, small development entity by Armani Ferrante focused solely on the core optimization of the Solana validator client",
        logo: "⚡",
        website: "https://anza.xyz",
        github: {
            org: "anza-xyz",
        },
        twitter: {
            handle: "anza_xyz",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 12,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "avantis",
        name: "Avantis",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A young, high-leverage synthetic perpetuals protocol built natively for the Base ecosystem",
        logo: "📈",
        website: "https://avantis.io",
        github: {
            org: "avantis-labs",
        },
        twitter: {
            handle: "AvantisLabs",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 25,
            userGrowthRate: 22,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "blockscout-base",
        name: "Blockscout Base",
        category: "infrastructure",
        subcategory: "analytics",
        description:
            "The open-source explorer team, which remains a small, mission-driven alternative to Etherscan for Base",
        logo: "🔍",
        website: "https://base.blockscout.com",
        github: {
            org: "blockscout",
        },
        twitter: {
            handle: "blockscoutcom",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "caldera",
        name: "Caldera",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "One of the main providers for Arbitrum Orbit infrastructure, helping small projects manage their own dedicated blockspace",
        logo: "🌋",
        website: "https://caldera.xyz",
        github: {
            org: "calderachain",
        },
        twitter: {
            handle: "caldera",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "clockwork",
        name: "Clockwork",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A smart contract automation engine for Solana, allowing for scheduled tasks and event-driven triggers",
        logo: "⏰",
        website: "https://clockwork.xyz",
        github: {
            org: "clockwork-xyz",
        },
        twitter: {
            handle: "clockwork_xyz",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "concentric",
        name: "Concentric",
        category: "defi",
        subcategory: "yield",
        description:
            "Automated liquidity manager built on top of Aerodrome's Slipstream LPs on Base",
        logo: "🎯",
        website: "https://concentric.fi",
        github: {
            org: "concentric-fi",
        },
        twitter: {
            handle: "ConcentricFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "contango",
        name: "Contango",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A unique protocol that builds perpetuals out of spot lending markets (like Aave) to offer lower rates",
        logo: "🔄",
        website: "https://contango.xyz",
        github: {
            org: "contango-xyz",
        },
        twitter: {
            handle: "contangoxyz",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "daimo",
        name: "Daimo",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "A young startup building a P2P payment app (Venmo-style) using stablecoins natively on the Base network",
        logo: "💸",
        website: "https://daimo.com",
        github: {
            org: "daimo-eth",
        },
        twitter: {
            handle: "daimo",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "dolomite",
        name: "Dolomite",
        category: "defi",
        subcategory: "lending",
        description:
            "A next-generation money market and DEX that allows for yield-bearing collateral—a step beyond traditional lending",
        logo: "💎",
        website: "https://dolomite.io",
        github: {
            org: "dolomite-exchange",
        },
        twitter: {
            handle: "DolomiteProtocol",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "espresso-systems",
        name: "Espresso Systems",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "Developing a Shared Sequencer to help all the new Arbitrum Orbit chains talk to each other without delays",
        logo: "☕",
        website: "https://espressosys.com",
        github: {
            org: "EspressoSystems",
        },
        twitter: {
            handle: "EspressoSys",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "flash-trade",
        name: "Flash Trade",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A younger, asset-backed perpetual exchange that uses a pool model for high-efficiency trading",
        logo: "⚡",
        website: "https://flash.trade",
        github: {
            org: "flash-trade",
        },
        twitter: {
            handle: "FlashTrade_",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "fluid-instadapp",
        name: "Fluid",
        category: "defi",
        subcategory: "lending",
        description:
            "A new modular DeFi protocol that combines lending, vaults, and smart accounts into one hyper-efficient layer by Instadapp",
        logo: "💧",
        website: "https://fluid.instadapp.io",
        github: {
            org: "Instadapp",
        },
        twitter: {
            handle: "Instadapp",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "gelato",
        name: "Gelato",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "Relay and Functions tools specifically being used by young Arbitrum projects to automate complex tasks",
        logo: "🍦",
        website: "https://gelato.network",
        github: {
            org: "gelatodigital",
        },
        twitter: {
            handle: "gelatonetwork",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "goldsky",
        name: "Goldsky",
        category: "infrastructure",
        subcategory: "data",
        description:
            "A real-time data indexing company that has become the subgraph alternative of choice for the Base community",
        logo: "🌟",
        website: "https://goldsky.com",
        github: {
            org: "goldsky-io",
        },
        twitter: {
            handle: "goldskycom",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "helius",
        name: "Helius",
        category: "infrastructure",
        subcategory: "data",
        description:
            "A small but dominant team providing the developer platform for Solana (RPCs, Webhooks, and data APIs)",
        logo: "☀️",
        website: "https://helius.dev",
        github: {
            org: "helius-labs",
        },
        twitter: {
            handle: "heliuslabs",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 25,
            userGrowthRate: 22,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "hyperliquid",
        name: "Hyperliquid",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A fast-growing, high-performance perpetual DEX that operates on its own dedicated L1/L3 stack",
        logo: "💧",
        website: "https://hyperliquid.xyz",
        github: {
            org: "hyperliquid-dex",
        },
        twitter: {
            handle: "HyperliquidX",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 30,
            userGrowthRate: 28,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "infinex",
        name: "Infinex",
        category: "defi",
        subcategory: "dex",
        description:
            "A user-layer DeFi project by Synthetix founders designed to make Base feel like a centralized exchange for retail users",
        logo: "∞",
        website: "https://infinex.io",
        github: {
            org: "infinex-xyz",
        },
        twitter: {
            handle: "infinex_app",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 24,
            userGrowthRate: 22,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "ironforge",
        name: "Ironforge",
        category: "infrastructure",
        subcategory: "dev-tools",
        description:
            "A cloud-based developer platform that simplifies the deployment and monitoring of Solana programs",
        logo: "🔨",
        website: "https://ironforge.cloud",
        github: {
            org: "ironforge-cloud",
        },
        twitter: {
            handle: "ironforgecloud",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "juice-finance",
        name: "Juice Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "An innovative yield-farming enhancer that allows users to access high-leverage points-farming and yield on top of other protocols",
        logo: "🧃",
        website: "https://www.juice.finance",
        github: {
            org: "juice-finance",
        },
        twitter: {
            handle: "JuiceFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "lagrange",
        name: "Lagrange",
        category: "infrastructure",
        subcategory: "security",
        description:
            "A ZK-infrastructure project enabling cross-chain state proofs, allowing dApps to prove data from one chain to another securely",
        logo: "🔐",
        website: "https://lagrange.dev",
        github: {
            org: "lagrange-labs",
        },
        twitter: {
            handle: "lagrangedev",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "lobby",
        name: "Lobby",
        category: "infrastructure",
        subcategory: "identity",
        description:
            "A developer-focused tool building social infrastructure for DAOs and on-chain organizations",
        logo: "🏛️",
        website: "https://lobby.so",
        github: {
            org: "lobby-so",
        },
        twitter: {
            handle: "lobbyso",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "meteora",
        name: "Meteora",
        category: "defi",
        subcategory: "dex",
        description:
            "A dynamic liquidity provider protocol focused on maximizing yield for LPs through DLMM (Dynamic Liquidity Market Maker) technology",
        logo: "🌠",
        website: "https://meteora.ag",
        github: {
            org: "MeteoraAg",
        },
        twitter: {
            handle: "MeteoraAG",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "napier-finance",
        name: "Napier Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "A liquidity hub for yield trading that introduces a new primitive for yield curves on Ethereum",
        logo: "📊",
        website: "https://napier.finance",
        github: {
            org: "napier-v2",
        },
        twitter: {
            handle: "napierfinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "openfort",
        name: "Openfort",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "A Wallet-as-a-Service provider that helps game developers on Base hide the blockchain from their users",
        logo: "🎮",
        website: "https://openfort.xyz",
        github: {
            org: "openfort-xyz",
        },
        twitter: {
            handle: "openfortxyz",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "parcl",
        name: "Parcl",
        category: "defi",
        subcategory: "rwa",
        description:
            "A real-estate focused DeFi platform that lets users trade square footage prices of global cities",
        logo: "🏘️",
        website: "https://parcl.co",
        github: {
            org: "ParclFinance",
        },
        twitter: {
            handle: "Parcl",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "peapods-finance",
        name: "Peapods Finance",
        category: "defi",
        subcategory: "yield",
        description:
            "An emerging Volatility-as-a-Service protocol that enables decentralized index funds with a focus on yield generation",
        logo: "🫛",
        website: "https://peapods.finance",
        github: {
            org: "peapods-finance",
        },
        twitter: {
            handle: "PeapodsFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "phoenix-ellipsis",
        name: "Phoenix",
        category: "defi",
        subcategory: "dex",
        description:
            "A fully on-chain, limit order book DEX by Ellipsis Labs that is significantly faster and more lean than previous iterations",
        logo: "🔥",
        website: "https://phoenix.trade",
        github: {
            org: "Ellipsis-Labs",
        },
        twitter: {
            handle: "PhoenixTrade",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
            hasVolume: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "pimlico",
        name: "Pimlico",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "The current leader in ERC-4337 (Account Abstraction) infrastructure, making gasless apps possible on Base",
        logo: "🔑",
        website: "https://pimlico.io",
        github: {
            org: "pimlicolabs",
        },
        twitter: {
            handle: "pimlicoHQ",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 22,
            userGrowthRate: 20,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "ramses-exchange",
        name: "Ramses Exchange",
        category: "defi",
        subcategory: "dex",
        description:
            "A ve(3,3) DEX (similar to Aerodrome) but focused on the Arbitrum ecosystem and its unique L3 chains",
        logo: "🏛️",
        website: "https://ramses.exchange",
        github: {
            org: "RamsesExchange",
        },
        twitter: {
            handle: "RamsesExchange",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "sanctum",
        name: "Sanctum",
        category: "defi",
        subcategory: "liquid-staking",
        description:
            "A protocol building the Liquid Staking Infinity layer, allowing anyone to create their own liquid staking token (LST)",
        logo: "⛪",
        website: "https://sanctum.so",
        github: {
            org: "sanctumlabs",
        },
        twitter: {
            handle: "sanctumso",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "spire",
        name: "Spire",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A Rollup-as-a-service focused on app-specific L3s that settle directly to Ethereum or its major L2s",
        logo: "🗼",
        website: "https://spire.dev",
        github: {
            org: "spire-labs",
        },
        twitter: {
            handle: "spiredev",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "squads",
        name: "Squads",
        category: "infrastructure",
        subcategory: "wallet",
        description:
            "The infrastructure behind most Solana treasuries; a multi-sig and smart account platform for teams",
        logo: "👥",
        website: "https://squads.so",
        github: {
            org: "Squads-Protocol",
        },
        twitter: {
            handle: "SquadsProtocol",
        },
        onchain: {
            chain: "solana",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 20,
            userGrowthRate: 18,
            codeQuality: 90,
            trend: "up",
        },
    },
    {
        slug: "steakhouse-financial",
        name: "Steakhouse Financial",
        category: "defi",
        subcategory: "lending",
        description:
            "Building managed lending vaults on Morpho Blue Base deployments",
        logo: "🥩",
        website: "https://steakhouse.financial",
        github: {
            org: "steakhouse-financial",
        },
        twitter: {
            handle: "SteakhouseFi",
        },
        onchain: {
            chain: "base",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "swaap",
        name: "Swaap",
        category: "defi",
        subcategory: "dex",
        description:
            "A market-making protocol that protects liquidity providers from toxic flow (arbitrageurs)",
        logo: "🔀",
        website: "https://swaap.finance",
        github: {
            org: "swaap-labs",
        },
        twitter: {
            handle: "Swaap_Protocol",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "term-finance",
        name: "Term Finance",
        category: "defi",
        subcategory: "lending",
        description:
            "A protocol bringing fixed-rate lending to Ethereum through periodic auctions, targeting institutional-style predictability",
        logo: "📅",
        website: "https://term.finance",
        github: {
            org: "term-finance",
        },
        twitter: {
            handle: "TermFinance",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 15,
            userGrowthRate: 14,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "voltius",
        name: "Voltius",
        category: "infrastructure",
        subcategory: "security",
        description:
            "A young US-based startup using AI/ML to automate smart contract audits and threat detection",
        logo: "🛡️",
        website: "https://voltius.io",
        github: {
            org: "voltius-labs",
        },
        twitter: {
            handle: "voltiuslabs",
        },
        onchain: {
            chain: "ethereum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 88,
            trend: "up",
        },
    },
    {
        slug: "winr-protocol",
        name: "Winr Protocol",
        category: "defi",
        subcategory: "derivatives",
        description:
            "A decentralized gaming-liquidity engine that powers on-chain betting and casino-style dApps on Arbitrum",
        logo: "🎲",
        website: "https://winr.games",
        github: {
            org: "WINRProtocol",
        },
        twitter: {
            handle: "winr_protocol",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        features: {
            hasTVL: true,
        },
        defaults: {
            walletGrowth: 18,
            userGrowthRate: 16,
            codeQuality: 85,
            trend: "up",
        },
    },
    {
        slug: "zeeve",
        name: "Zeeve",
        category: "infrastructure",
        subcategory: "l2",
        description:
            "A specialized Rollup-as-a-Service that helps small teams launch their own Arbitrum Orbit chains in minutes",
        logo: "⚙️",
        website: "https://zeeve.io",
        github: {
            org: "Zeeve-App",
        },
        twitter: {
            handle: "ZeeveInc",
        },
        onchain: {
            chain: "arbitrum",
            address: "0x0000000000000000000000000000000000000000",
        },
        defaults: {
            walletGrowth: 16,
            userGrowthRate: 15,
            codeQuality: 85,
            trend: "up",
        },
    },
];

// Helper functions
export function getCompanyConfig(
    slug: string
): CompanyConfig | undefined {
    return COMPANY_CONFIGS.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
    );
}

export function getAllCompanySlugs(): string[] {
    return COMPANY_CONFIGS.map((c) => c.slug);
}

export function getCompaniesByChain(chain: SupportedChain): CompanyConfig[] {
    return COMPANY_CONFIGS.filter((c) => c.onchain.chain === chain);
}
