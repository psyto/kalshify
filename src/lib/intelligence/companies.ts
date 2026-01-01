import { loadCompanyFromJson, loadAllCompaniesFromJson } from './data-loader';

export type CompanyCategory = 'defi' | 'infrastructure' | 'nft' | 'dao' | 'gaming';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface Company {
  slug: string;
  name: string;
  category: CompanyCategory;
  description: string;
  logo: string;
  website: string;

  // Team metrics (from PULSE)
  teamHealth: {
    score: number;              // 0-100
    githubCommits30d: number;
    activeContributors: number;
    contributorRetention: number; // percentage
    codeQuality: number;        // 0-100
  };

  // Growth metrics (from TRACE)
  growth: {
    score: number;              // 0-100
    onChainActivity30d: number;
    walletGrowth: number;       // percentage
    userGrowthRate: number;     // percentage
    tvl?: number;               // Total Value Locked (for DeFi)
    volume30d?: number;         // Trading volume (for NFT, DeFi)
  };

  // Overall intelligence
  overallScore: number;         // 0-100 (combined health score)
  trend: TrendDirection;        // 30-day trend
  isListed: boolean;            // Listed in MARKETPLACE
  listingId?: string;           // Reference to marketplace listing
}

// Mock company data - 25 web3 companies (used as fallback when real data is not available)
const mockCompanies: Company[] = [
  // DeFi Companies
  {
    slug: 'uniswap',
    name: 'Uniswap',
    category: 'defi',
    description: 'Leading decentralized exchange protocol for trading ERC-20 tokens',
    logo: '🦄',
    website: 'https://uniswap.org',
    teamHealth: {
      score: 92,
      githubCommits30d: 324,
      activeContributors: 45,
      contributorRetention: 88,
      codeQuality: 94,
    },
    growth: {
      score: 89,
      onChainActivity30d: 125000,
      walletGrowth: 12.5,
      userGrowthRate: 8.3,
      tvl: 3200000000,
      volume30d: 42000000000,
    },
    overallScore: 91,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'aave',
    name: 'Aave',
    category: 'defi',
    description: 'Decentralized lending and borrowing protocol',
    logo: '👻',
    website: 'https://aave.com',
    teamHealth: {
      score: 88,
      githubCommits30d: 287,
      activeContributors: 38,
      contributorRetention: 85,
      codeQuality: 91,
    },
    growth: {
      score: 86,
      onChainActivity30d: 98000,
      walletGrowth: 10.2,
      userGrowthRate: 7.1,
      tvl: 5100000000,
      volume30d: 28000000000,
    },
    overallScore: 87,
    trend: 'up',
    isListed: true,
    listingId: 'aave-protocol',
  },
  {
    slug: 'compound',
    name: 'Compound',
    category: 'defi',
    description: 'Algorithmic money market protocol',
    logo: '🏦',
    website: 'https://compound.finance',
    teamHealth: {
      score: 84,
      githubCommits30d: 198,
      activeContributors: 28,
      contributorRetention: 82,
      codeQuality: 89,
    },
    growth: {
      score: 79,
      onChainActivity30d: 65000,
      walletGrowth: 5.8,
      userGrowthRate: 4.2,
      tvl: 2800000000,
      volume30d: 15000000000,
    },
    overallScore: 82,
    trend: 'stable',
    isListed: false,
  },
  {
    slug: 'curve',
    name: 'Curve Finance',
    category: 'defi',
    description: 'DEX optimized for stablecoin trading',
    logo: '📈',
    website: 'https://curve.fi',
    teamHealth: {
      score: 86,
      githubCommits30d: 245,
      activeContributors: 32,
      contributorRetention: 84,
      codeQuality: 88,
    },
    growth: {
      score: 83,
      onChainActivity30d: 82000,
      walletGrowth: 8.5,
      userGrowthRate: 6.3,
      tvl: 4200000000,
      volume30d: 35000000000,
    },
    overallScore: 85,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'makerdao',
    name: 'MakerDAO',
    category: 'defi',
    description: 'Decentralized stablecoin protocol',
    logo: '🏛️',
    website: 'https://makerdao.com',
    teamHealth: {
      score: 90,
      githubCommits30d: 312,
      activeContributors: 41,
      contributorRetention: 87,
      codeQuality: 92,
    },
    growth: {
      score: 85,
      onChainActivity30d: 95000,
      walletGrowth: 9.2,
      userGrowthRate: 6.8,
      tvl: 6500000000,
      volume30d: 25000000000,
    },
    overallScore: 88,
    trend: 'up',
    isListed: true,
    listingId: 'maker-dao',
  },

  // Infrastructure Companies
  {
    slug: 'chainlink',
    name: 'Chainlink',
    category: 'infrastructure',
    description: 'Decentralized oracle network',
    logo: '🔗',
    website: 'https://chain.link',
    teamHealth: {
      score: 93,
      githubCommits30d: 456,
      activeContributors: 52,
      contributorRetention: 90,
      codeQuality: 95,
    },
    growth: {
      score: 91,
      onChainActivity30d: 145000,
      walletGrowth: 15.3,
      userGrowthRate: 11.2,
    },
    overallScore: 92,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'the-graph',
    name: 'The Graph',
    category: 'infrastructure',
    description: 'Decentralized indexing protocol for blockchain data',
    logo: '📊',
    website: 'https://thegraph.com',
    teamHealth: {
      score: 87,
      githubCommits30d: 298,
      activeContributors: 39,
      contributorRetention: 86,
      codeQuality: 90,
    },
    growth: {
      score: 84,
      onChainActivity30d: 78000,
      walletGrowth: 11.5,
      userGrowthRate: 8.7,
    },
    overallScore: 86,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'polygon',
    name: 'Polygon',
    category: 'infrastructure',
    description: 'Ethereum scaling and infrastructure platform',
    logo: '🟣',
    website: 'https://polygon.technology',
    teamHealth: {
      score: 91,
      githubCommits30d: 389,
      activeContributors: 48,
      contributorRetention: 89,
      codeQuality: 93,
    },
    growth: {
      score: 88,
      onChainActivity30d: 185000,
      walletGrowth: 18.2,
      userGrowthRate: 14.5,
    },
    overallScore: 90,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'filecoin',
    name: 'Filecoin',
    category: 'infrastructure',
    description: 'Decentralized storage network',
    logo: '💾',
    website: 'https://filecoin.io',
    teamHealth: {
      score: 85,
      githubCommits30d: 267,
      activeContributors: 35,
      contributorRetention: 83,
      codeQuality: 87,
    },
    growth: {
      score: 80,
      onChainActivity30d: 62000,
      walletGrowth: 7.3,
      userGrowthRate: 5.8,
    },
    overallScore: 83,
    trend: 'stable',
    isListed: true,
    listingId: 'filecoin-network',
  },
  {
    slug: 'arweave',
    name: 'Arweave',
    category: 'infrastructure',
    description: 'Permanent decentralized data storage',
    logo: '🌐',
    website: 'https://arweave.org',
    teamHealth: {
      score: 82,
      githubCommits30d: 178,
      activeContributors: 26,
      contributorRetention: 80,
      codeQuality: 85,
    },
    growth: {
      score: 77,
      onChainActivity30d: 48000,
      walletGrowth: 6.2,
      userGrowthRate: 4.8,
    },
    overallScore: 80,
    trend: 'stable',
    isListed: false,
  },

  // NFT Companies
  {
    slug: 'opensea',
    name: 'OpenSea',
    category: 'nft',
    description: 'Leading NFT marketplace',
    logo: '🌊',
    website: 'https://opensea.io',
    teamHealth: {
      score: 89,
      githubCommits30d: 312,
      activeContributors: 42,
      contributorRetention: 87,
      codeQuality: 91,
    },
    growth: {
      score: 86,
      onChainActivity30d: 125000,
      walletGrowth: 13.8,
      userGrowthRate: 10.2,
      volume30d: 850000000,
    },
    overallScore: 88,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'blur',
    name: 'Blur',
    category: 'nft',
    description: 'NFT marketplace for pro traders',
    logo: '💨',
    website: 'https://blur.io',
    teamHealth: {
      score: 85,
      githubCommits30d: 278,
      activeContributors: 34,
      contributorRetention: 84,
      codeQuality: 88,
    },
    growth: {
      score: 91,
      onChainActivity30d: 156000,
      walletGrowth: 22.5,
      userGrowthRate: 18.3,
      volume30d: 1200000000,
    },
    overallScore: 88,
    trend: 'up',
    isListed: true,
    listingId: 'blur-marketplace',
  },
  {
    slug: 'art-blocks',
    name: 'Art Blocks',
    category: 'nft',
    description: 'Generative art NFT platform',
    logo: '🎨',
    website: 'https://artblocks.io',
    teamHealth: {
      score: 83,
      githubCommits30d: 189,
      activeContributors: 28,
      contributorRetention: 81,
      codeQuality: 86,
    },
    growth: {
      score: 78,
      onChainActivity30d: 42000,
      walletGrowth: 5.5,
      userGrowthRate: 3.8,
      volume30d: 28000000,
    },
    overallScore: 81,
    trend: 'stable',
    isListed: false,
  },
  {
    slug: 'zora',
    name: 'Zora',
    category: 'nft',
    description: 'NFT creation and marketplace protocol',
    logo: '⚡',
    website: 'https://zora.co',
    teamHealth: {
      score: 87,
      githubCommits30d: 245,
      activeContributors: 36,
      contributorRetention: 85,
      codeQuality: 89,
    },
    growth: {
      score: 84,
      onChainActivity30d: 68000,
      walletGrowth: 12.3,
      userGrowthRate: 9.5,
      volume30d: 45000000,
    },
    overallScore: 86,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'foundation',
    name: 'Foundation',
    category: 'nft',
    description: 'Curated NFT marketplace for creators',
    logo: '🏛️',
    website: 'https://foundation.app',
    teamHealth: {
      score: 80,
      githubCommits30d: 156,
      activeContributors: 24,
      contributorRetention: 78,
      codeQuality: 84,
    },
    growth: {
      score: 75,
      onChainActivity30d: 38000,
      walletGrowth: 4.2,
      userGrowthRate: 2.9,
      volume30d: 18000000,
    },
    overallScore: 78,
    trend: 'down',
    isListed: false,
  },

  // DAO Companies
  {
    slug: 'snapshot',
    name: 'Snapshot',
    category: 'dao',
    description: 'Decentralized voting platform',
    logo: '📸',
    website: 'https://snapshot.org',
    teamHealth: {
      score: 88,
      githubCommits30d: 289,
      activeContributors: 37,
      contributorRetention: 86,
      codeQuality: 90,
    },
    growth: {
      score: 85,
      onChainActivity30d: 92000,
      walletGrowth: 14.5,
      userGrowthRate: 11.3,
    },
    overallScore: 87,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'aragon',
    name: 'Aragon',
    category: 'dao',
    description: 'DAO creation and management platform',
    logo: '🦅',
    website: 'https://aragon.org',
    teamHealth: {
      score: 84,
      githubCommits30d: 234,
      activeContributors: 31,
      contributorRetention: 82,
      codeQuality: 87,
    },
    growth: {
      score: 79,
      onChainActivity30d: 58000,
      walletGrowth: 8.2,
      userGrowthRate: 6.5,
    },
    overallScore: 82,
    trend: 'stable',
    isListed: true,
    listingId: 'aragon-dao',
  },
  {
    slug: 'colony',
    name: 'Colony',
    category: 'dao',
    description: 'Organization management on Ethereum',
    logo: '🐝',
    website: 'https://colony.io',
    teamHealth: {
      score: 81,
      githubCommits30d: 167,
      activeContributors: 25,
      contributorRetention: 79,
      codeQuality: 85,
    },
    growth: {
      score: 76,
      onChainActivity30d: 42000,
      walletGrowth: 5.8,
      userGrowthRate: 4.2,
    },
    overallScore: 79,
    trend: 'stable',
    isListed: false,
  },
  {
    slug: 'gitcoin',
    name: 'Gitcoin',
    category: 'dao',
    description: 'Funding platform for open source developers',
    logo: '🌱',
    website: 'https://gitcoin.co',
    teamHealth: {
      score: 86,
      githubCommits30d: 298,
      activeContributors: 39,
      contributorRetention: 85,
      codeQuality: 89,
    },
    growth: {
      score: 83,
      onChainActivity30d: 75000,
      walletGrowth: 10.5,
      userGrowthRate: 8.2,
    },
    overallScore: 85,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'coordinape',
    name: 'Coordinape',
    category: 'dao',
    description: 'DAO compensation and coordination tool',
    logo: '🔮',
    website: 'https://coordinape.com',
    teamHealth: {
      score: 83,
      githubCommits30d: 201,
      activeContributors: 28,
      contributorRetention: 81,
      codeQuality: 86,
    },
    growth: {
      score: 80,
      onChainActivity30d: 52000,
      walletGrowth: 9.8,
      userGrowthRate: 7.5,
    },
    overallScore: 82,
    trend: 'up',
    isListed: false,
  },

  // Gaming Companies
  {
    slug: 'axie-infinity',
    name: 'Axie Infinity',
    category: 'gaming',
    description: 'Play-to-earn digital pet game',
    logo: '🎮',
    website: 'https://axieinfinity.com',
    teamHealth: {
      score: 85,
      githubCommits30d: 256,
      activeContributors: 34,
      contributorRetention: 83,
      codeQuality: 88,
    },
    growth: {
      score: 72,
      onChainActivity30d: 58000,
      walletGrowth: 3.2,
      userGrowthRate: 1.8,
    },
    overallScore: 79,
    trend: 'down',
    isListed: false,
  },
  {
    slug: 'the-sandbox',
    name: 'The Sandbox',
    category: 'gaming',
    description: 'Virtual world metaverse platform',
    logo: '🏖️',
    website: 'https://sandbox.game',
    teamHealth: {
      score: 87,
      githubCommits30d: 278,
      activeContributors: 36,
      contributorRetention: 85,
      codeQuality: 89,
    },
    growth: {
      score: 81,
      onChainActivity30d: 72000,
      walletGrowth: 8.5,
      userGrowthRate: 6.2,
    },
    overallScore: 84,
    trend: 'stable',
    isListed: true,
    listingId: 'sandbox-metaverse',
  },
  {
    slug: 'illuvium',
    name: 'Illuvium',
    category: 'gaming',
    description: 'Open-world RPG game on Ethereum',
    logo: '🌌',
    website: 'https://illuvium.io',
    teamHealth: {
      score: 89,
      githubCommits30d: 312,
      activeContributors: 41,
      contributorRetention: 87,
      codeQuality: 91,
    },
    growth: {
      score: 86,
      onChainActivity30d: 85000,
      walletGrowth: 15.8,
      userGrowthRate: 12.3,
    },
    overallScore: 88,
    trend: 'up',
    isListed: false,
  },
  {
    slug: 'gods-unchained',
    name: 'Gods Unchained',
    category: 'gaming',
    description: 'Competitive trading card game',
    logo: '🃏',
    website: 'https://godsunchained.com',
    teamHealth: {
      score: 84,
      githubCommits30d: 223,
      activeContributors: 30,
      contributorRetention: 82,
      codeQuality: 87,
    },
    growth: {
      score: 78,
      onChainActivity30d: 48000,
      walletGrowth: 6.5,
      userGrowthRate: 4.8,
    },
    overallScore: 81,
    trend: 'stable',
    isListed: false,
  },
  {
    slug: 'gala-games',
    name: 'Gala Games',
    category: 'gaming',
    description: 'Blockchain gaming ecosystem',
    logo: '🎯',
    website: 'https://gala.games',
    teamHealth: {
      score: 86,
      githubCommits30d: 267,
      activeContributors: 35,
      contributorRetention: 84,
      codeQuality: 88,
    },
    growth: {
      score: 83,
      onChainActivity30d: 78000,
      walletGrowth: 11.2,
      userGrowthRate: 8.8,
    },
    overallScore: 85,
    trend: 'up',
    isListed: false,
  },
];

// Load real data from JSON files when available, fallback to mock data
function loadCompanies(): Company[] {
  // Start with all companies from JSON files (real data)
  const realCompanies = loadAllCompaniesFromJson();
  const realSlugs = new Set(realCompanies.map(c => c.slug));

  // Add mock companies that don't have real data
  const mockOnlyCompanies = mockCompanies.filter(
    mockCompany => !realSlugs.has(mockCompany.slug)
  );

  // Combine real and mock data
  return [...realCompanies, ...mockOnlyCompanies];
}

// Export the merged companies array (real data where available, mock data as fallback)
export const companies: Company[] = loadCompanies();

// Helper functions
export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getCompaniesByCategory(category: CompanyCategory): Company[] {
  return companies.filter((c) => c.category === category);
}

export function getTopCompanies(limit: number = 10): Company[] {
  return [...companies].sort((a, b) => b.overallScore - a.overallScore).slice(0, limit);
}

export function getFastestGrowing(limit: number = 10): Company[] {
  return [...companies]
    .sort((a, b) => b.growth.userGrowthRate - a.growth.userGrowthRate)
    .slice(0, limit);
}

export function getMostActiveTeams(limit: number = 10): Company[] {
  return [...companies]
    .sort((a, b) => b.teamHealth.githubCommits30d - a.teamHealth.githubCommits30d)
    .slice(0, limit);
}

export function getRisingStars(limit: number = 10): Company[] {
  return [...companies]
    .filter((c) => c.trend === 'up')
    .sort((a, b) => {
      const aGrowth = (a.growth.userGrowthRate + a.growth.walletGrowth) / 2;
      const bGrowth = (b.growth.userGrowthRate + b.growth.walletGrowth) / 2;
      return bGrowth - aGrowth;
    })
    .slice(0, limit);
}

export function getListedCompanies(): Company[] {
  return companies.filter((c) => c.isListed);
}

export function getCategoryLeaders(): Record<CompanyCategory, Company> {
  const categories: CompanyCategory[] = ['defi', 'infrastructure', 'nft', 'dao', 'gaming'];
  const leaders: Partial<Record<CompanyCategory, Company>> = {};

  categories.forEach((category) => {
    const categoryCompanies = getCompaniesByCategory(category);
    const leader = categoryCompanies.sort((a, b) => b.overallScore - a.overallScore)[0];
    if (leader) {
      leaders[category] = leader;
    }
  });

  return leaders as Record<CompanyCategory, Company>;
}
