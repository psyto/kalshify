import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Use direct URL for seeding
const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const demoCompanies = [
  {
    slug: "uniswap",
    name: "Uniswap",
    category: "defi",
    description: "Leading decentralized exchange protocol on Ethereum",
    logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    website: "https://uniswap.org",
    overallScore: 92,
    teamHealthScore: 88,
    growthScore: 95,
    socialScore: 90,
    walletQualityScore: 89,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "jupiter",
    name: "Jupiter",
    category: "defi",
    description: "Premier liquidity aggregator on Solana",
    logo: "https://station.jup.ag/favicon.ico",
    website: "https://jup.ag",
    overallScore: 90,
    teamHealthScore: 87,
    growthScore: 93,
    socialScore: 88,
    walletQualityScore: 85,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "tensor",
    name: "Tensor",
    category: "nft",
    description: "Professional NFT trading platform on Solana",
    logo: "https://www.tensor.trade/favicon.ico",
    website: "https://tensor.trade",
    overallScore: 85,
    teamHealthScore: 82,
    growthScore: 88,
    socialScore: 84,
    walletQualityScore: 80,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "blur",
    name: "Blur",
    category: "nft",
    description: "NFT marketplace for pro traders on Ethereum",
    logo: "https://blur.io/favicon.ico",
    website: "https://blur.io",
    overallScore: 83,
    teamHealthScore: 80,
    growthScore: 86,
    socialScore: 82,
    walletQualityScore: 78,
    trend: "stable",
    isActive: true,
    isListed: true,
  },
  {
    slug: "aurory",
    name: "Aurory",
    category: "gaming",
    description: "Play-to-earn gaming universe on Solana",
    logo: "https://aurory.io/favicon.ico",
    website: "https://aurory.io",
    overallScore: 78,
    teamHealthScore: 75,
    growthScore: 80,
    socialScore: 77,
    walletQualityScore: 72,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "staratlas",
    name: "Star Atlas",
    category: "gaming",
    description: "Space exploration metaverse game on Solana",
    logo: "https://staratlas.com/favicon.ico",
    website: "https://staratlas.com",
    overallScore: 76,
    teamHealthScore: 73,
    growthScore: 78,
    socialScore: 75,
    walletQualityScore: 70,
    trend: "stable",
    isActive: true,
    isListed: true,
  },
  {
    slug: "lido",
    name: "Lido",
    category: "defi",
    description: "Liquid staking protocol for Ethereum",
    logo: "https://lido.fi/favicon.ico",
    website: "https://lido.fi",
    overallScore: 94,
    teamHealthScore: 92,
    growthScore: 96,
    socialScore: 93,
    walletQualityScore: 91,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "rocketpool",
    name: "Rocket Pool",
    category: "defi",
    description: "Decentralized Ethereum staking protocol",
    logo: "https://rocketpool.net/favicon.ico",
    website: "https://rocketpool.net",
    overallScore: 87,
    teamHealthScore: 85,
    growthScore: 89,
    socialScore: 86,
    walletQualityScore: 83,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "safe",
    name: "Safe",
    category: "infrastructure",
    description: "Multi-signature wallet infrastructure",
    logo: "https://safe.global/favicon.ico",
    website: "https://safe.global",
    overallScore: 91,
    teamHealthScore: 89,
    growthScore: 92,
    socialScore: 90,
    walletQualityScore: 88,
    trend: "up",
    isActive: true,
    isListed: true,
  },
  {
    slug: "metaplex",
    name: "Metaplex",
    category: "infrastructure",
    description: "NFT protocol and tooling on Solana",
    logo: "https://www.metaplex.com/favicon.ico",
    website: "https://www.metaplex.com",
    overallScore: 86,
    teamHealthScore: 84,
    growthScore: 88,
    socialScore: 85,
    walletQualityScore: 81,
    trend: "stable",
    isActive: true,
    isListed: true,
  },
];

async function main() {
  console.log("🌱 Seeding demo companies...");

  for (const company of demoCompanies) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: company,
      create: company,
    });
    console.log(`✓ Created/updated ${company.name}`);
  }

  const count = await prisma.company.count();
  console.log(`\n✅ Seeding complete! ${count} companies in database.`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
