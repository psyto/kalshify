import Link from "next/link";
import {
    ArrowRight,
    Percent,
    Link2,
    TrendingUp,
    Shield,
    Users,
    Building2,
    Github,
    Activity,
    Droplet,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/logo";
import { LandingHeader } from "@/components/landing-header";
import { SynergyCTA, SynergyCTACard } from "@/components/synergy-cta";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

async function getCompanyStats() {
    try {
        const [companyCount, listedCount, avgScore] = await Promise.all([
            prisma.company.count({ where: { isActive: true } }),
            prisma.company.count({ where: { isActive: true, isListed: true } }),
            prisma.company.aggregate({
                where: { isActive: true },
                _avg: { overallScore: true },
            }),
        ]);

        return {
            totalCompanies: companyCount,
            listedCompanies: listedCount,
            avgScore: Math.round(avgScore._avg.overallScore || 0),
        };
    } catch (error) {
        console.error("Error fetching company stats:", error);
        // Return fallback values on error
        return {
            totalCompanies: 0,
            listedCompanies: 0,
            avgScore: 0,
        };
    }
}

async function getListingStats() {
    try {
        const activeListings = await prisma.listing.count({
            where: { status: "active" },
        });

        return { activeListings };
    } catch (error) {
        console.error("Error fetching listing stats:", error);
        // Return fallback values on error
        return { activeListings: 0 };
    }
}

export default async function SuiteLandingPage() {
    const [companyStats, listingStats] = await Promise.all([
        getCompanyStats(),
        getListingStats(),
    ]);

    const totalCompanies = companyStats.totalCompanies;
    const listedCompanies = companyStats.listedCompanies;
    const activeListings = listingStats.activeListings;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <LandingHeader />

            {/* Hero Section */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <div className="flex justify-center mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-sm font-semibold font-mono">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                </span>
                                PREVIEW
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            DeFi Intelligence Platform
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                            Risk scoring. Yield analysis. Opportunity discovery.
                        </p>
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                            Building the foundation for{" "}
                            <span className="text-cyan-400 font-semibold">
                                AI-powered curation
                            </span>
                            .
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/curate"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all font-bold text-lg border border-cyan-300 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
                            >
                                <Percent className="h-6 w-6" />
                                Explore DeFi Intelligence
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <SynergyCTA variant="primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center mb-8">
                    <p className="text-lg text-muted-foreground">
                        Built for teams making million-dollar decisions
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-2">
                            {totalCompanies}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            DeFi protocols fully verified
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-cyan-400 font-mono mb-2">
                            100%
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                            Automated — no manual input
                        </p>
                        <p className="text-sm text-muted-foreground">
                            On-chain + GitHub + npm + social signals
                        </p>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto text-center mt-8">
                    <p className="text-sm text-muted-foreground italic">
                        Used by teams who can't afford to trust unverifiable
                        metrics.
                    </p>
                </div>
            </div>

            {/* Problem Section */}
            <div className="bg-card border-t border-b border-border">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground text-center mb-8">
                            DeFi has an intelligence gap
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        APY looks great — until it drops 80% next week
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💧</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        TVL is high — but you can't exit without 5% slippage
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        Risk is unclear — no standardized scoring
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔍</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        Opportunities exist — but discovery is manual
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-lg font-semibold text-muted-foreground">
                            Raw data exists. Intelligence doesn't.
                        </p>
                    </div>
                </div>
            </div>

            {/* Solution Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        FABRKNT bridges the gap
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Three pillars of DeFi intelligence, building toward{" "}
                        <span className="text-cyan-400 font-semibold">
                            AI-powered curation
                        </span>
                        .
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card rounded-lg border border-border p-6">
                            <Shield className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground mb-2">
                                Risk Scoring
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Composite scores combining TVL, APY sustainability, IL risk, and protocol maturity
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-border p-6">
                            <Activity className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground mb-2">
                                Yield Analysis
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                APY stability, liquidity risk, exit-ability ratings, and slippage estimates
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-emerald-500/30 p-6">
                            <Link2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-foreground mb-2">
                                Opportunity Discovery
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                AI-powered matching for partnerships, integrations, and strategic opportunities
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        100% automated verification. No self-reported metrics.
                    </p>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 pt-4 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* CURATE Product - Main Product */}
                    <div className="bg-card rounded-lg border border-cyan-400/30 p-8 shadow-lg shadow-cyan-400/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/30">
                                <Percent className="h-8 w-8 text-cyan-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        CURATE
                                    </h2>
                                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-mono">
                                        Beta
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    DeFi Intelligence Platform
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Risk scoring, APY stability analysis, liquidity risk assessment,
                            and verified protocol data — the intelligence layer for DeFi curators.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Risk Scoring
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Composite scores for 5,000+ pools
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Activity className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        APY Stability
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        30-day volatility and trends
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Droplet className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Liquidity Risk
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Exit-ability and slippage estimates
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Protocol Verification
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        GitHub, on-chain, social signals
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-cyan-400 mb-6">
                            Curator intelligence, not just raw data.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/curate"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all font-bold justify-center border border-cyan-300 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40 flex-1"
                            >
                                Explore Yields
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/curate/protocols"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all font-bold justify-center border border-slate-700 flex-1"
                            >
                                Browse Protocols
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* SYNERGY Product */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <Link2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    SYNERGY
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Partnership Discovery
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Find acquisition targets, integration partners, and strategic
                            opportunities — quietly, using verified data.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Corp Dev teams scouting quietly
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Integration and acquisition opportunities
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Early M&A conversations
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            AI-powered compatibility scoring based on{" "}
                            <strong className="text-foreground">
                                verified data
                            </strong>
                            , not pitch decks.
                        </p>

                        <SynergyCTACard />
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-card border-t border-b border-border">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                            How it works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-cyan-400 font-mono">
                                        1
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Verify
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    We automatically analyze on-chain data,
                                    GitHub activity, npm downloads, and social signals
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-cyan-400 font-mono">
                                        2
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Curate
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Browse yield pools with risk scoring,
                                    APY stability, and liquidity risk assessment
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-emerald-500 font-mono">
                                        3
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Discover
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Find synergy opportunities with AI-powered
                                    compatibility matching
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Who It's For */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                        Who FABRKNT is for
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card rounded-lg border border-border p-6 text-center">
                            <TrendingUp className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                DeFi Curators
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Risk scoring and yield intelligence for smarter position management.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-border p-6 text-center">
                            <Users className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Protocol Teams
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Get discovered for what you actually build — verified, not marketed.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-border p-6 text-center">
                            <Building2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Corp Dev Teams
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Find integration and acquisition opportunities with verified data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Belief Section */}
            <div className="bg-card border-t border-b border-border">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-6">
                            Our belief
                        </h2>
                        <p className="text-2xl font-bold text-cyan-400 mb-8">
                            DeFi intelligence will be automated.
                        </p>
                        <div className="space-y-2 text-lg text-muted-foreground mb-8">
                            <p>Verification beats trust.</p>
                            <p>Data beats narratives.</p>
                            <p>AI scales human judgment.</p>
                        </div>
                        <p className="text-muted-foreground">
                            We're building the foundation for AI-powered curation — one verified data point at a time.
                        </p>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            About FABRKNT
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Building the intelligence layer for{" "}
                            <strong className="text-foreground">
                                AI-powered DeFi curation
                            </strong>
                            .
                        </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-8">
                        <p className="text-muted-foreground mb-6 text-center">
                            Today, we provide{" "}
                            <strong className="text-foreground">
                                risk scoring, yield analysis, and opportunity discovery
                            </strong>
                            . Tomorrow, AI will curate at scale — and we're building the verified data foundation it needs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-2xl mb-2">🤖</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    100% automated verification
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl mb-2">🧠</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    AI-ready data layer
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl mb-2">🎯</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    Built for curators
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center bg-card/50 backdrop-blur-sm rounded-lg border border-cyan-400/30 p-12 shadow-lg shadow-cyan-400/10">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        From raw data to intelligence.
                    </h2>
                    <h2 className="text-3xl font-bold text-cyan-400 mb-8">
                        From intelligence to AI-powered curation.
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link
                            href="/curate"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all font-bold border border-cyan-300 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
                        >
                            Explore DeFi Intelligence
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <SynergyCTA variant="secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground italic border-t border-border pt-6">
                        Verified data. Automated scoring. AI-ready.
                        <br />
                        The foundation is being built.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-16">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Company Info */}
                        <div className="md:col-span-2">
                            <Logo size="md" className="mb-4" />
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-xs font-semibold font-mono">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                                    </span>
                                    PREVIEW
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                DeFi Intelligence Platform
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                We are{" "}
                                <a
                                    href="https://www.fabrknt.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-cyan-400 hover:text-cyan-300"
                                >
                                    www.fabrknt.com
                                </a>
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://x.com/fabrknt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="X (Twitter)"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://github.com/fabrknt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="GitHub"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        {/* Products */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">
                                Products
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/curate"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Curate
                                    </Link>
                                </li>
                                <li>
                                    <SynergyCTA variant="footer" />
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="https://www.fabrknt.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/fabrknt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://x.com/fabrknt"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        X (Twitter)
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-border pt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            © {new Date().getFullYear()} Fabrknt. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
