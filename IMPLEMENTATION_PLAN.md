# Fabrknt Implementation Plan
## Building Tinder-Like Matching on Existing INDEX + SYNERGY

**Created:** January 3, 2026
**Approach:** Web-First PWA (Progressive Web App)

---

## 🎯 What We're Building

**Transform Fabrknt from:**
- Research platform (browse companies, analyze partnerships)

**Into:**
- Tinder-like matching platform (claim profile, swipe on partners, execute partnerships)

**While keeping:**
- All existing INDEX and SYNERGY features
- All existing data collection infrastructure
- Next.js web stack

---

## ✅ What We Already Have (Don't Rebuild)

### **1. Data Collection System** ✅
- On-chain metrics (TVL, users, transactions)
- GitHub metrics (commits, contributors, code quality)
- Twitter metrics (followers, engagement)
- DefiLlama integration
- LLM service (Gemini 2.0 Flash)
- **Status:** Working perfectly, keep using it

### **2. Company Profiles** ✅
- 23 companies configured in `company-configs.ts`
- Auto-generated from verified data
- JSON files in `/data/companies/`
- Scores calculated automatically
- **Status:** This IS the foundation for auto-generated profiles!

### **3. Website** ✅
- Next.js + React + Tailwind CSS
- `/index` page - Browse all companies
- `/synergy` page - Analyze partnerships
- Responsive design already
- **Status:** Build on top of this, don't recreate

### **4. AI Analysis** ✅
- LLM service in `/src/lib/cindex/llm.ts`
- Partnership detection working
- Quality scoring (tier1/tier2/tier3)
- **Status:** Extend for matching algorithm

---

## 🆕 What We Need to Build (New Features)

### **Phase 1: Profile Claiming (Month 1)**

**What:** Let founders claim their auto-generated profiles

**How:**
1. Add user authentication (NextAuth.js)
2. Add "Claim This Profile" button to company pages
3. Verification methods:
   - Domain verification (add TXT record to DNS)
   - GitHub org verification (add user to org)
   - Wallet signature (sign with treasury wallet)
4. Store claimed profiles in database

**Files to create/modify:**
```
/src/app/api/auth/[...nextauth]/route.ts  (NEW - auth)
/src/app/claim-profile/page.tsx           (NEW - claim flow)
/src/components/ClaimProfileButton.tsx    (NEW - UI component)
/src/lib/db/schema.ts                     (MODIFY - add claimed_profiles table)
```

**Deliverable:** Founders can claim their profiles

---

### **Phase 2: Matching Algorithm (Month 1)**

**What:** AI ranks compatible partners for each company

**How:**
1. Extend existing SYNERGY analysis
2. Calculate compatibility for all company pairs:
   - User overlap (on-chain address intersection)
   - Technical fit (GitHub tech stack similarity)
   - Category compatibility (DeFi+DeFi, NFT+Gaming, etc.)
3. Use existing LLM service to generate partnership recommendations
4. Store match scores in database

**Files to create/modify:**
```
/src/lib/cindex/matching-engine.ts        (NEW - matching logic)
/src/lib/cindex/synergy.ts                (MODIFY - extend for matching)
/scripts/generate-matches.ts              (NEW - batch generate matches)
```

**Algorithm:**
```typescript
function calculateMatchScore(companyA, companyB): MatchScore {
  // Use existing INDEX data
  const userOverlap = calculateUserOverlap(companyA.onchain, companyB.onchain)
  const technicalFit = analyzeTechStack(companyA.github, companyB.github)
  const categoryFit = categoryCompatibility(companyA.category, companyB.category)

  // Use existing LLM service
  const aiRecommendation = await llmService.analyzePartnershipPotential({
    companyA: companyA.name,
    companyB: companyB.name,
    metrics: { userOverlap, technicalFit, categoryFit }
  })

  return {
    score: weightedAverage(userOverlap, technicalFit, categoryFit),
    reasoning: aiRecommendation,
    projectedImpact: calculateImpact(companyA, companyB)
  }
}
```

**Deliverable:** Every company has ranked list of compatible partners

---

### **Phase 3: Swipe Interface (Month 2)**

**What:** Tinder-like UI for browsing and swiping on partners

**How:**
1. Build card-based UI component
2. Add swipe gestures (using framer-motion or react-swipeable)
3. Responsive design:
   - Desktop: Click buttons, grid view
   - Mobile: Swipe gestures, card-based
4. Track swipe actions (interested, passed, super_like)

**Files to create:**
```
/src/app/partnerships/discover/page.tsx   (NEW - main matching page)
/src/components/PartnerCard.tsx           (NEW - swipeable card)
/src/components/SwipeInterface.tsx        (NEW - swipe logic)
/src/hooks/useSwipeGestures.ts            (NEW - gesture handling)
```

**UI Design:**

**Mobile (Swipe):**
```tsx
<SwipeInterface>
  <PartnerCard
    company={partner}
    matchScore={94}
    onSwipeLeft={() => handlePass()}
    onSwipeRight={() => handleInterested()}
  >
    <h2>Lending Protocol X</h2>
    <p>Match: 94%</p>
    <p>User overlap: 8%</p>
    <p>Runway impact: +8 months</p>
  </PartnerCard>
</SwipeInterface>
```

**Desktop (Grid):**
```tsx
<div className="grid grid-cols-3 gap-4">
  {matches.map(partner => (
    <PartnerCard company={partner}>
      <Button onClick={() => handlePass()}>Pass</Button>
      <Button onClick={() => handleInterested()}>Interested</Button>
    </PartnerCard>
  ))}
</div>
```

**Deliverable:** Working swipe interface on web (desktop + mobile)

---

### **Phase 4: Mutual Matches (Month 2)**

**What:** When both companies swipe right, they match

**How:**
1. Track swipe actions in database
2. Detect mutual matches (both swiped right)
3. Send notifications (email + in-app)
4. Enable direct communication
5. Provide partnership playbooks

**Files to create:**
```
/src/app/partnerships/matches/page.tsx    (NEW - show mutual matches)
/src/components/MatchNotification.tsx     (NEW - notification UI)
/src/lib/notifications/email.ts           (NEW - email service)
/src/lib/db/schema.ts                     (MODIFY - add swipes, matches tables)
```

**Database schema:**
```sql
-- Track swipe actions
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_slug VARCHAR,
  partner_slug VARCHAR,
  action VARCHAR CHECK (action IN ('interested', 'passed', 'super_like')),
  created_at TIMESTAMP
);

-- Track mutual matches
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  company_a_slug VARCHAR,
  company_b_slug VARCHAR,
  matched_at TIMESTAMP,
  status VARCHAR CHECK (status IN ('new', 'chatting', 'partnership_started', 'completed'))
);
```

**Notification flow:**
```
User A swipes right on User B
  ↓
Check: Did User B already swipe right on User A?
  ↓
YES → Mutual Match!
  ↓
Send email to both:
  "🎉 It's a Match! Company X wants to partner with you"
  ↓
Enable chat + partnership playbook
```

**Deliverable:** Mutual match system working with notifications

---

### **Phase 5: PWA Conversion (Month 3)**

**What:** Make web app installable on mobile like a native app

**How:**
1. Install `next-pwa` package
2. Configure PWA settings
3. Add service worker
4. Add web app manifest
5. Enable push notifications

**Files to create/modify:**
```
/next.config.js                           (MODIFY - add PWA config)
/public/manifest.json                     (NEW - app manifest)
/public/sw.js                             (NEW - service worker, auto-generated)
```

**Configuration:**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // ... existing Next.js config
})
```

**PWA Features:**
- ✅ Install on home screen (looks like native app)
- ✅ Offline support (cached pages)
- ✅ Push notifications (mutual matches)
- ✅ Full-screen mode
- ✅ Fast loading

**Deliverable:** PWA working on iOS + Android

---

## 📊 Database Schema Changes

**New tables needed:**

```sql
-- User accounts (for claiming profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  created_at TIMESTAMP
);

-- Claimed profiles (link user to company)
CREATE TABLE claimed_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_slug VARCHAR UNIQUE,
  verification_method VARCHAR, -- 'domain', 'github', 'wallet'
  verified_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Swipe actions
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_slug VARCHAR,      -- User's company
  partner_slug VARCHAR,      -- Company they swiped on
  action VARCHAR,            -- 'interested', 'passed', 'super_like'
  created_at TIMESTAMP,
  UNIQUE(company_slug, partner_slug)
);

-- Mutual matches
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  company_a_slug VARCHAR,
  company_b_slug VARCHAR,
  matched_at TIMESTAMP,
  status VARCHAR DEFAULT 'new',
  UNIQUE(company_a_slug, company_b_slug)
);

-- Partnership executions (tracking)
CREATE TABLE partnerships (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  partnership_type VARCHAR,  -- 'integration', 'co-marketing', 'merger'
  status VARCHAR,            -- 'discussing', 'in_progress', 'live'
  metrics JSONB,             -- Track KPIs (revenue, users, etc.)
  created_at TIMESTAMP
);
```

---

## 🎨 New Pages & Routes

```
Current pages (keep):
/                          Landing page
/index                     Browse companies (INDEX)
/synergy                   Analyze partnerships (SYNERGY)
/index/[slug]              Company detail page

New pages (add):
/claim-profile             Claim your auto-generated profile
/partnerships/discover     Swipe on partners (Tinder-like)
/partnerships/matches      View mutual matches
/partnerships/[id]         Partnership detail & chat
/pricing                   Pricing tiers
/success-stories           Case studies
```

---

## 🛠️ Tech Stack

**Existing (keep using):**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript
- Existing API integrations (DefiLlama, GitHub, Twitter)
- Existing LLM service (Gemini)

**New packages to add:**
```bash
# Authentication
pnpm add next-auth
pnpm add @auth/prisma-adapter

# Database (if not already using)
pnpm add prisma
pnpm add @prisma/client

# Gestures & animations
pnpm add framer-motion
# or
pnpm add react-swipeable

# PWA
pnpm add next-pwa

# Email notifications
pnpm add resend
# or
pnpm add nodemailer
```

---

## 📅 3-Month Timeline

### **Month 1: Foundation**
- Week 1: Add user auth (NextAuth.js)
- Week 2: Profile claiming flow
- Week 3: Build matching algorithm
- Week 4: Generate matches for 100 companies

### **Month 2: UI**
- Week 1: Build swipe interface (desktop + mobile)
- Week 2: Mutual match system
- Week 3: Notifications (email + in-app)
- Week 4: Partnership playbooks

### **Month 3: Launch**
- Week 1: Convert to PWA
- Week 2: Testing & polish
- Week 3: Viral launch campaign (email 100 founders)
- Week 4: Monitor metrics, iterate

---

## 🎯 Success Metrics

### **Month 1:**
- 100 companies with profiles
- Matching algorithm working
- Profile claim flow live

### **Month 2:**
- 50 claimed profiles
- 20 mutual matches
- Swipe interface working on desktop + mobile

### **Month 3:**
- 100 claimed profiles
- 50 mutual matches
- 10 executed partnerships
- PWA installed by 50+ users

### **Month 6:**
- 500 claimed profiles
- 100 paid subscribers ($99/month tier)
- 100 executed partnerships
- $100k ARR

---

## 💡 Key Principles

1. **Don't recreate - build on existing**
   - Use INDEX data for profiles
   - Extend SYNERGY for matching
   - Keep all current features

2. **Web-first, mobile-optimized**
   - Responsive design works everywhere
   - PWA gives app-like feel
   - React Native only if needed later

3. **Start small, scale up**
   - 100 companies first, not 1000
   - Manual onboarding initially
   - Automate as we scale

4. **Verified data only**
   - No user-entered data
   - All metrics from on-chain/online sources
   - Web3-native approach

---

## 🚀 Ready to Start?

**First step:** Add user authentication (NextAuth.js)

```bash
# Install dependencies
pnpm add next-auth @auth/prisma-adapter

# Create auth route
mkdir -p src/app/api/auth/[...nextauth]
touch src/app/api/auth/[...nextauth]/route.ts
```

Then build from there! 🎉
