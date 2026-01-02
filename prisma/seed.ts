import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users with wallet addresses matching mock data
  const users = await Promise.all([
    prisma.user.upsert({
      where: { walletAddress: '0xA1b2...C3d4' },
      update: {},
      create: {
        walletAddress: '0xA1b2...C3d4',
        displayName: 'DeFi Builder',
        email: 'builder@example.com',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xB5c6...D7e8' },
      update: {},
      create: {
        walletAddress: '0xB5c6...D7e8',
        displayName: 'Gaming Founder',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xC9d0...E1f2' },
      update: {},
      create: {
        walletAddress: '0xC9d0...E1f2',
        displayName: 'DAO Organizer',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xD3e4...F5g6' },
      update: {},
      create: {
        walletAddress: '0xD3e4...F5g6',
        displayName: 'NFT Artist',
        lastLoginAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Fetch companies from the database to link to listings
  const companies = await prisma.company.findMany({
    where: {
      slug: {
        in: ['jupiter', 'blur', 'safe', 'fabrknt']
      }
    }
  });

  const getCompany = (slug: string) => companies.find(c => c.slug === slug);
  const jupiter = getCompany('jupiter');
  const blur = getCompany('blur');
  const safe = getCompany('safe');
  const fabrknt = getCompany('fabrknt');

  // Helper to get days ago date
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 1. Jupiter M&A
  const listing1 = await prisma.listing.upsert({
    where: { id: 'listing-jupiter' },
    update: {},
    create: {
      id: 'listing-jupiter',
      type: 'acquisition',
      projectName: jupiter?.name || 'Jupiter',
      productType: 'Solana Dex Aggregator',
      description: jupiter?.description || 'The leading DEX aggregator on Solana. High volume, verified revenue, and strong growth metrics.',
      askingPrice: 50000000,
      revenue: 12000000,
      mau: 850000,
      category: 'defi',
      status: 'active',
      chain: 'solana',
      website: jupiter?.website || 'https://jup.ag',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 10000000,
      createdAt: daysAgo(2),
      sellerId: users[0].id,
      indexCompanyId: jupiter?.id,
      suiteDataSnapshot: {
        pulse: { vitality_score: 95, developer_activity_score: 92, team_retention_score: 88, active_contributors: 24 },
        trace: { growth_score: 98, verified_roi: 850, roi_multiplier: 8.5, quality_score: 94 },
        revenue_verified: 1,
        fabrknt_score: jupiter?.overallScore || 92,
      },
    },
  });

  // 2. Blur M&A
  const listing2 = await prisma.listing.upsert({
    where: { id: 'listing-blur' },
    update: {},
    create: {
      id: 'listing-blur',
      type: 'acquisition',
      projectName: blur?.name || 'Blur',
      productType: 'NFT Marketplace',
      description: blur?.description || 'Professional NFT marketplace for pro traders. Dominant market share on Ethereum.',
      askingPrice: 35000000,
      revenue: 8500000,
      mau: 45000,
      category: 'nft',
      status: 'active',
      chain: 'ethereum',
      website: blur?.website || 'https://blur.io',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 5000000,
      createdAt: daysAgo(5),
      sellerId: users[1].id,
      indexCompanyId: blur?.id,
      suiteDataSnapshot: {
        pulse: { vitality_score: 88, developer_activity_score: 85, team_retention_score: 82, active_contributors: 18 },
        trace: { growth_score: 92, verified_roi: 420, roi_multiplier: 4.2, quality_score: 89 },
        revenue_verified: 1,
        fabrknt_score: blur?.overallScore || 85,
      },
    },
  });

  // 3. Safe M&A
  const listing3 = await prisma.listing.upsert({
    where: { id: 'listing-safe' },
    update: {},
    create: {
      id: 'listing-safe',
      type: 'acquisition',
      projectName: safe?.name || 'Safe',
      productType: 'Asset Management Platform',
      description: safe?.description || 'The standard for smart account infrastructure and multisig asset management.',
      askingPrice: 20000000,
      revenue: 3200000,
      mau: 120000,
      category: 'infrastructure',
      status: 'active',
      chain: 'ethereum',
      website: safe?.website || 'https://safe.global',
      hasNDA: true,
      requiresProofOfFunds: false,
      createdAt: daysAgo(10),
      sellerId: users[2].id,
      indexCompanyId: safe?.id,
      suiteDataSnapshot: {
        pulse: { vitality_score: 94, developer_activity_score: 96, team_retention_score: 92, active_contributors: 45 },
        trace: { growth_score: 85, verified_roi: 300, roi_multiplier: 3.0, quality_score: 96 },
        revenue_verified: 1,
        fabrknt_score: safe?.overallScore || 90,
      },
    },
  });

  // 4. Fabrknt Partnership
  const listing4 = await prisma.listing.upsert({
    where: { id: 'listing-fabrknt' },
    update: {},
    create: {
      id: 'listing-fabrknt',
      type: 'partnership',
      projectName: fabrknt?.name || 'Fabrknt',
      productType: 'Agentic Code Infrastructure',
      description: fabrknt?.description || 'The Foundational Foundry for Agentic Code & Future Economies. Seeking strategic partners for AI-driven development workflows.',
      revenue: 500000,
      mau: 1200,
      seekingPartners: ['Developer platforms', 'AI researchers', 'Cloud providers'],
      offeringCapabilities: ['Agentic code generation', 'Workflow automation', 'Verifiable builds'],
      partnershipType: 'technical',
      category: 'infrastructure',
      status: 'active',
      chain: 'base',
      website: fabrknt?.website || 'https://www.fabrknt.com',
      hasNDA: false,
      createdAt: daysAgo(1),
      sellerId: users[3].id,
      indexCompanyId: fabrknt?.id,
      suiteDataSnapshot: {
        pulse: { vitality_score: 85, developer_activity_score: 90, team_retention_score: 100, active_contributors: 5 },
        trace: { growth_score: 75, verified_roi: 0, roi_multiplier: 0, quality_score: 85 },
        revenue_verified: 1,
        fabrknt_score: fabrknt?.overallScore || 70,
      },
    },
  });

  // Remove old listings if they exist to keep it clean as requested (listing 4 companies total)
  await prisma.listing.deleteMany({
    where: {
      id: {
        notIn: ['listing-jupiter', 'listing-blur', 'listing-safe', 'listing-fabrknt']
      }
    }
  });

  console.log(`✅ Refresh complete: 3 M&A (Jupiter, Blur, Safe) + 1 Partnership (Fabrknt)`);
  console.log('🎉 Database refreshed successfully!');
}


main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
