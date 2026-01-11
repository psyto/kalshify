# FABRKNT: DeFi Intelligence Platform

**Verify DeFi. Curate Yields. Discover Synergy.**

**Pitch decks lie. On-chain data doesn't.**

**Domain:** `www.fabrknt.com`

---

## 1. Project Overview

**Project Name:** FABRKNT

**Concept:** A DeFi Intelligence platform built for **early verification**. We help **DeFi curators, investors, and protocol teams** verify protocols using real on-chain activity, GitHub signals, and yield data — fully automated, no self-reporting.

**Products:** Three integrated products: **INDEX** (DeFi Protocol Intelligence), **CURATE** (DeFi Yield Curator Intelligence), and **SYNERGY** (Professional Partnership Discovery). INDEX provides automated verification that shows what DeFi protocols actually do — not what they say. CURATE delivers curator intelligence with risk scoring, APY stability analysis, and liquidity risk assessment. SYNERGY leverages INDEX and CURATE data to discover synergy opportunities with verified protocols.

**Architecture:** **Index → Curate → Synergy** - INDEX serves as the data foundation, CURATE adds yield intelligence for curators, and SYNERGY powers compatibility analysis and recommendations.

**Positioning:** **AI × Verified Data × DeFi Intelligence** - Maximizing automation through AI to enable intelligent curator decisions and strategic connections in the DeFi market.

---

## 2. Market Opportunity

### DeFi Market Growth

The DeFi market continues to mature, with Total Value Locked (TVL) exceeding $100B across major protocols. As the market consolidates, curators and investors need better tools to evaluate risk, stability, and exit liquidity.

### Curator Intelligence Gap

DeFi curators managing significant capital face challenges:

-   **Risk Assessment:** No standardized risk scoring across protocols
-   **Yield Stability:** APY volatility is hidden in historical data
-   **Exit Liquidity:** No tools to estimate slippage at different position sizes
-   **Protocol Due Diligence:** Manual verification of team health and on-chain activity

### Our Solution

FABRKNT provides the intelligence layer that DeFiLlama doesn't:

-   **Composite Risk Scores:** Single metric (0-100) combining TVL, APY sustainability, IL risk, protocol maturity
-   **APY Stability Analysis:** 30-day volatility, trend direction, stability scores
-   **Liquidity Risk Index:** Exit-ability ratings, slippage estimates, safe allocation guidance
-   **Protocol Verification:** Automated GitHub and on-chain activity analysis

---

## 3. Platform Architecture: Index → Curate → Synergy

### 3.1. INDEX: DeFi Protocol Intelligence

**INDEX** is an automated index that shows what DeFi protocols actually do — not what they say.

**What we verify:**

-   **On-chain growth**
    TVL trends, transaction activity, wallet metrics

-   **Team & code health**
    GitHub commits, contributors, retention, code quality

-   **Signal integrity**
    Cross-verified via blockchain and public APIs

**If it can't be verified, it doesn't count.**

**Categories:**
-   **DeFi:** DEX, lending, liquid staking, derivatives, yield, RWA, stablecoin, bridge
-   **DeFi Infrastructure:** L1, L2, oracle, dev-tools, data, security, wallet, analytics

### 3.2. CURATE: DeFi Yield Curator Intelligence

**CURATE** provides the intelligence layer for DeFi curators — risk scoring, yield stability, and exit liquidity analysis that DeFiLlama doesn't provide.

**What we analyze:**

-   **Risk Scoring**
    Composite risk score (0-100) based on TVL, APY sustainability, IL risk, stablecoin exposure, protocol maturity

-   **APY Stability**
    30-day volatility analysis, coefficient of variation, trend direction (up/down/stable)

-   **Liquidity Risk**
    Exit-ability rating, max safe allocation, slippage estimates at $100K to $10M positions

-   **Dependency Mapping**
    Chain, protocol, oracle, and asset dependencies with risk classification

**Curator-focused, not retail-focused.**

**Key Features:**

-   5,000+ yield pools from DeFiLlama with risk assessment
-   APY stability scores based on historical volatility
-   Liquidity risk index for exit strategy planning
-   Filter by risk level, stability, exitability, chain
-   Sort by TVL, APY, risk, stability, or liquidity

### 3.3. SYNERGY: Professional Partnership Discovery

**SYNERGY** enables discovery of synergy opportunities with verified DeFi protocols — powered by AI-driven compatibility analysis.

**Built for:**

-   Protocol teams seeking integrations
-   DeFi investors evaluating opportunities
-   Corp Dev teams scouting partnerships

---

## 4. Unique Value Proposition

### The Problem We Solve

DeFi curators face information asymmetry:

-   APY looks attractive — until it drops 80% next week
-   TVL is high — but you can't exit without 5% slippage
-   Protocol seems safe — until you check the GitHub
-   Risk is unclear — no standardized scoring

**Most DeFi decisions are still made on incomplete data.**

### Our Solution

**FABRKNT provides curator intelligence.**

**DeFiLlama provides raw data. FABRKNT provides answers:**

-   Is this APY sustainable? → **APY Stability Score**
-   Can I exit safely? → **Liquidity Risk Index**
-   How risky is this? → **Composite Risk Score**
-   How much should I allocate? → **Safe Allocation Guidance**

### Curate Differentiators vs DeFiLlama

| Feature | DeFiLlama | FABRKNT Curate |
|---------|-----------|----------------|
| Composite Risk Score | ❌ | ✅ 0-100 score |
| APY Stability Analysis | ❌ Raw chart | ✅ Stability score, trend |
| Liquidity Risk Index | ❌ Only TVL | ✅ Exit-ability rating |
| Safe Allocation Guidance | ❌ | ✅ Max position size |
| Slippage Estimates | ❌ | ✅ At $100K-$10M |
| Dependency Mapping | ❌ | ✅ Chain, protocol, oracle |

---

## 5. Technical Specifications

### Tech Stack

-   **Frontend:** Next.js 16, Tailwind CSS, Shadcn UI
-   **Hosting:** Vercel
-   **Backend:** PostgreSQL (Supabase)
-   **Data Sources:** DeFiLlama APIs, GitHub API, on-chain RPCs
-   **Visualization:** react-force-graph, recharts

### Data Pipeline

-   **DeFiLlama Integration:** 600+ protocols, 5,000+ yield pools
-   **APY Historical Data:** 30-day charts via `/chart/{poolId}`
-   **Risk Calculation:** Real-time scoring based on TVL, APY, IL, protocol factors
-   **Liquidity Analysis:** Protocol-aware slippage estimation

### API Endpoints

-   `GET /api/curate/defi` - Yield pools with risk scoring
-   `GET /api/cindex/search` - Protocol search with filters
-   `GET /api/cindex/companies/{slug}` - Protocol details

---

## 6. Getting Started

### For DeFi Curators

1. **Explore CURATE**
   - Browse yield pools with risk scoring
   - Filter by chain, risk level, APY stability, exitability
   - View detailed risk breakdown and liquidity analysis

2. **Verify Protocols in INDEX**
   - Check team health (GitHub activity)
   - View on-chain metrics
   - See overall verification score

### For Protocol Teams

1. **Get Verified in INDEX**
   - Your protocol is automatically tracked
   - Claim your profile to access dashboard
   - Receive transparent verification score

2. **Discover Opportunities in SYNERGY**
   - Find integration partners
   - View compatibility analysis
   - Connect with verified protocols

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Fetch DeFi data
npm run fetch:defi

# Type check
npm run type-check
```

---

## 7. Our Belief

**DeFi deserves better signals.**

-   Verification beats trust.
-   Data beats narratives.
-   Transparency compounds.

**FABRKNT is built in public — because credibility matters.**

> FABRKNT does not rank narratives.
> We index reality.

---

## 8. Contact & Resources

-   **Website:** [www.fabrknt.com](https://www.fabrknt.com)
-   **GitHub:** [github.com/fabrknt](https://github.com/fabrknt)
-   **X (Twitter):** [@fabrknt](https://x.com/fabrknt)

---

**Stop trusting claims.**
**Start verifying.**
