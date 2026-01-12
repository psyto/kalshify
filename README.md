# FABRKNT: Risk-First DeFi Yield Intelligence

**Find sustainable yields, not just high APYs.**

**Domain:** [www.fabrknt.com](https://www.fabrknt.com)

---

## What is Fabrknt?

Fabrknt is a DeFi yield intelligence platform focused on **Solana**. Instead of chasing the highest APY, we help you find sustainable, low-risk yield opportunities through rigorous analysis and AI-powered insights.

**Our approach:** Risk-adjusted yield analysis, not raw APY chasing.

---

## Core Features

### Smart Picks
AI-curated pool recommendations based on risk-adjusted analysis:
- **Algorithmic picks** for all users (no login required)
- **Personalized recommendations** based on your preferences (requires login)
- Ranked by risk-adjusted returns, not raw APY

### Top Protocols
Compare major Solana protocols at a glance:
- **Kamino**, **Marginfi**, **Meteora**, **Save**, and more
- Protocol-level TVL, average APY, pool counts
- Click to filter the pool table by protocol

### LST Comparison
Deep dive into Solana liquid staking tokens:
- Compare Jito, Marinade, and other LSTs
- MEV yield breakdown and validator decentralization
- Peg stability and instant unstake availability

### Quick IL Calculator
Inline impermanent loss estimation:
- Enter price change to see potential IL
- Formula: `IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1`
- Educational context for LP decisions

### Pool Table
Comprehensive pool listing with intelligent defaults:
- **Low-risk pools by default** (risk score <= 20)
- APY change alerts (badges when APY drops 20%+ or rises 30%+)
- Filter by protocol, risk level, chain
- Sort by TVL, APY, risk score

---

## AI-Powered Features

### Smart Risk Insights
AI-generated analysis in plain English (requires login):
- Risk explanation and breakdown
- APY sustainability analysis
- Comparison vs. similar pools
- Actionable verdict

### Portfolio Optimizer
AI suggests optimal allocation (requires login):
- Input total amount and risk tolerance
- Get diversified portfolio suggestions
- View expected yields and risk warnings

---

## Risk Scoring

Our composite risk score (0-100) evaluates:

| Factor | Weight | Description |
|--------|--------|-------------|
| TVL Risk | 25% | Liquidity depth and exit-ability |
| APY Sustainability | 25% | Historical volatility and trends |
| IL Risk | 20% | Impermanent loss exposure for LPs |
| Stablecoin Exposure | 15% | Stability of underlying assets |
| Protocol Maturity | 15% | Age, audits, track record |

**Risk Levels:**
- **Low** (0-20): Conservative, stable yields
- **Medium** (21-40): Balanced risk-reward
- **High** (41+): Higher risk, potentially higher returns

---

## Trust & Security

| Principle | Description |
|-----------|-------------|
| **Read-Only** | We never request wallet permissions |
| **Non-Custodial** | Your keys, your funds. We never touch assets |
| **Transparent** | Our methodology is open. See [How It Works](/how-it-works) |

---

## Pages

- **/** — Yields dashboard with Smart Picks, protocols, and pool table
- **/tools** — IL Calculator and Position Simulator
- **/how-it-works** — Methodology and risk scoring explanation
- **/about** — Team and mission

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **AI:** Anthropic Claude API
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Vercel
- **Data Sources:** DeFiLlama APIs, on-chain data

---

## Getting Started

### For Users

1. **Browse Pools** — Explore yield pools filtered by low risk by default
2. **Compare Protocols** — Click protocol cards to filter the table
3. **Check IL** — Use Quick IL Calculator for LP positions
4. **Sign In** — Unlock personalized AI recommendations

### Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY, DATABASE_URL, etc.

# Run development server
pnpm dev

# Type check
pnpm type-check

# Build for production
pnpm build
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# AI
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Endpoints

### Public Endpoints

- `GET /api/curate/defi` — Yield pools with risk scoring
- `GET /api/curate/defi/history/{poolId}` — Historical APY data
- `GET /api/curate/protocols` — Protocol aggregation and comparison

### Authenticated Endpoints

- `GET /api/curate/ai/preferences` — Get user preferences
- `PUT /api/curate/ai/preferences` — Update preferences
- `POST /api/curate/ai/recommendations` — Get AI recommendations
- `GET /api/curate/ai/insights/{poolId}` — Get AI pool insights
- `POST /api/curate/ai/portfolio` — Optimize portfolio

---

## Team

**Hiroyuki Saito** — Founder
Banking & enterprise software background. AWS certified, Stanford blockchain certification. Building at the intersection of institutional finance and DeFi. Based in Tokyo.

- X (Twitter): [@psyto](https://x.com/psyto)
- LinkedIn: [hiroyuki-saito](https://www.linkedin.com/in/hiroyuki-saito/)

---

## Contact & Resources

- **Website:** [www.fabrknt.com](https://www.fabrknt.com)
- **GitHub:** [github.com/fabrknt](https://github.com/fabrknt)
- **X (Twitter):** [@fabrknt](https://x.com/fabrknt)

---

**Sustainable DeFi yields through intelligent risk analysis.**
