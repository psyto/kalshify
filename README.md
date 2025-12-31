# Fabrknt Suite

> **Verified Data, Trusted Transactions** - Buy and sell Web3 services backed by verified team vitality and growth metrics

The Fabrknt Suite enables trusted Web3 service transactions through verified data. **PULSE** verifies team vitality and contribution quality. **TRACE** verifies marketing ROI and service activity. **ACQUIRE** leverages this verified backing data to power a transparent marketplace for buying and selling Web3 services with data-backed valuations.

## 🏗️ Suite Architecture

### How It Works

The Fabrknt Suite operates as an integrated ecosystem where data flows from verification to transaction:

1. **PULSE** verifies and tracks team vitality, contribution quality, and organizational health
2. **TRACE** verifies marketing ROI, service activity, and growth metrics
3. **ACQUIRE** leverages this verified backing data to enable trusted Web3 service transactions

When a project is listed on ACQUIRE, buyers can see:

- **Team Health** (from PULSE): Contribution scores, retention rates, developer activity
- **Growth Signals** (from TRACE): Marketing efficiency, user acquisition quality, service activity metrics
- **Verified Revenue**: On-chain protocol fees or verified payment data

This eliminates information asymmetry and enables high-trust business transfers in Web3.

### Applications

- **[PULSE](./apps/pulse)** (port 3001) - Team Vitality Tracking
  - Decentralized contribution scoring across GitHub, Discord, and Notion
  - Qualitative "Omotenashi Logic" rewards quality over quantity
  - Soulbound Token (SBT) rewards for milestones
  - Weekly organizational health reports

- **[TRACE](./apps/trace)** (port 3002) - Marketing Attribution & Activity Monitoring
  - High-precision click-to-wallet attribution
  - On-chain conversion tracking (mint, swap, stake, vote)
  - Bot & Sybil detection
  - Service health metrics (DAU/WAU/MAU, Protocol Activity Score)

- **[ACQUIRE](./apps/acquire)** (port 3003) - M&A Terminal for Web3
  - **Powered by verified data from PULSE and TRACE** - All listings include authenticated team vitality and growth metrics
  - Buy and sell Web3 services with complete transparency
  - Fabrknt Score composite metric combining PULSE (team health) + TRACE (growth efficiency) + revenue
  - One-click NDA with wallet signatures
  - Atomic escrow for secure asset transfers

### Shared Packages

- **[@fabrknt/ui](./packages/ui)** - Shared React components (Shadcn UI + Radix)
- **[@fabrknt/auth](./packages/auth)** - Cognito + wallet authentication
- **[@fabrknt/db](./packages/db)** - Prisma client and database utilities
- **[@fabrknt/api](./packages/api)** - API utilities, error handling, validation
- **[@fabrknt/blockchain](./packages/blockchain)** - Blockchain integrations (Solana + EVM)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd fabrknt-suite

# 2. Copy environment variables
cp .env.example .env
cp apps/pulse/.env.example apps/pulse/.env.local
cp apps/trace/.env.example apps/trace/.env.local
cp apps/acquire/.env.example apps/acquire/.env.local

# 3. Install dependencies and setup infrastructure
pnpm setup

# 4. Apply database schema
pnpm db:push

# 5. Start all apps in development mode
pnpm dev
```

### Individual App Development

```bash
# Run only PULSE
pnpm pulse:dev

# Run only TRACE
pnpm trace:dev

# Run only ACQUIRE
pnpm acquire:dev
```

## 🐳 Docker Services

Local development uses Docker Compose for PostgreSQL and Redis:

```bash
# Start services
pnpm docker:up

# Stop services
pnpm docker:down

# View logs
pnpm docker:logs
```

**Available Services:**

- PostgreSQL: `localhost:5432` (user: `fabrknt`, password: `fabrknt_dev_password`)
- Redis: `localhost:6379`
- pgAdmin: `http://localhost:5050` (admin@fabrknt.local / admin)
- Redis Commander: `http://localhost:8081`

## 📊 Database

The suite uses a shared PostgreSQL database managed by Prisma.

### Common Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (dev)
pnpm db:push

# Create migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

### Schema Overview

The database is organized into three main sections:

1. **PULSE Models**: `User`, `Organization`, `Contribution`, `Praise`, `SBTToken`, `HealthScore` - Team vitality data
2. **TRACE Models**: `Campaign`, `Click`, `Conversion`, `ActivityMetrics`, `ContractInteraction` - Growth and activity data
3. **ACQUIRE Models**: `Listing`, `SuiteRibbonData`, `NDASignature`, `ProofOfFunds`, `Escrow` - M&A transaction data that references PULSE and TRACE data

See [packages/db/prisma/schema.prisma](./packages/db/prisma/schema.prisma) for full schema.

## 🏃 Development Workflow

### Code Quality

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Run both
pnpm check

# Format code
pnpm format
```

### Build

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter @fabrknt/pulse build
```

## 📦 Monorepo Structure

```
fabrknt-suite/
├── apps/
│   ├── pulse/           # Team vitality tracking app
│   ├── trace/           # Marketing attribution app
│   └── acquire/          # M&A terminal app
├── packages/
│   ├── ui/              # Shared UI components
│   ├── auth/            # Authentication utilities
│   ├── db/              # Database & Prisma client
│   ├── api/             # API utilities
│   └── blockchain/      # Blockchain integrations
├── infrastructure/      # Infrastructure & development tools
│   ├── docker-compose.yml  # Local dev services (PostgreSQL, Redis)
│   ├── init-db.sql         # Database initialization
│   └── ...                 # CDK stacks, Lambda handlers
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace config
```

## 🔐 Environment Variables

Each app requires specific environment variables:

### Shared (all apps)

- `DATABASE_URL` - PostgreSQL connection string
- `COGNITO_*` - AWS Cognito configuration

### PULSE Specific

- `GITHUB_*` - GitHub App credentials
- `DISCORD_*` - Discord bot credentials
- `CHAINLINK_*` - Chainlink Functions for SBT minting

### TRACE Specific

- `ALCHEMY_*` - Alchemy API for EVM event tracking
- `HELIUS_*` - Helius API for Solana event tracking
- `REDIS_URL` - Redis connection string

### ACQUIRE Specific

- `PULSE_API_*` - PULSE API integration (to fetch team vitality data)
- `TRACE_API_*` - TRACE API integration (to fetch growth and activity data)
- Escrow contract addresses

See `.env.example` files for complete configuration.

## 🚢 Deployment

All three apps are designed to deploy on AWS Amplify with the following AWS services:

- **Frontend**: AWS Amplify
- **Backend**: AWS Lambda + API Gateway
- **Database**: Amazon RDS PostgreSQL
- **Cache**: Amazon ElastiCache Redis (TRACE only)
- **Auth**: Amazon Cognito
- **Storage**: Amazon S3
- **Monitoring**: Amazon CloudWatch

See individual app `amplify.yml` files for deployment configurations.

## 📝 Tech Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI + Radix UI
- Recharts/Nivo (charts)
- TanStack Query
- Zustand (state management)

### Backend

- Node.js 20
- Prisma ORM
- PostgreSQL 16
- Redis 7
- Zod (validation)

### Blockchain

- Solana Web3.js
- Viem (EVM)
- Alchemy SDK
- Helius DAS API

### DevOps

- Turborepo (monorepo)
- pnpm (package manager)
- Docker Compose (local dev)
- AWS Amplify (deployment)

## 🗺️ Roadmap

### Phase 0: Foundation ✅

- [x] Monorepo setup
- [x] Shared packages
- [x] Database schema
- [x] Basic app structure
- [x] Docker environment

### Phase 1: TRACE Implementation

- [ ] Core attribution engine
- [ ] On-chain event processing
- [ ] Activity monitoring (DAU/WAU/MAU)
- [ ] Link redirection service

### Phase 2: PULSE Implementation

- [ ] Contribution tracking
- [ ] Platform integrations (GitHub, Discord, Notion)
- [ ] Omotenashi scoring algorithm
- [ ] SBT minting

### Phase 3: ACQUIRE Implementation

- [ ] Listing engine with PULSE + TRACE data integration
- [ ] Suite Ribbon component displaying verified data from PULSE and TRACE
- [ ] Fabrknt Score calculation (combining team vitality + growth + revenue)
- [ ] Atomic escrow contracts
- [ ] NDA & Proof of Funds
- [ ] Buyer interface with audit view of backing data

### Phase 4: Integration & Polish

- [ ] Cross-app integration
- [ ] Analytics & monitoring
- [ ] Documentation
- [ ] Beta testing

### Phase 5: Production Launch

- [ ] Security audit
- [ ] Performance optimization
- [ ] Staged rollout (TRACE → PULSE → ACQUIRE)

## 🔗 Related Projects

- **[@fabrknt/sdk](https://github.com/fabrknt/sdk)** - The core Fabrknt SDK for building crypto financial operations (separate repository)

## 🤝 Contributing

This is a private monorepo. For development:

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` before committing
4. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ by the Fabrknt team**
