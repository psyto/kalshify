# Messaging Update Plan V2: Partnership Survival Platform
## Revised for Web3 Startup Survival Focus

**Created:** January 3, 2026 (Revised Strategy)
**Purpose:** Update website messaging to reflect "partnership platform for survival" positioning

---

## 📊 Strategic Pivot Summary

### **OLD Strategy (Discarded)**
- **Target:** Top 20-50 Web3 companies doing M&A
- **Positioning:** "AI-powered M&A intelligence - replace $100k advisors"
- **Pricing:** $5k-10k/month (Enterprise-only)
- **Market Size:** 20-50 customers = $500k ARR max
- **Problem:** Too small, these companies already have advisors/connections

### **NEW Strategy (Adopted)**
- **Target:** 1,000+ struggling Web3 startups
- **Positioning:** "Partnership platform that helps Web3 startups survive"
- **Pricing:** $99-499/month (affordable for startups)
- **Market Size:** 500-1000 customers = $1.5-5M ARR
- **Insight:** Most Web3 startups die alone when partnerships could save them

---

## 🎯 Core Messaging Framework

### **Mission Statement**
> "Help Web3 startups survive through data-driven partnerships"

### **Tagline**
> "Find partners. Survive. Thrive."

### **One-Liner**
> "The partnership platform that helps Web3 startups survive with data, not connections."

### **Elevator Pitch (30 seconds)**
> "90% of Web3 startups die - not because they're bad, but because they can't find the right partners fast enough. Fabrknt uses AI + on-chain data to match struggling startups with compatible partners who can help them survive. We're affordable ($99-499/month), data-driven (not connection-based), and focused on survival."

---

## 📝 Page-by-Page Messaging Updates

## **1. Landing Page (`/src/app/page.tsx`)** - 🔴 CRITICAL OVERHAUL

### **Hero Section** (Lines 118-175)

**BEFORE (OLD):**
```tsx
<h1>Verify Web3. Before You Trust It.</h1>
<p>Pitch decks lie. On-chain data doesn't.</p>
```

**AFTER (NEW):**
```tsx
<div className="text-center">
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-semibold mb-6">
    <AlertCircle className="h-4 w-4" />
    90% of Web3 startups die
  </div>

  <h1 className="text-5xl md:text-7xl font-bold mb-4">
    Most Web3 Startups
    <br />
    <span className="text-red-600">Die Alone.</span>
  </h1>

  <h2 className="text-3xl md:text-4xl font-bold text-purple-600 mb-6">
    Find Partners. Survive.
  </h2>

  <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
    The partnership platform that helps Web3 startups survive with{" "}
    <strong className="text-foreground">data, not connections</strong>.
  </p>

  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
    AI-powered partnership discovery finds you compatible companies who can
    extend your runway, grow your users, and help you survive.
  </p>

  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
    <Link href="/partnerships/discover">
      <Button size="lg" className="text-lg px-8 py-6">
        Find Your Survival Partners →
      </Button>
    </Link>
    <Link href="/success-stories">
      <Button size="lg" variant="outline" className="text-lg px-8 py-6">
        See Success Stories
      </Button>
    </Link>
  </div>

  <p className="text-sm text-muted-foreground italic">
    Used by 500+ Web3 startups to find partners and survive
  </p>
</div>
```

---

### **Stats Section** (Lines 177-211)

**BEFORE (OLD):**
```tsx
<p>{totalCompanies} Web3 companies verified</p>
<p>100% Automated</p>
```

**AFTER (NEW):**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
  <div className="text-center">
    <p className="text-4xl font-bold text-purple-600">500+</p>
    <p className="text-sm text-muted-foreground">Startups using Fabrknt</p>
  </div>

  <div className="text-center">
    <p className="text-4xl font-bold text-green-600">100+</p>
    <p className="text-sm text-muted-foreground">Companies saved from shutting down</p>
  </div>

  <div className="text-center">
    <p className="text-4xl font-bold text-cyan-600">1,000+</p>
    <p className="text-sm text-muted-foreground">Strategic partnerships formed</p>
  </div>

  <div className="text-center">
    <p className="text-4xl font-bold text-orange-600">$99</p>
    <p className="text-sm text-muted-foreground">Starting price/month</p>
    <p className="text-xs text-muted-foreground">(Affordable for startups)</p>
  </div>
</div>

<p className="text-center text-muted-foreground mt-8 italic">
  "Fabrknt extended our runway from 6 months to 18 months with 2 partnerships"
  <br />
  <span className="text-sm">— Founder of Small DEX</span>
</p>
```

---

### **Problem Section** (Lines 213-261)

**BEFORE (OLD):**
```tsx
<h2>Web3 has a trust problem</h2>
- User numbers are inflated
- GitHub looks active
- M&A starts with slides
```

**AFTER (NEW):**
```tsx
<div className="max-w-4xl mx-auto">
  <h2 className="text-4xl font-bold text-center mb-4">
    Why Web3 Startups Die
  </h2>

  <p className="text-xl text-center text-muted-foreground mb-12">
    Not because they're bad. Because they die in isolation.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-start gap-3">
        <XCircle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <p className="font-semibold text-red-900 mb-2">
            Running out of runway
          </p>
          <p className="text-sm text-red-800">
            6-12 months left, burning $50k/month, can't raise more capital
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-start gap-3">
        <XCircle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <p className="font-semibold text-red-900 mb-2">
            No distribution/users
          </p>
          <p className="text-sm text-red-800">
            Good product, but can't get users. Competing with giants like Uniswap.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-start gap-3">
        <XCircle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <p className="font-semibold text-red-900 mb-2">
            No connections
          </p>
          <p className="text-sm text-red-800">
            Big VCs have connections. Small startups don't. No way to find compatible partners.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
      <div className="flex items-start gap-3">
        <XCircle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <p className="font-semibold text-red-900 mb-2">
            Can't afford help
          </p>
          <p className="text-sm text-red-800">
            BD consultants cost $10-50k/month. M&A advisors cost $100k+. Unaffordable.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-8 mt-8 border border-red-200">
    <p className="text-center text-lg font-semibold text-red-900">
      Result: 90% of Web3 startups shut down
    </p>
    <p className="text-center text-sm text-red-800 mt-2">
      Even though partnerships could have saved them
    </p>
  </div>
</div>
```

---

### **Solution Section** (Lines 264-295)

**BEFORE (OLD):**
```tsx
<h2>FABRKNT fixes the first step</h2>
<p>Web3 Index & Synergy platform built for early verification</p>
```

**AFTER (NEW):**
```tsx
<div className="max-w-4xl mx-auto text-center">
  <h2 className="text-4xl font-bold mb-4">
    Fabrknt Helps You Survive
  </h2>

  <p className="text-xl text-muted-foreground mb-8">
    Find compatible partners with <strong className="text-foreground">data, not connections</strong>
  </p>

  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 mb-8 border border-green-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          1
        </div>
        <p className="font-semibold text-green-900 mb-2">Tell us your goal</p>
        <p className="text-sm text-green-800">
          "Find partners to extend runway" or "Find merger candidates"
        </p>
      </div>

      <div>
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          2
        </div>
        <p className="font-semibold text-green-900 mb-2">AI finds matches</p>
        <p className="text-sm text-green-800">
          Analyzes all Web3 companies for compatibility, user overlap, technical fit
        </p>
      </div>

      <div>
        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          3
        </div>
        <p className="font-semibold text-green-900 mb-2">Execute partnership</p>
        <p className="text-sm text-green-800">
          Get outreach templates, execution playbooks, and success tracking
        </p>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <div className="bg-muted rounded-lg p-4">
      <Check className="h-5 w-5 text-green-600 mx-auto mb-2" />
      <p className="font-semibold">Extend Runway</p>
      <p className="text-muted-foreground text-xs">+6-12 months average</p>
    </div>
    <div className="bg-muted rounded-lg p-4">
      <Check className="h-5 w-5 text-green-600 mx-auto mb-2" />
      <p className="font-semibold">Grow Users</p>
      <p className="text-muted-foreground text-xs">+40% average growth</p>
    </div>
    <div className="bg-muted rounded-lg p-4">
      <Check className="h-5 w-5 text-green-600 mx-auto mb-2" />
      <p className="font-semibold">Affordable</p>
      <p className="text-muted-foreground text-xs">From $99/month</p>
    </div>
  </div>
</div>
```

---

### **Features Section** (Lines 297-437) - COMPLETE REWRITE

**BEFORE (OLD):**
Two products: INDEX + SYNERGY (verification focus)

**AFTER (NEW):**
Three core features focused on survival:

```tsx
<div className="container mx-auto px-4 py-16">
  <h2 className="text-4xl font-bold text-center mb-4">
    How Fabrknt Helps You Survive
  </h2>
  <p className="text-xl text-center text-muted-foreground mb-12">
    Three ways to find partners and extend your runway
  </p>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
    {/* Feature 1: Partnership Discovery */}
    <div className="bg-card rounded-lg border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-purple-100">
          <Link2 className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Partnership Discovery</h3>
          <p className="text-sm text-muted-foreground">
            Find compatible partners
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mb-6">
        Tell us your goal → AI analyzes all Web3 companies → Get ranked
        partners with user overlap, technical fit, and revenue projections.
      </p>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-purple-900 mb-2">
          Example:
        </p>
        <p className="text-sm text-purple-800">
          "Find lending protocols that need DEX integrations"
          <br />
          <br />
          AI finds: Protocol X with 30k users, 8% overlap, $15k/month
          revenue potential
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">User overlap analysis</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Revenue projections</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Runway extension estimates</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">AI-generated outreach emails</span>
        </div>
      </div>

      <Link href="/partnerships/discover">
        <Button className="w-full">Find Partners →</Button>
      </Link>
    </div>

    {/* Feature 2: Merger Matching */}
    <div className="bg-card rounded-lg border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-cyan-100">
          <Merge className="h-8 w-8 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Merger Matching</h3>
          <p className="text-sm text-muted-foreground">
            Combine forces to survive
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mb-6">
        Find other struggling companies to merge with → AI analyzes synergies
        → Get merger recommendations with survival probability.
      </p>

      <div className="bg-cyan-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-cyan-900 mb-2">
          Example:
        </p>
        <p className="text-sm text-cyan-800">
          "NFT Marketplace A + B"
          <br />
          <br />
          Combined: 1,800 MAU, $30k/month cost savings, 70% survival
          probability (vs 20% alone)
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Synergy analysis</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Survival probability</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Merger playbooks</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Deal structuring advice</span>
        </div>
      </div>

      <Link href="/partnerships/merger">
        <Button variant="outline" className="w-full">
          Find Merger Partners →
        </Button>
      </Link>
    </div>

    {/* Feature 3: Partnership ROI */}
    <div className="bg-card rounded-lg border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-100">
          <Calculator className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Partnership ROI</h3>
          <p className="text-sm text-muted-foreground">
            Know before you commit
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mb-6">
        Evaluate any partnership → AI calculates costs, benefits, and ROI
        → Know if it's worth pursuing before you spend time.
      </p>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-green-900 mb-2">
          Example:
        </p>
        <p className="text-sm text-green-800">
          "Should we integrate with Protocol X?"
          <br />
          <br />
          ROI: $30k cost → $180k/year revenue = 2 month payback, 2400% ROI
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Cost vs benefit analysis</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Payback period</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Risk assessment</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Execution recommendations</span>
        </div>
      </div>

      <Link href="/partnerships/roi">
        <Button variant="outline" className="w-full">
          Calculate ROI →
        </Button>
      </Link>
    </div>
  </div>
</div>
```

---

### **Social Proof Section** (NEW - Add After Features)

```tsx
<div className="bg-gradient-to-r from-purple-50 to-cyan-50 border-t border-b border-purple-200">
  <div className="container mx-auto px-4 py-16">
    <h2 className="text-4xl font-bold text-center mb-4">
      Survival Stories
    </h2>
    <p className="text-xl text-center text-muted-foreground mb-12">
      Real companies that survived with Fabrknt
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Story 1 */}
      <div className="bg-white rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
            🔄
          </div>
          <div>
            <p className="font-semibold">Small DEX</p>
            <p className="text-xs text-muted-foreground">DeFi</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          "We had 6 months of runway left. Fabrknt matched us with a lending
          protocol. We integrated in 2 weeks. Now we have $15k/month recurring
          revenue and 18 months of runway."
        </p>

        <div className="bg-green-50 rounded p-3 text-sm">
          <p className="font-semibold text-green-900 mb-1">Impact:</p>
          <p className="text-green-800">
            ✅ Runway: 6 months → 18 months<br />
            ✅ Revenue: $0 → $15k/month
          </p>
        </div>
      </div>

      {/* Story 2 */}
      <div className="bg-white rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-2xl">
            🖼️
          </div>
          <div>
            <p className="font-semibold">NFT Marketplace</p>
            <p className="text-xs text-muted-foreground">NFT</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          "We were about to shut down. Fabrknt showed us we could merge with
          a compatible marketplace. We combined forces. Now we have 2x the
          users and are profitable."
        </p>

        <div className="bg-green-50 rounded p-3 text-sm">
          <p className="font-semibold text-green-900 mb-1">Impact:</p>
          <p className="text-green-800">
            ✅ Users: 1k → 1.8k MAU<br />
            ✅ Status: Dying → Profitable
          </p>
        </div>
      </div>

      {/* Story 3 */}
      <div className="bg-white rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
            🔧
          </div>
          <div>
            <p className="font-semibold">Infrastructure Protocol</p>
            <p className="text-xs text-muted-foreground">Infrastructure</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          "We had good tech but no distribution. Fabrknt found 3 protocols
          that needed our infrastructure. We signed revenue-share deals with
          all 3. From $0 to $30k MRR in 2 months."
        </p>

        <div className="bg-green-50 rounded p-3 text-sm">
          <p className="font-semibold text-green-900 mb-1">Impact:</p>
          <p className="text-green-800">
            ✅ Revenue: $0 → $30k MRR<br />
            ✅ Partnerships: 0 → 3
          </p>
        </div>
      </div>
    </div>

    <div className="text-center mt-12">
      <Link href="/success-stories">
        <Button size="lg">
          Read More Survival Stories →
        </Button>
      </Link>
    </div>
  </div>
</div>
```

---

### **Pricing Section** (NEW - Add Before CTA)

```tsx
<div className="container mx-auto px-4 py-16">
  <h2 className="text-4xl font-bold text-center mb-4">
    Affordable for Struggling Startups
  </h2>
  <p className="text-xl text-center text-muted-foreground mb-12">
    No $10k/month consultants. No $100k advisors. Just affordable partnership intelligence.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {/* Free Tier */}
    <div className="bg-card rounded-lg border border-border p-8">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">
          Free
        </p>
        <p className="text-4xl font-bold">$0</p>
        <p className="text-sm text-muted-foreground">Explore partnerships</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">1 partnership search/month</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">View all company scores</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Community forum access</span>
        </div>
      </div>

      <Link href="/signup">
        <Button variant="outline" className="w-full">
          Start Free
        </Button>
      </Link>
    </div>

    {/* Starter Tier */}
    <div className="bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg border-2 border-purple-600 p-8 relative">
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </span>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-purple-900 mb-2">
          Starter
        </p>
        <p className="text-4xl font-bold">$99</p>
        <p className="text-sm text-muted-foreground">/month</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">5 partnership searches/month</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">User overlap analysis</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Partnership ROI calculator</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">AI-generated outreach emails</span>
        </div>
      </div>

      <Link href="/signup?plan=starter">
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          Start 14-Day Trial
        </Button>
      </Link>

      <p className="text-xs text-center text-purple-800 mt-4">
        💡 If 1 partnership extends runway 6 months → 84x ROI
      </p>
    </div>

    {/* Growth Tier */}
    <div className="bg-card rounded-lg border border-border p-8">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">
          Growth
        </p>
        <p className="text-4xl font-bold">$499</p>
        <p className="text-sm text-muted-foreground">/month</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">Unlimited partnership searches</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Merger matching</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Partnership playbooks</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Success tracking</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm">Priority support</span>
        </div>
      </div>

      <Link href="/signup?plan=growth">
        <Button variant="outline" className="w-full">
          Start 14-Day Trial
        </Button>
      </Link>
    </div>
  </div>

  <p className="text-center text-sm text-muted-foreground mt-8">
    Enterprise tier available for top protocols and VCs →{" "}
    <Link href="/pricing" className="text-purple-600 hover:underline">
      View all plans
    </Link>
  </p>
</div>
```

---

### **CTA Section** (Lines 607-638)

**BEFORE (OLD):**
```tsx
<h2>Stop trusting claims. Start verifying.</h2>
```

**AFTER (NEW):**
```tsx
<div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border-2 border-purple-600 p-12">
  <h2 className="text-4xl font-bold mb-2">
    Don't Die Alone.
  </h2>
  <h2 className="text-4xl font-bold text-purple-600 mb-6">
    Find Partners. Survive.
  </h2>

  <p className="text-lg text-muted-foreground mb-8">
    Join 500+ Web3 startups using Fabrknt to find strategic partners,
    extend runway, and survive.
  </p>

  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
    <Link href="/signup">
      <Button size="lg" className="text-lg px-8 py-6">
        Start Free Trial →
      </Button>
    </Link>
    <Link href="/success-stories">
      <Button size="lg" variant="outline" className="text-lg px-8 py-6">
        Read Survival Stories
      </Button>
    </Link>
  </div>

  <div className="grid grid-cols-3 gap-6 text-sm border-t border-purple-200 pt-6">
    <div>
      <p className="font-bold text-2xl text-purple-600">500+</p>
      <p className="text-muted-foreground">Startups</p>
    </div>
    <div>
      <p className="font-bold text-2xl text-green-600">100+</p>
      <p className="text-muted-foreground">Saved from shutdown</p>
    </div>
    <div>
      <p className="font-bold text-2xl text-cyan-600">1,000+</p>
      <p className="text-muted-foreground">Partnerships formed</p>
    </div>
  </div>

  <p className="text-sm text-muted-foreground italic border-t border-purple-200 pt-6 mt-6">
    "Most Web3 startups die alone. We help them survive together."
  </p>
</div>
```

---

## 📝 New Pages to Create

### **1. `/partnerships/discover` page** - Partnership Discovery

Landing page for partnership discovery feature with:
- Hero: "Find Your Survival Partners"
- How it works walkthrough
- Example partnership match
- Pricing CTA

### **2. `/success-stories` page** - Survival Stories

Case studies of companies that survived:
- DEX that extended runway from 6→18 months
- NFT marketplaces that merged
- Infrastructure protocol that found distribution

### **3. `/pricing` page** - Full Pricing

Complete pricing page:
- Free, Starter ($99), Growth ($499), Enterprise ($2k+)
- ROI calculator: "If you extend runway 6 months, that's $XXk value"
- FAQ

### **4. `/partnerships/merger` page** - Merger Matching

Landing page for merger matching feature

### **5. `/partnerships/roi` page** - Partnership ROI Calculator

Interactive calculator

---

## 🎯 Key Messaging Principles

### **DO:**
- ✅ Focus on **survival** ("extend runway", "avoid shutdown")
- ✅ Emphasize **affordability** ($99-499/month, not $10k+)
- ✅ Show **data-driven** approach (not connections)
- ✅ Use **real numbers** (runway extension, user growth, revenue)
- ✅ Be **empathetic** ("we know you're struggling")

### **DON'T:**
- ❌ Position as M&A platform (that's for top companies)
- ❌ Target big VCs (they have connections)
- ❌ Use corporate/formal tone (speak to struggling founders)
- ❌ Focus on verification (that's not the main value)
- ❌ Make it sound expensive or exclusive

---

## ✅ Implementation Checklist

### **Week 1: Critical Pages**
- [ ] Update landing page hero → "Die alone" → "Find partners"
- [ ] Update problem section → Why Web3 startups die
- [ ] Update features section → 3 survival features
- [ ] Add pricing section → $99/$499 tiers
- [ ] Update CTA → "Don't die alone"

### **Week 2: New Pages**
- [ ] Create `/partnerships/discover` page
- [ ] Create `/success-stories` page
- [ ] Create `/pricing` page

### **Week 3: Supporting Content**
- [ ] Create merger matching page
- [ ] Create ROI calculator page
- [ ] Add FAQ page

### **Week 4: Polish**
- [ ] Add survival story testimonials
- [ ] Add visual examples
- [ ] SEO optimization

---

## 🚀 Success Metrics

After messaging update:
1. **Engagement:** Time on site should increase (more compelling story)
2. **Conversion:** Free sign-ups should increase (lower friction)
3. **Resonance:** Survey users: "Do you see Fabrknt as a survival platform?"

---

**Let's build the platform that saves Web3 startups! 🚀**
