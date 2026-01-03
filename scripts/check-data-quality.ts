import { readFileSync } from 'fs';
import { COMPANY_CONFIGS } from '../src/lib/cindex/company-configs';

console.log('📊 Data Quality Analysis\n');

const issues = {
  missing: [] as string[],
  stale: [] as string[],
  noScore: [] as string[],
  noTVL: [] as string[]
};

COMPANY_CONFIGS.forEach(config => {
  try {
    const filePath = `./data/companies/${config.slug}.json`;
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));

    // Check for scores (can be in scores.overall or score field)
    if (!data.scores?.overall && !data.score) {
      issues.noScore.push(config.slug);
    }

    // Check for TVL in DeFi protocols
    if (config.features?.hasTVL && !data.rawData?.onchain?.tvl) {
      issues.noTVL.push(config.slug);
    }

    // Check staleness using fetchedAt field
    const fetchDate = new Date(data.fetchedAt || data.metadata?.lastFetched || 0);
    const daysOld = (Date.now() - fetchDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) {
      issues.stale.push(`${config.slug} (${Math.floor(daysOld)}d)`);
    }

  } catch (err) {
    issues.missing.push(config.slug);
  }
});

console.log('❌ Missing data files:', issues.missing.length || 'None');
if (issues.missing.length) console.log('  ', issues.missing.join(', '));

console.log('\n⏰ Stale data (>7 days):', issues.stale.length || 'None');
if (issues.stale.length) console.log('  ', issues.stale.join(', '));

console.log('\n📉 Missing scores:', issues.noScore.length || 'None');
if (issues.noScore.length) console.log('  ', issues.noScore.join(', '));

console.log('\n💰 DeFi protocols missing TVL:', issues.noTVL.length || 'None');
if (issues.noTVL.length) console.log('  ', issues.noTVL.join(', '));
