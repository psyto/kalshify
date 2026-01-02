import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    prisma.user.upsert({
      where: { walletAddress: '0xE7f8...G9h0' },
      update: {},
      create: {
        walletAddress: '0xE7f8...G9h0',
        displayName: 'Bridge Developer',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xF1g2...H3i4' },
      update: {},
      create: {
        walletAddress: '0xF1g2...H3i4',
        displayName: 'Social DeFi Team',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xG3h4...I5j6' },
      update: {},
      create: {
        walletAddress: '0xG3h4...I5j6',
        displayName: 'ZK Researcher',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xH5i6...J7k8' },
      update: {},
      create: {
        walletAddress: '0xH5i6...J7k8',
        displayName: 'DePIN Network',
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { walletAddress: '0xI7j8...K9l0' },
      update: {},
      create: {
        walletAddress: '0xI7j8...K9l0',
        displayName: 'Payment Protocol',
        lastLoginAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Helper to get days ago date
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Create M&A Listings
  const listing1 = await prisma.listing.upsert({
    where: { id: 'listing-1' },
    update: {},
    create: {
      id: 'listing-1',
      type: 'acquisition',
      projectName: 'Yearn Finance',
      productType: 'DeFi Yield Aggregator',
      description: 'Automated yield farming protocol with proven revenue and active community. $2.5M ARR, 15K MAU, growing 25% MoM.',
      askingPrice: 8500000,
      revenue: 2500000,
      mau: 15000,
      category: 'defi',
      status: 'active',
      chain: 'ethereum',
      website: 'https://example-defi.com',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 5000000,
      createdAt: daysAgo(5),
      sellerId: users[0].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 85,
          developer_activity_score: 88,
          team_retention_score: 82,
          active_contributors: 12,
        },
        trace: {
          growth_score: 92,
          verified_roi: 450,
          roi_multiplier: 4.5,
          quality_score: 89,
        },
        revenue_verified: 1,
        fabrknt_score: 88,
      },
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { id: 'listing-2' },
    update: {},
    create: {
      id: 'listing-2',
      type: 'acquisition',
      projectName: 'Axie Infinity',
      productType: 'Play-to-Earn Gaming Platform',
      description: 'Play-to-earn gaming ecosystem with 50K+ active players. Strong community engagement and proven team.',
      askingPrice: 12000000,
      revenue: 3800000,
      mau: 52000,
      category: 'gaming',
      status: 'active',
      chain: 'polygon',
      website: 'https://example-game.io',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 8000000,
      createdAt: daysAgo(12),
      sellerId: users[1].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 78,
          developer_activity_score: 75,
          team_retention_score: 80,
          active_contributors: 8,
        },
        trace: {
          growth_score: 88,
          verified_roi: 380,
          roi_multiplier: 3.8,
          quality_score: 85,
        },
        revenue_verified: 1,
        fabrknt_score: 82,
      },
    },
  });

  const listing3 = await prisma.listing.upsert({
    where: { id: 'listing-3' },
    update: {},
    create: {
      id: 'listing-3',
      type: 'acquisition',
      projectName: 'Snapshot',
      productType: 'DAO Governance Platform',
      description: 'Modular governance framework used by 200+ DAOs. Subscription-based revenue model, highly scalable.',
      askingPrice: 5500000,
      revenue: 1200000,
      mau: 8500,
      category: 'dao',
      status: 'under_offer',
      chain: 'multi-chain',
      website: 'https://example-dao.tools',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 3000000,
      createdAt: daysAgo(20),
      sellerId: users[2].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 92,
          developer_activity_score: 95,
          team_retention_score: 90,
          active_contributors: 15,
        },
        trace: {
          growth_score: 76,
          verified_roi: 420,
          roi_multiplier: 4.2,
          quality_score: 82,
        },
        revenue_verified: 1,
        fabrknt_score: 85,
      },
    },
  });

  const listing4 = await prisma.listing.upsert({
    where: { id: 'listing-4' },
    update: {},
    create: {
      id: 'listing-4',
      type: 'acquisition',
      projectName: 'Foundation',
      productType: 'NFT Art Marketplace',
      description: 'Curated NFT marketplace focusing on digital art. $850K ARR, strong artist community.',
      askingPrice: 3200000,
      revenue: 850000,
      mau: 4200,
      category: 'nft',
      status: 'active',
      chain: 'base',
      website: 'https://example-nft.market',
      hasNDA: false,
      requiresProofOfFunds: false,
      createdAt: daysAgo(8),
      sellerId: users[3].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 68,
          developer_activity_score: 65,
          team_retention_score: 70,
          active_contributors: 5,
        },
        trace: {
          growth_score: 72,
          verified_roi: 280,
          roi_multiplier: 2.8,
          quality_score: 75,
        },
        revenue_verified: 1,
        fabrknt_score: 70,
      },
    },
  });

  const listing5 = await prisma.listing.upsert({
    where: { id: 'listing-5' },
    update: {},
    create: {
      id: 'listing-5',
      type: 'acquisition',
      projectName: 'Synapse Protocol',
      productType: 'Cross-Chain Bridge',
      description: 'Secure multi-chain asset bridge. $4.2M TVL, high transaction volume, strong security track record.',
      askingPrice: 15000000,
      revenue: 5600000,
      mau: 28000,
      category: 'infrastructure',
      status: 'active',
      chain: 'multi-chain',
      website: 'https://example-bridge.network',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 10000000,
      createdAt: daysAgo(3),
      sellerId: users[4].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 90,
          developer_activity_score: 92,
          team_retention_score: 88,
          active_contributors: 18,
        },
        trace: {
          growth_score: 95,
          verified_roi: 520,
          roi_multiplier: 5.2,
          quality_score: 93,
        },
        revenue_verified: 1,
        fabrknt_score: 92,
      },
    },
  });

  const listing6 = await prisma.listing.upsert({
    where: { id: 'listing-6' },
    update: {},
    create: {
      id: 'listing-6',
      type: 'acquisition',
      projectName: 'DeFi Llama',
      productType: 'Social DeFi Platform',
      description: 'Social trading platform with 12K active traders. Revenue from trading fees and premium subscriptions.',
      askingPrice: 4800000,
      revenue: 980000,
      mau: 12000,
      category: 'defi',
      status: 'sold',
      chain: 'solana',
      website: 'https://example-social.fi',
      hasNDA: true,
      requiresProofOfFunds: true,
      minBuyerCapital: 3000000,
      createdAt: daysAgo(45),
      sellerId: users[5].id,
      seekingPartners: [],
      offeringCapabilities: [],
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 75,
          developer_activity_score: 78,
          team_retention_score: 72,
          active_contributors: 9,
        },
        trace: {
          growth_score: 80,
          verified_roi: 350,
          roi_multiplier: 3.5,
          quality_score: 78,
        },
        revenue_verified: 1,
        fabrknt_score: 77,
      },
    },
  });

  // Create Partnership Listings
  const partnership1 = await prisma.listing.upsert({
    where: { id: 'partnership-1' },
    update: {},
    create: {
      id: 'partnership-1',
      type: 'partnership',
      projectName: 'zkSync',
      productType: 'ZK-Proof Infrastructure',
      description: 'Enterprise-grade zero-knowledge proof infrastructure seeking integration partners. Looking to collaborate with L2s, privacy protocols, and enterprise blockchain solutions.',
      revenue: 1500000,
      mau: 3200,
      seekingPartners: ['Layer 2 protocols', 'Privacy-focused DeFi', 'Enterprise blockchain'],
      offeringCapabilities: ['ZK-SNARK circuits', 'Proof generation', 'Verification infrastructure'],
      partnershipType: 'technical',
      category: 'infrastructure',
      status: 'active',
      chain: 'ethereum',
      website: 'https://example-zk.tech',
      hasNDA: true,
      createdAt: daysAgo(7),
      sellerId: users[6].id,
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 88,
          developer_activity_score: 92,
          team_retention_score: 85,
          active_contributors: 14,
        },
        trace: {
          growth_score: 82,
          verified_roi: 400,
          roi_multiplier: 4.0,
          quality_score: 88,
        },
        revenue_verified: 1,
        fabrknt_score: 86,
      },
    },
  });

  const partnership2 = await prisma.listing.upsert({
    where: { id: 'partnership-2' },
    update: {},
    create: {
      id: 'partnership-2',
      type: 'collaboration',
      projectName: 'Helium',
      productType: 'DePIN Network',
      description: 'Decentralized Physical Infrastructure Network with 5K+ nodes. Seeking ecosystem partnerships for network expansion and use-case development.',
      revenue: 800000,
      mau: 5500,
      seekingPartners: ['IoT platforms', 'Smart city solutions', 'Data marketplaces'],
      offeringCapabilities: ['Global node network', 'Data collection infrastructure', 'Token economics'],
      partnershipType: 'ecosystem',
      category: 'infrastructure',
      status: 'active',
      chain: 'multi-chain',
      website: 'https://example-depin.network',
      hasNDA: false,
      createdAt: daysAgo(14),
      sellerId: users[7].id,
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 80,
          developer_activity_score: 78,
          team_retention_score: 82,
          active_contributors: 11,
        },
        trace: {
          growth_score: 85,
          verified_roi: 320,
          roi_multiplier: 3.2,
          quality_score: 80,
        },
        revenue_verified: 1,
        fabrknt_score: 81,
      },
    },
  });

  const partnership3 = await prisma.listing.upsert({
    where: { id: 'partnership-3' },
    update: {},
    create: {
      id: 'partnership-3',
      type: 'partnership',
      projectName: 'Circle',
      productType: 'Payment Protocol',
      description: 'Stablecoin payment rails for Web3 apps. Seeking strategic partnerships with DeFi protocols, NFT marketplaces, and gaming platforms for payment integration.',
      revenue: 2200000,
      mau: 18000,
      seekingPartners: ['DeFi protocols', 'NFT marketplaces', 'Gaming platforms', 'E-commerce'],
      offeringCapabilities: ['Instant settlements', 'Multi-currency support', 'Compliance infrastructure'],
      partnershipType: 'strategic',
      category: 'defi',
      status: 'active',
      chain: 'multi-chain',
      website: 'https://example-pay.protocol',
      hasNDA: true,
      createdAt: daysAgo(10),
      sellerId: users[8].id,
      suiteDataSnapshot: {
        pulse: {
          vitality_score: 86,
          developer_activity_score: 88,
          team_retention_score: 84,
          active_contributors: 13,
        },
        trace: {
          growth_score: 90,
          verified_roi: 480,
          roi_multiplier: 4.8,
          quality_score: 87,
        },
        revenue_verified: 1,
        fabrknt_score: 88,
      },
    },
  });

  console.log(`✅ Created 9 listings (6 M&A + 3 partnerships)`);
  console.log('');
  console.log('📊 Seed Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Listings: 9 total`);
  console.log(`   - M&A: 6 (${[listing1, listing2, listing3, listing4, listing5, listing6].map(l => l.projectName).join(', ')})`);
  console.log(`   - Partnerships: 3 (${[partnership1, partnership2, partnership3].map(l => l.projectName).join(', ')})`);
  console.log('');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
