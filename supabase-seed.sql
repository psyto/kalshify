-- Fabrknt Suite Database Seed
-- Run this in Supabase SQL Editor after running the migration

-- Create 9 test users
INSERT INTO "User" ("id", "walletAddress", "displayName", "createdAt", "updatedAt") VALUES
('user-1', '0xa1b2c3d4e5f6789012345678901234567890abcd', 'CryptoWhale.eth', NOW() - INTERVAL '30 days', NOW()),
('user-2', '0xb5c6d7e8f9012345678901234567890abcdef123', 'DeFiBuilder', NOW() - INTERVAL '45 days', NOW()),
('user-3', '0xc9d0e1f2345678901234567890abcdef12345678', 'GameDevStudio', NOW() - INTERVAL '60 days', NOW()),
('user-4', '0xd3e4f567890123456789abcdef123456789012ab', 'NFTCreator', NOW() - INTERVAL '20 days', NOW()),
('user-5', '0xe7f8901234567890abcdef123456789012abcdef', 'DAOMaster', NOW() - INTERVAL '25 days', NOW()),
('user-6', '0xf1234567890abcdef123456789012abcdef12345', 'InfraBuilder', NOW() - INTERVAL '15 days', NOW()),
('user-7', '0x0abcdef123456789012abcdef123456789abcdef', 'Web3Partner', NOW() - INTERVAL '10 days', NOW()),
('user-8', '0x123456789abcdef0123456789abcdef012345678', 'ProtocolLabs', NOW() - INTERVAL '35 days', NOW()),
('user-9', '0x56789abcdef0123456789abcdef0123456789abc', 'StartupFounder', NOW() - INTERVAL '5 days', NOW())
ON CONFLICT ("walletAddress") DO NOTHING;

-- Create 9 listings (6 M&A + 3 partnerships)
-- Listing 1: Yearn Finance (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-1', 'acquisition', 'Yearn Finance', 'DeFi Yield Aggregator',
    'Automated yield farming protocol with proven revenue and active community. $2.5M ARR, 15K MAU, growing 25% MoM.',
    8500000, 2500000, 15000, 'defi', 'active', 'ethereum',
    true, true, 5000000,
    'user-1', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
    '{"pulse": {"vitality_score": 85, "developer_activity_score": 88, "team_retention_score": 82, "active_contributors": 12}, "trace": {"growth_score": 92, "verified_roi": 450000, "roi_multiplier": 4.5, "quality_score": 89}, "revenue_verified": 1, "fabrknt_score": 88}'::jsonb
);

-- Listing 2: Axie Infinity (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-2', 'acquisition', 'Axie Infinity', 'Play-to-Earn Gaming Platform',
    'Play-to-earn gaming ecosystem with 50K+ active players. Strong community engagement and proven team.',
    12000000, 3800000, 52000, 'gaming', 'active', 'polygon',
    true, true, 8000000,
    'user-2', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days',
    '{"pulse": {"vitality_score": 78, "developer_activity_score": 82, "team_retention_score": 75, "active_contributors": 8}, "trace": {"growth_score": 88, "verified_roi": 380000, "roi_multiplier": 3.8, "quality_score": 85}, "revenue_verified": 1, "fabrknt_score": 83}'::jsonb
);

-- Listing 3: OpenSea Clone (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-3', 'acquisition', 'OpenSea Clone', 'NFT Marketplace',
    'Multi-chain NFT marketplace with $1.2M ARR and 8K MAU. Low-fee model, strong retention.',
    5000000, 1200000, 8000, 'nft', 'active', 'multi-chain',
    true, true, 3000000,
    'user-3', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days',
    '{"pulse": {"vitality_score": 72, "developer_activity_score": 75, "team_retention_score": 68, "active_contributors": 5}, "trace": {"growth_score": 81, "verified_roi": 120000, "roi_multiplier": 2.4, "quality_score": 78}, "revenue_verified": 1, "fabrknt_score": 77}'::jsonb
);

-- Listing 4: Rocket Pool (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-4', 'acquisition', 'Rocket Pool', 'Liquid Staking Protocol',
    'Decentralized Ethereum staking with $800K ARR and growing TVL. Strong brand in staking market.',
    6000000, 800000, 3500, 'defi', 'active', 'ethereum',
    true, true, 4000000,
    'user-4', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days',
    '{"pulse": {"vitality_score": 90, "developer_activity_score": 92, "team_retention_score": 88, "active_contributors": 15}, "trace": {"growth_score": 85, "verified_roi": 80000, "roi_multiplier": 2.0, "quality_score": 90}, "revenue_verified": 1, "fabrknt_score": 88}'::jsonb
);

-- Listing 5: Snapshot (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-5', 'acquisition', 'Snapshot', 'DAO Voting Platform',
    'Leading DAO governance tool with 12K MAU. Used by top DAOs. Strong network effects.',
    4500000, 600000, 12000, 'dao', 'active', 'multi-chain',
    false, true, 2500000,
    'user-5', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days',
    '{"pulse": {"vitality_score": 88, "developer_activity_score": 85, "team_retention_score": 90, "active_contributors": 10}, "trace": {"growth_score": 79, "verified_roi": 60000, "roi_multiplier": 1.8, "quality_score": 86}, "revenue_verified": 1, "fabrknt_score": 84}'::jsonb
);

-- Listing 6: The Graph Node (M&A)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "askingPrice", "revenue", "mau", "category", "status", "chain",
    "hasNDA", "requiresProofOfFunds", "minBuyerCapital",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-6', 'acquisition', 'The Graph Node', 'Indexing Protocol',
    'Web3 data indexing infrastructure with $900K ARR. Enterprise clients, high margins.',
    7500000, 900000, 2500, 'infrastructure', 'active', 'multi-chain',
    true, true, 5000000,
    'user-6', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
    '{"pulse": {"vitality_score": 95, "developer_activity_score": 98, "team_retention_score": 92, "active_contributors": 18}, "trace": {"growth_score": 87, "verified_roi": 90000, "roi_multiplier": 2.5, "quality_score": 94}, "revenue_verified": 1, "fabrknt_score": 92}'::jsonb
);

-- Listing 7: Magic Eden Partnership (Partnership)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "revenue", "mau", "category", "status", "chain",
    "hasNDA", "seekingPartners", "offeringCapabilities", "partnershipType",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-7', 'partnership', 'Magic Eden', 'NFT Marketplace',
    'Seeking strategic partners for cross-chain expansion. 25K MAU, $500K revenue.',
    500000, 25000, 'nft', 'active', 'solana',
    false,
    ARRAY['DeFi protocols', 'Payment processors', 'Infrastructure providers'],
    ARRAY['NFT infrastructure', 'User base', 'Marketing channels'],
    'strategic',
    'user-7', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days',
    '{"pulse": {"vitality_score": 82, "developer_activity_score": 85, "team_retention_score": 78, "active_contributors": 9}, "trace": {"growth_score": 90, "verified_roi": 50000, "roi_multiplier": 3.2, "quality_score": 87}, "revenue_verified": 1, "fabrknt_score": 86}'::jsonb
);

-- Listing 8: Zora Protocol Partnership (Partnership)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "revenue", "mau", "category", "status", "chain",
    "hasNDA", "seekingPartners", "offeringCapabilities", "partnershipType",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-8', 'partnership', 'Zora Protocol', 'Creator Economy Platform',
    'Looking for co-marketing and distribution partners. 15K creators, $350K revenue.',
    350000, 15000, 'nft', 'active', 'base',
    false,
    ARRAY['Media platforms', 'KOLs & Influencers', 'Marketing agencies'],
    ARRAY['Creator tools', 'On-chain distribution', 'Community'],
    'marketing',
    'user-8', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days',
    '{"pulse": {"vitality_score": 76, "developer_activity_score": 80, "team_retention_score": 72, "active_contributors": 6}, "trace": {"growth_score": 83, "verified_roi": 35000, "roi_multiplier": 2.8, "quality_score": 81}, "revenue_verified": 1, "fabrknt_score": 80}'::jsonb
);

-- Listing 9: Euler Finance Partnership (Partnership)
INSERT INTO "Listing" (
    "id", "type", "projectName", "productType", "description",
    "revenue", "mau", "category", "status", "chain",
    "hasNDA", "seekingPartners", "offeringCapabilities", "partnershipType",
    "sellerId", "createdAt", "publishedAt",
    "suiteDataSnapshot"
) VALUES (
    'listing-9', 'partnership', 'Euler Finance', 'Lending Protocol',
    'Seeking technical integration partners for isolated lending pools. $700K revenue, 5K MAU.',
    700000, 5000, 'defi', 'active', 'ethereum',
    true,
    ARRAY['DeFi protocols', 'Developers', 'Security auditors'],
    ARRAY['Lending infrastructure', 'Risk models', 'Liquidity'],
    'technical',
    'user-9', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
    '{"pulse": {"vitality_score": 92, "developer_activity_score": 95, "team_retention_score": 88, "active_contributors": 14}, "trace": {"growth_score": 86, "verified_roi": 70000, "roi_multiplier": 2.2, "quality_score": 91}, "revenue_verified": 1, "fabrknt_score": 89}'::jsonb
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Seed completed successfully! Created 9 users and 9 listings.';
END $$;

-- Show summary
SELECT
    'Users' as table_name,
    COUNT(*) as row_count
FROM "User"
UNION ALL
SELECT
    'Listings' as table_name,
    COUNT(*) as row_count
FROM "Listing";
