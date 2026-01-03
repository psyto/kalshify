# Uniswap Scoring Issue - Root Cause Analysis & Fixes

## Current State: Overall Score = 4/100 (WRONG!)

Uniswap, the leading DEX with $5B TVL, is scoring 4/100. This is completely inaccurate.

---

## Root Cause Analysis

### Issue 1: Twitter API Returned All Zeros ❌

**Data:**
```json
"twitter": {
  "followers": 0,
  "following": 0,
  "tweetCount": 0,
  "verified": false,
  "engagement30d": { "likes": 0, "retweets": 0, "replies": 0 }
}
```

**Impact:** Social Score = 0/100

**Root Cause:**
- Twitter API fetch timed out (even with 20min timeout)
- OR rate limit hit
- OR authentication failed

**Fix Required:**
1. Check Twitter Bearer Token is valid
2. Check rate limit status
3. Debug Twitter API errors in logs
4. Consider caching Twitter data and refreshing weekly instead of per-fetch

---

### Issue 2: On-Chain Metrics Are Wrong ❌

**Data:**
```json
"onchain": {
  "transactionCount30d": 197,
  "uniqueWallets30d": 209,
  "contractAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984"  // V3 Factory
}
```

**Scores:**
```
userGrowthScore = 0
transactionScore = 0
tvlScore = 0 (no TVL data!)
```

**Root Cause:**

**Problem A: Fetching Wrong Contract**
The code fetches the Uniswap V3 **Factory** contract, which only emits events when new pools are created (197 in 30d). This completely misses the actual swap activity!

Real Uniswap metrics:
- Millions of swaps per month across all pools
- $5B+ TVL
- Hundreds of thousands of daily users

**Problem B: No TVL Data**
The `getUniswapMetrics()` function doesn't fetch TVL at all.

**Problem C: Benchmarks Too High**
Even if we were fetching pool data correctly:
- 197 transactions normalized against 1,000,000 = 0.02% = 0
- 209 wallets normalized against 100,000 = 0.2% = 0

**Fixes Required:**

#### Fix 2A: Lower Benchmarks (✅ Already Done)

I've adjusted the benchmarks in `/src/lib/cindex/calculators/score-calculator.ts`:

```typescript
// Before:
userGrowthScore = normalize(209, 0, 100000) = 0
transactionScore = normalize(197, 0, 1000000) = 0

// After:
userGrowthScore = normalize(209, 10, 10000) = 2/100
transactionScore = normalize(197, 10, 100000) = 0/100  // Still too low!
```

This helps but transaction score is still 0.

#### Fix 2B: Implement Proper Uniswap Metrics (NEEDED)

**Option 1: Use DefiLlama API (Recommended)**

Add to `/src/lib/api/defillama.ts`:

```typescript
export async function getProtocolMetrics(protocol: string): Promise<{
  tvl: number;
  volume24h?: number;
  fees24h?: number;
}> {
  const response = await fetch(
    `https://api.llama.fi/protocol/${protocol}`
  );
  const data = await response.json();

  return {
    tvl: data.tvl || 0,
    volume24h: data.volume24h || 0,
    fees24h: data.fees24h || 0,
  };
}
```

Update `/src/lib/api/ethereum.ts`:

```typescript
import { getProtocolMetrics } from './defillama';

export async function getUniswapMetrics(): Promise<Partial<OnChainMetrics>> {
  // Get real metrics from DefiLlama
  const defiMetrics = await getProtocolMetrics('uniswap');

  // Estimate daily users based on volume (rough approximation)
  const estimatedDailyUsers = defiMetrics.volume24h
    ? Math.floor(defiMetrics.volume24h / 1000) // Assume $1000 avg trade size
    : 0;

  return {
    contractAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    chain: "ethereum",
    tvl: defiMetrics.tvl,
    transactionCount30d: estimatedDailyUsers * 30, // Rough estimate
    uniqueWallets30d: Math.floor(estimatedDailyUsers * 20), // 20x monthly vs daily
    monthlyActiveUsers: Math.floor(estimatedDailyUsers * 20),
    dailyActiveUsers: estimatedDailyUsers,
    transactionCount24h: estimatedDailyUsers,
    transactionCount7d: estimatedDailyUsers * 7,
    uniqueWallets24h: estimatedDailyUsers,
    uniqueWallets7d: Math.floor(estimatedDailyUsers * 5),
  };
}
```

**Option 2: Use Aggregated Pool Data (Complex)**

Query all Uniswap pools and aggregate their swaps. This requires:
- Getting list of all pools from factory
- Fetching swap events from each pool
- Aggregating volume, users, etc.

**Much more complex and slow. Not recommended.**

---

### Issue 3: No News/Blog Data ❌

**Data:**
```json
// No news field at all!
```

**Impact:**
- Partnership Score = 0
- News Growth Score = 0
- Web Activity Score = 0

**Root Cause:**
The `company-configs.ts` doesn't have `blogUrl` or `mediumUrl` for Uniswap.

**Fix:**

Update `/src/lib/cindex/company-configs.ts`:

```typescript
{
  slug: "uniswap",
  name: "Uniswap",
  category: "defi",
  // ... existing fields
  blogUrl: "https://blog.uniswap.org",  // ADD THIS
  mediumUrl: "https://uniswap.medium.com",  // ADD THIS (if exists)
}
```

This will enable news crawling and partnership detection.

---

## Expected Scores After Fixes

### Current (Broken):
```
Team Health: 57/100 (0 commits hurts, but 54 contributors helps)
Growth: 0/100 (all on-chain metrics are 0)
Social: 0/100 (Twitter failed)
Overall: 4/100
```

### After Fixes:
```
Team Health: 57/100 (same, but this is actually reasonable)

Growth: ~75/100
- On-chain with real data:
  - TVL = $5B → tvlScore = 92/100
  - DAU ~50,000 → userGrowthScore = 100/100
  - Txs ~1.5M/month → transactionScore = 100/100
  - On-chain score = 97/100
- Partnerships from blog → ~30/100
- Combined growth = 97*0.35 + 30*0.2 = ~40/100

Wait, that's still only 40. Let me recalculate...

Actually, if on-chain txs are high (1.5M), the formula is:
Growth = (OnChain * 0.35) + (News * 0.25) + (Partnerships * 0.20) + (Attention * 0.20)

With on-chain = 97, partnerships = 30, news = 0, attention requires Twitter:
Growth = (97 * 0.35) + (0 * 0.25) + (30 * 0.20) + (0 * 0.20)
       = 33.95 + 0 + 6 + 0
       = 40/100

Hmm, still only 40 because we're missing Twitter (attention) and news.

Social: ~80/100 (if Twitter works)
- Uniswap has ~1M followers
- High engagement rate
- Social score = ~80/100

Overall (DeFi weights: 35% GitHub, 55% Growth, 10% Social):
= (57 * 0.35) + (40 * 0.55) + (80 * 0.10)
= 19.95 + 22 + 8
= 50/100

Still only 50 because GitHub score is low (0 commits) and we don't have news data.

If we fix Twitter AND add news:
Growth = (97 * 0.35) + (40 * 0.25) + (30 * 0.20) + (50 * 0.20)
       = 33.95 + 10 + 6 + 10
       = 60/100

Overall = (57 * 0.35) + (60 * 0.55) + (80 * 0.10)
        = 19.95 + 33 + 8
        = 61/100

Better, but still only 61 because of low GitHub activity.
```

**The real issue:** Uniswap's V3 interface repo (`github.com/Uniswap/interface`) has low recent activity because it's mature. This is actually normal for established protocols!

---

## Immediate Action Plan

### Priority 1: Fix Twitter API ⚡

**Test Twitter API:**
```bash
curl -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
  "https://api.twitter.com/2/users/by/username/Uniswap?user.fields=public_metrics"
```

Expected response:
```json
{
  "data": {
    "id": "1234567890",
    "name": "Uniswap",
    "username": "Uniswap",
    "public_metrics": {
      "followers_count": 1000000,
      "following_count": 100,
      "tweet_count": 5000
    }
  }
}
```

If this works, the issue is in `/src/lib/api/twitter.ts`. Debug the fetch logic.

### Priority 2: Implement DefiLlama Integration ⚡

1. Create `/src/lib/api/defillama.ts`
2. Update `getUniswapMetrics()` to use DefiLlama
3. Test with: `pnpm fetch:company uniswap`

### Priority 3: Add Blog URL 🔧

Update `company-configs.ts` with Uniswap blog URL.

### Priority 4: Re-fetch Data 🔄

```bash
pnpm fetch:company uniswap
pnpm seed:companies
```

---

## Long-Term Fix: Consider GitHub Activity Differently

**Problem:** Mature protocols with stable codebases naturally have lower commit activity.

**Solution:** Adjust scoring for mature vs. early-stage projects:

```typescript
// In score-calculator.ts
if (github.totalContributors > 50 && github.totalCommits30d < 50) {
  // Mature project - don't penalize low activity as much
  // Reduce activity weight, increase retention weight
  const matureScore = contributorScore * 0.6 + activityScore * 0.2 + retentionScore * 0.2;
} else {
  // Standard scoring
  const score = contributorScore * 0.4 + activityScore * 0.4 + retentionScore * 0.2;
}
```

---

## Summary

**Critical Fixes Needed:**
1. ✅ Lower on-chain benchmarks (Done)
2. ❌ Fix Twitter API (Debug needed)
3. ❌ Implement DefiLlama TVL fetching (New code needed)
4. ❌ Add Uniswap blog URL (Config change)
5. ❌ Consider mature project scoring (Enhancement)

**Expected Result After All Fixes:**
- Current: 4/100
- After fixes: 60-70/100 (reasonable for a mature protocol with low recent commits)

The score will never be 95+/100 unless Uniswap has more recent GitHub activity, but 60-70 is fair and accurate.
