import { readFileSync } from 'fs';
import { calculateIndexScore } from '../src/lib/cindex/calculators/score-calculator';

const companySlug = process.argv[2] || 'uniswap';
const filePath = `./data/companies/${companySlug}.json`;

const fileData = JSON.parse(readFileSync(filePath, 'utf-8'));
const data = fileData.rawData || fileData;

console.log(`📊 Recalculating ${data.companyName || fileData.metadata?.name} score with new logic...\n`);

console.log('Input data:');
console.log('  GitHub commits (30d):', data.github?.totalCommits30d);
console.log('  On-chain txs (30d):', data.onchain?.transactionCount30d?.toLocaleString());
console.log('  On-chain TVL:', data.onchain?.tvl ? `$${(data.onchain.tvl / 1e9).toFixed(2)}B` : 'N/A');
console.log('  Twitter followers:', data.twitter?.followers?.toLocaleString());
console.log('  Twitter engagement (30d):', data.twitter?.engagement30d?.likes || 0);
console.log('  News items:', Array.isArray(data.news) ? data.news.length : 0);
console.log('');

async function recalculate() {
  const score = await calculateIndexScore(
    data.github || {},
    data.twitter || {},
    data.onchain || {},
    Array.isArray(data.news) ? data.news : [],
    data.category || 'defi'
  );

  console.log('🎯 New Scores:');
  console.log('  Overall Score:', score.overall + '/100', data.score ? `(was ${data.score}/100)` : '');
  console.log('  Team Health:', score.teamHealth + '/100');
  console.log('  Growth Score:', score.growthScore + '/100', data.scoreBreakdown?.growthScore ? `(was ${data.scoreBreakdown.growthScore}/100)` : '');
  console.log('  Social Score:', score.socialScore + '/100');
  console.log('');

  console.log('📊 Detailed Breakdown:');
  console.log('  GitHub:');
  console.log('    - Contributor Score:', score.breakdown.github.contributorScore + '/100');
  console.log('    - Activity Score:', score.breakdown.github.activityScore + '/100');
  console.log('    - Retention Score:', score.breakdown.github.retentionScore + '/100');
  console.log('  On-Chain:');
  console.log('    - Score:', score.breakdown.onchain.score + '/100');
  console.log('    - User Growth:', score.breakdown.onchain.userGrowthScore + '/100');
  console.log('    - Transaction:', score.breakdown.onchain.transactionScore + '/100');
  console.log('    - TVL:', score.breakdown.onchain.tvlScore + '/100');
  console.log('  Growth Components:');
  console.log('    - Attention Score:', score.breakdown.attentionScore + '/100');
  console.log('    - Partnership Score:', score.breakdown.partnershipScore + '/100');
  console.log('    - Web Activity:', score.breakdown.webActivityScore + '/100');
}

recalculate();
