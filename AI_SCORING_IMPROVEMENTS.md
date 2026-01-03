# AI-Powered Scoring Improvements

## Current State

**Rule-Based Scoring:**
- Fixed weights (40% GitHub, 35% Growth, 10% Social)
- Hard-coded benchmarks (20% retention = 100, 1M followers = 100)
- Regex keyword matching for partnerships
- Linear/log normalization

**Existing AI Usage:**
- ✅ LLMService for partnership summarization in crawler
- ✅ Basic news content analysis

**Limitations:**
- Can't understand context (false positives in keyword matching)
- Misses nuanced signals (partnership quality, sentiment)
- Fixed weights don't adapt to project stage or category
- No fraud/bot detection

---

## Quick Wins (Easy to Implement)

### 1. Enhanced Partnership Detection (High Impact, Low Effort)

**Current:** Regex keyword matching
```typescript
/\bpartnership\b/i, /\bintegration\b/i, etc.
```

**AI Improvement:** LLM-based classification
```typescript
async function analyzePartnershipQuality(
  newsItem: { title: string; content: string }
): Promise<{
  isPartnership: boolean;
  quality: 'tier1' | 'tier2' | 'tier3' | 'none';
  partnerNames: string[];
  relationshipType: 'integration' | 'collaboration' | 'investment' | 'other';
  confidence: number;
}> {
  const prompt = `
Analyze this announcement for partnership signals:

Title: ${newsItem.title}
Content: ${newsItem.content}

Extract:
1. Is this a real partnership? (vs just mentioning another company)
2. Quality tier:
   - tier1: Major collaboration with well-known company (Coinbase, Alchemy, a16z)
   - tier2: Integration with established protocol (Uniswap, Aave)
   - tier3: Smaller partnership or tool integration
3. Partner names
4. Relationship type (integration, collaboration, investment, other)

Return JSON:
{
  "isPartnership": boolean,
  "quality": "tier1" | "tier2" | "tier3" | "none",
  "partnerNames": string[],
  "relationshipType": string,
  "confidence": 0-100
}
`;

  const response = await llm.analyze(prompt);
  return JSON.parse(response);
}
```

**Scoring Impact:**
```typescript
// Old: All partnerships = same score
partnershipScore = matchCount * 20;

// New: Weighted by quality
const weights = { tier1: 50, tier2: 30, tier3: 15, none: 0 };
partnershipScore = partnerships.reduce(
  (sum, p) => sum + weights[p.quality] * (p.confidence / 100),
  0
);
```

**Example:**
```
Blog: "Building on Ethereum"
Old: No match (missing "partnership" keyword)
New: tier3 integration detected, confidence 70% → +10 points

Blog: "Strategic partnership with Coinbase Ventures"
Old: +20 points (keyword match)
New: tier1 collaboration detected, confidence 95% → +47 points
```

**Implementation:**
- Extend existing `LLMService` in `/src/lib/cindex/llm.ts`
- Update `calculatePartnershipScore()` in score-calculator.ts
- Cache results to avoid re-analyzing same news

**Estimated Impact:** +10-15 points for projects with quality partnerships

---

### 2. News Sentiment & Significance Analysis (High Impact, Medium Effort)

**Current:** Keyword counting (launch, mainnet, funding = +10 points)

**AI Improvement:** Understand what news actually means

```typescript
async function analyzeNewsSignificance(
  newsItem: { title: string; content: string }
): Promise<{
  category: 'product_launch' | 'funding' | 'milestone' | 'update' | 'damage_control';
  sentiment: 'positive' | 'neutral' | 'negative';
  significance: 0-100; // How important is this?
  signalStrength: 0-100; // Growth signal strength
}> {
  const prompt = `
Analyze this Web3 company announcement:

Title: ${newsItem.title}
Content: ${newsItem.content}

Rate:
1. Category (product_launch, funding, milestone, routine_update, damage_control)
2. Sentiment (positive, neutral, negative)
3. Significance (0-100):
   - 90-100: Major milestone (mainnet launch, Series B+, major partnership)
   - 70-89: Important (product feature, Series A, notable integration)
   - 50-69: Moderate (minor update, small partnership)
   - <50: Low (blog post, minor announcement)
4. Growth signal (0-100): How much does this indicate company growth?

Return JSON.
`;

  return await llm.analyze(prompt);
}
```

**Scoring Impact:**
```typescript
// Old: All news with keywords = same score
newsScore = matchCount * 10 * freshness;

// New: Weighted by significance and sentiment
newsScore = newsItems.reduce((sum, item) => {
  const analysis = item.aiAnalysis;
  const sentimentMultiplier = analysis.sentiment === 'positive' ? 1.2 :
                               analysis.sentiment === 'negative' ? 0.5 : 1.0;
  return sum + (analysis.signalStrength * sentimentMultiplier * freshness);
}, 0);
```

**Example:**
```
News: "Quarterly Update: Minor Bug Fixes"
Old: If contains "update" → +10 points
New: significance: 20, signalStrength: 10 → +2 points ✓ (more accurate)

News: "Mainnet Launch: $50M TVL in 24 Hours"
Old: If contains "launch" → +10 points
New: significance: 95, signalStrength: 90 → +27 points ✓ (better signal)
```

**Implementation:**
- Extend `LLMService`
- Update `calculateIndexNewsScore()` and `calculateWebScore()`
- Batch analyze all news items for a company in one LLM call

**Estimated Impact:** +5-10 points accuracy improvement, reduces noise

---

### 3. Twitter Community Quality Analysis (High Impact, High Effort)

**Current:** Count followers, likes, retweets

**AI Improvement:** Understand WHO is engaging and HOW

```typescript
async function analyzeCommunityQuality(tweets: {
  text: string;
  author: string;
  engagement: { likes: number; retweets: number; replies: number };
}[]): Promise<{
  organicEngagement: 0-100; // Real users vs bots
  influencerSupport: 0-100; // VCs, builders, influencers engaging
  sentimentScore: 0-100; // Community sentiment
  developerInterest: 0-100; // Technical discussion vs hype
}> {
  // Sample recent tweets mentioning the project
  const sampleTweets = tweets.slice(0, 20);

  const prompt = `
Analyze community engagement for this Web3 project:

Recent tweets:
${sampleTweets.map(t => `- "${t.text}" by @${t.author}`).join('\n')}

Rate (0-100):
1. Organic engagement (real users vs bots/spam)
   - Check: Genuine discussion vs copy-paste shilling
2. Influencer support
   - Mentions by VCs, known builders, crypto influencers
3. Overall sentiment (bullish/bearish/neutral)
4. Developer interest
   - Technical discussion vs pure speculation

Return JSON.
`;

  return await llm.analyze(prompt);
}
```

**Scoring Impact:**
```typescript
// Old: Social Score = (Followers 70%) + (Engagement Rate 30%)
socialScore = followersScore * 0.7 + engagementScore * 0.3;

// New: Weight by quality
const communityQuality = await analyzeCommunityQuality(tweets);
const qualityMultiplier = (
  communityQuality.organicEngagement * 0.4 +
  communityQuality.influencerSupport * 0.3 +
  communityQuality.developerInterest * 0.3
) / 100;

socialScore = (followersScore * 0.7 + engagementScore * 0.3) * qualityMultiplier;
```

**Example:**
```
Project A: 100K followers, 50% bots, no influencer mentions
Old: Social Score = 75/100
New: Social Score = 75 * 0.5 (quality multiplier) = 37/100 ✓

Project B: 10K followers, 90% organic, mentioned by Vitalik
Old: Social Score = 35/100
New: Social Score = 35 * 1.4 (quality multiplier) = 49/100 ✓
```

**Implementation:**
- Requires Twitter API v2 (recent mentions endpoint)
- Sample 20-50 recent tweets mentioning the project
- Batch analyze with LLM
- Cache results (update weekly)

**Estimated Impact:** +20-30 points accuracy, prevents gaming

---

## Medium-Term Improvements (3-6 months)

### 4. Dynamic Weight Optimization via Historical Data

**Current:** Fixed weights per category

**AI Improvement:** Learn optimal weights from historical success data

```python
# Pseudo-code (could use simple ML or even LLM few-shot learning)

# Collect historical data
training_data = [
  {
    metrics: { github: 65, growth: 45, social: 30 },
    category: "defi",
    outcome: "success" # Raised Series A, high TVL, etc.
  },
  {
    metrics: { github: 30, growth: 70, social: 80 },
    category: "defi",
    outcome: "failed" # Shut down, low adoption
  },
  # ... 100+ examples
]

# Train simple model to learn:
# - Which metrics actually correlate with success per category
# - Optimal weight distribution

optimized_weights = ml_model.optimize(training_data, category="defi")
# Output: { github: 0.45, growth: 0.40, social: 0.15 }
# vs. current: { github: 0.35, growth: 0.55, social: 0.10 }
```

**Implementation:**
- Start collecting outcome data (fundraising, TVL milestones, shutdowns)
- Use simple regression or even LLM with few-shot examples
- A/B test optimized weights vs current weights

**Estimated Impact:** 5-10% accuracy improvement across all categories

---

### 5. Early-Stage Potential Score (Predictive AI)

**Current:** All scores are backward-looking (historical metrics)

**AI Improvement:** Predict future trajectory

```typescript
async function calculatePotentialScore(company: {
  github: GitHubMetrics;
  twitter: TwitterMetrics;
  onchain: OnChainMetrics;
  news: NewsItem[];
  team: { founders: string[]; backers: string[] };
}): Promise<{
  potentialScore: 0-100;
  trajectory: 'hypergrowth' | 'growing' | 'stable' | 'declining';
  reasoning: string;
}> {
  const prompt = `
Analyze this early-stage Web3 project's potential:

Metrics (30 days):
- GitHub: ${company.github.totalCommits30d} commits, ${company.github.activeContributors30d} active contributors
- Twitter: ${company.twitter.followers} followers, growing at ${estimateGrowthRate(company.twitter)}
- On-chain: ${company.onchain.transactionCount30d} txs, ${company.onchain.uniqueWallets30d} wallets
- Recent news: ${company.news.map(n => n.title).join(', ')}
- Team: Founded by ${company.team.founders.join(', ')}
- Backed by: ${company.team.backers.join(', ')}

Based on patterns of successful Web3 projects, rate:
1. Potential Score (0-100): Likelihood of significant growth in next 6 months
2. Trajectory: hypergrowth | growing | stable | declining
3. Reasoning: 2-3 sentences explaining the rating

Consider:
- Team pedigree (successful past projects, notable backers)
- Product-market fit signals (organic growth, developer engagement)
- Market timing (is this category hot right now?)
- Network effects (partnerships, integrations building)

Return JSON.
`;

  return await llm.analyze(prompt);
}
```

**Use Cases:**
- Filter companies: "Show me high-potential early-stage projects"
- Investment signals: "Projects with low current score but high potential"
- Marketplace pricing: Factor potential into valuation

**Implementation:**
- Requires additional data: founder history, investor data
- LLM can leverage knowledge of successful project patterns
- Update monthly (slower-moving metric)

**Estimated Impact:** New dimension of analysis, helps identify diamonds in the rough

---

### 6. Anomaly Detection & Anti-Gaming

**Current:** No fraud detection

**AI Improvement:** Flag suspicious patterns

```typescript
async function detectAnomalies(company: Company): Promise<{
  flags: {
    type: 'bot_followers' | 'wash_trading' | 'fake_commits' | 'paid_partnerships';
    confidence: 0-100;
    evidence: string;
  }[];
  trustScore: 0-100; // Overall trust in metrics
}> {
  const prompt = `
Analyze these metrics for suspicious patterns:

Twitter:
- Followers: ${company.twitter.followers}
- Engagement rate: ${calculateEngagementRate(company.twitter)}
- Follower growth: ${company.twitter.followerGrowth}

GitHub:
- ${company.github.totalCommits30d} commits by ${company.github.activeContributors30d} contributors
- Top contributor: ${company.github.topContributors[0].contributions} commits (${company.github.topContributors[0].contributions / company.github.totalCommits30d * 100}% of total)

On-chain:
- ${company.onchain.transactionCount30d} transactions
- ${company.onchain.uniqueWallets30d} unique wallets
- Average txs per wallet: ${company.onchain.transactionCount30d / company.onchain.uniqueWallets30d}

Red flags to check:
1. Bot followers: Low engagement despite high follower count
2. Wash trading: High tx count but low unique wallets
3. Fake commits: Single contributor dominates (>80% of commits)
4. Bought partnerships: Many partnerships but no real integrations

Return JSON with flags and overall trust score (0-100).
`;

  return await llm.analyze(prompt);
}
```

**Scoring Impact:**
```typescript
// Penalize score based on trust
const anomalies = await detectAnomalies(company);
const trustMultiplier = anomalies.trustScore / 100;
finalScore = calculatedScore * trustMultiplier;

// Show flags on UI
if (anomalies.flags.length > 0) {
  displayWarning("⚠️ Potential anomalies detected", anomalies.flags);
}
```

**Example:**
```
Project: 500K Twitter followers, 0.01% engagement rate
Flag: bot_followers (confidence: 85%)
Trust Score: 30/100
Impact: Social Score 80 → 80 * 0.3 = 24/100
```

**Implementation:**
- Run on all companies monthly
- Display trust score prominently
- Allow users to filter out low-trust projects

**Estimated Impact:** Major credibility boost, prevents index manipulation

---

## Long-Term Vision (6-12 months)

### 7. Multimodal Analysis

**Analyze beyond text:**
- GitHub code quality (not just commit counts)
- Screenshot analysis of product UI/UX
- Documentation quality assessment
- Video content analysis (founder interviews, demos)

### 8. Competitive Intelligence

**LLM analyzes competitive landscape:**
```typescript
async function analyzeCompetitivePosition(
  company: Company,
  competitors: Company[]
): Promise<{
  marketPosition: 'leader' | 'challenger' | 'niche' | 'follower';
  differentiation: string;
  competitiveAdvantages: string[];
  threats: string[];
  marketShare: number; // Estimated
}>;
```

### 9. Real-Time Sentiment Tracking

**Monitor social sentiment continuously:**
- Twitter mentions sentiment (hourly)
- Reddit discussion analysis
- Discord/Telegram community health
- Developer forum activity

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1-2)
- ✅ Enhanced partnership detection with LLM
- ✅ News significance analysis
- Estimated cost: ~$50/month in LLM API calls

### Phase 2: Community Quality (Week 3-4)
- Twitter community analysis
- Bot detection
- Estimated cost: ~$100/month

### Phase 3: Anti-Gaming (Month 2)
- Anomaly detection system
- Trust score implementation
- Display warnings on UI

### Phase 4: Predictive Features (Month 3+)
- Potential score calculation
- Dynamic weight optimization
- Competitive analysis

---

## Cost Estimates

**Current LLM usage:**
- Partnership summarization: ~10 news items per company
- Cost: ~$0.01 per company

**With AI scoring improvements:**
- Enhanced partnership detection: ~$0.02
- News significance: ~$0.03
- Community quality: ~$0.05
- Anomaly detection: ~$0.02

**Total:** ~$0.12 per company per fetch

**For 24 companies, monthly updates:**
- Current: $0.24/month
- With AI improvements: $2.88/month

**Negligible cost increase with massive quality improvement!**

---

## Code Structure

```
/src/lib/cindex/
├── ai-scoring/
│   ├── partnership-analyzer.ts      # Enhanced partnership detection
│   ├── news-analyzer.ts              # Sentiment & significance
│   ├── community-analyzer.ts         # Twitter quality
│   ├── anomaly-detector.ts           # Fraud detection
│   └── potential-scorer.ts           # Predictive scoring
├── calculators/
│   └── score-calculator.ts           # Updated to use AI scores
└── llm.ts                            # Extended LLMService
```

---

## Expected Overall Impact

**Without AI:**
- Fabrknt score: 51/100
- Accuracy: ~70% (some gaming, noise)

**With Phase 1-2 AI:**
- Fabrknt score: 58/100 (better partnership detection)
- Accuracy: ~85% (less noise, better context)

**With Phase 3-4 AI:**
- Fabrknt score: 58/100 (same, but more trusted)
- Accuracy: ~95% (anomaly detection, predictive)
- Credibility: High (transparent AI reasoning, fraud detection)

---

## Recommendation

**Start with Phase 1** (Enhanced Partnership Detection + News Analysis):
- Highest ROI (big impact, low effort)
- Builds on existing LLMService
- Minimal cost increase
- Immediate quality improvement

**Then add Phase 2** (Community Quality):
- Prevents gaming of social metrics
- Major credibility boost
- Still low cost

**Consider Phase 3-4** once you have:
- User feedback on Phase 1-2
- Historical outcome data for ML training
- Budget for more complex features

The key is AI adds **context understanding** that rule-based scoring can't achieve. This is especially valuable for Fabrknt's goal of "showing what companies actually do, not what they say."
