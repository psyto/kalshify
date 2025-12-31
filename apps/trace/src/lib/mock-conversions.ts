export interface Conversion {
  id: string;
  walletAddress: string;
  txHash: string;
  eventType: 'mint' | 'swap' | 'stake' | 'vote' | 'transfer' | 'unstake';
  valueUsd: number;
  campaignId?: string;
  campaignName?: string;
  clickId?: string;
  timestamp: string;
  chain: 'ethereum' | 'base' | 'polygon' | 'solana';
  contractAddress: string;
}

/**
 * Generate mock conversions
 */
export function generateMockConversions(count: number = 50): Conversion[] {
  const conversions: Conversion[] = [];
  const now = new Date();

  const eventTypes: Conversion['eventType'][] = ['mint', 'swap', 'stake', 'vote', 'transfer', 'unstake'];
  const chains: Conversion['chain'][] = ['ethereum', 'base', 'polygon', 'solana'];

  const campaigns = [
    { id: 'camp-1', name: 'NFT Mint Launch Campaign' },
    { id: 'camp-2', name: 'Token Swap Promotion' },
    { id: 'camp-3', name: 'Staking Rewards Campaign' },
    { id: 'camp-6', name: 'Gaming NFT Drop' },
  ];

  for (let i = 0; i < count; i++) {
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const hasCampaign = Math.random() > 0.3; // 70% have campaign attribution
    const campaign = hasCampaign ? campaigns[Math.floor(Math.random() * campaigns.length)] : undefined;

    // Generate timestamp within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

    // Generate wallet address based on chain
    const walletAddress = chain === 'solana'
      ? generateSolanaAddress()
      : generateEvmAddress();

    // Generate transaction hash
    const txHash = chain === 'solana'
      ? generateSolanaHash()
      : generateEvmHash();

    // Generate contract address
    const contractAddress = chain === 'solana'
      ? generateSolanaAddress()
      : generateEvmAddress();

    // Value varies by event type
    const valueUsd = generateValueByEventType(eventType);

    conversions.push({
      id: `conv-${i + 1}`,
      walletAddress,
      txHash,
      eventType,
      valueUsd,
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      clickId: hasCampaign ? `click-${Math.floor(Math.random() * 10000)}` : undefined,
      timestamp: timestamp.toISOString(),
      chain,
      contractAddress,
    });
  }

  // Sort by timestamp (newest first)
  return conversions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function generateEvmAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
}

function generateSolanaAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address.slice(0, 4) + '...' + address.slice(-4);
}

function generateEvmHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash.slice(0, 10) + '...' + hash.slice(-8);
}

function generateSolanaHash(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let hash = '';
  for (let i = 0; i < 88; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash.slice(0, 8) + '...' + hash.slice(-8);
}

function generateValueByEventType(eventType: Conversion['eventType']): number {
  switch (eventType) {
    case 'mint':
      return Math.random() * 500 + 50; // $50-$550
    case 'swap':
      return Math.random() * 5000 + 100; // $100-$5,100
    case 'stake':
      return Math.random() * 10000 + 500; // $500-$10,500
    case 'vote':
      return 0; // Usually no value
    case 'transfer':
      return Math.random() * 1000 + 10; // $10-$1,010
    case 'unstake':
      return Math.random() * 10000 + 500; // $500-$10,500
    default:
      return 0;
  }
}

/**
 * Get mock conversions
 */
export function getMockConversions(count: number = 50): Conversion[] {
  return generateMockConversions(count);
}

/**
 * Get conversions by campaign ID
 */
export function getConversionsByCampaign(campaignId: string): Conversion[] {
  return getMockConversions(100).filter(c => c.campaignId === campaignId);
}

/**
 * Get conversions by event type
 */
export function getConversionsByEventType(eventType: Conversion['eventType']): Conversion[] {
  return getMockConversions(100).filter(c => c.eventType === eventType);
}

/**
 * Get conversions by chain
 */
export function getConversionsByChain(chain: Conversion['chain']): Conversion[] {
  return getMockConversions(100).filter(c => c.chain === chain);
}

/**
 * Calculate conversion statistics
 */
export function calculateConversionStats(conversions: Conversion[]) {
  const totalConversions = conversions.length;
  const totalValue = conversions.reduce((sum, c) => sum + c.valueUsd, 0);
  const avgValue = totalValue / totalConversions || 0;
  const attributedConversions = conversions.filter(c => c.campaignId).length;
  const organicConversions = conversions.filter(c => !c.campaignId).length;
  const attributionRate = (attributedConversions / totalConversions) * 100 || 0;

  // Group by event type
  const byEventType = conversions.reduce((acc, c) => {
    acc[c.eventType] = (acc[c.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by chain
  const byChain = conversions.reduce((acc, c) => {
    acc[c.chain] = (acc[c.chain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalConversions,
    totalValue,
    avgValue,
    attributedConversions,
    organicConversions,
    attributionRate,
    byEventType,
    byChain,
  };
}
