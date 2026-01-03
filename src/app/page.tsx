import Link from "next/link";
import {
    ArrowRight,
    Brain,
    Link2,
    TrendingUp,
    Shield,
    Users,
    Building2,
    Github,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/logo";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

async function getCompanyStats() {
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
}

async function getListingStats() {
    const activeListings = await prisma.listing.count({
        where: { status: "active" },
    });

    return { activeListings };
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
        <div className="min-h-screen bg-gradient-to-b from-muted to-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Logo size="sm" />
                        <div className="flex items-center gap-6">
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
                            <Link
                                href="/cindex"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Index
                            </Link>
                            <Link
                                href="/synergy"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Synergy
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-4">
                            <Logo size="lg" />
                        </div>
                        <div className="flex justify-center mb-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                Preview
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                            Verify Web3.
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Before You Trust It.
                        </h2>
                        <p className="text-xl md:text-2xl font-semibold text-muted-foreground mb-2">
                            Pitch decks lie.{" "}
                            <span className="text-purple-600">
                                On-chain data doesn't.
                            </span>
                        </p>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            FABRKNT helps{" "}
                            <strong className="text-foreground">
                                Web3 Corp Dev teams, investors, and founders
                            </strong>{" "}
                            verify companies using real on-chain activity,
                            GitHub signals, and social data — fully automated,
                            no self-reporting.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/cindex"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold text-lg"
                            >
                                <Brain className="h-6 w-6" />
                                Explore Verified Companies
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/synergy"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold text-lg"
                            >
                                <Link2 className="h-6 w-6" />
                                Find Real Synergies
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center mb-8">
                    <p className="text-lg text-muted-foreground">
                        Built for people who make irreversible decisions
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-2">
                            {totalCompanies}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Web3 companies fully verified
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-purple-600 mb-2">
                            100%
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                            Automated — no manual input
                        </p>
                        <p className="text-sm text-muted-foreground">
                            On-chain + GitHub + social signals
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
                            Web3 has a trust problem
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📈</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        User numbers are inflated
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💻</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        GitHub looks active — until you check
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🤝</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        "Strategic partnerships" don't exist
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">
                                        M&A and investments start with slides,
                                        not reality
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-lg font-semibold text-muted-foreground">
                            Most Web3 decisions are still made on unverified
                            claims.
                        </p>
                    </div>
                </div>
            </div>

            {/* Solution Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        FABRKNT fixes the first step
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                        FABRKNT is a{" "}
                        <strong className="text-foreground">
                            Web3 Index & Synergy platform
                        </strong>{" "}
                        built for{" "}
                        <strong className="text-foreground">
                            early verification
                        </strong>
                        .
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-muted-foreground mb-4">
                        <span className="px-4 py-2 bg-muted rounded-lg">
                            No forms.
                        </span>
                        <span className="px-4 py-2 bg-muted rounded-lg">
                            No pitch decks.
                        </span>
                        <span className="px-4 py-2 bg-muted rounded-lg">
                            No self-reported metrics.
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-purple-600 mb-0">
                        Only signals that can be verified.
                    </p>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 pt-4 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* INDEX Product */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <Brain className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    INDEX
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Web3 Company Verification
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            An automated index that shows what Web3 companies
                            actually do — not what they say.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        On-chain growth
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Wallet activity, protocol usage, real
                                        traction
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Team & code health
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        GitHub commits, contributors, retention,
                                        code quality
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Signal integrity
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Cross-verified via blockchain and public
                                        APIs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-purple-600 mb-6">
                            If it can't be verified, it doesn't count.
                        </p>

                        <Link
                            href="/cindex"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium w-full justify-center"
                        >
                            Explore the Index
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* SYNERGY Product */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-cyan-100">
                                <Link2 className="h-8 w-8 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    SYNERGY
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Quiet M&A & Partnerships
                                </p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Discover acquisition targets and partnership
                            opportunities — without broadcasting intent.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Corp Dev teams scouting quietly
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Strategic partnerships and integrations
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Early M&A conversations
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            AI-powered compatibility analysis based on{" "}
                            <strong className="text-foreground">
                                verified index scores
                            </strong>
                            , not narratives.
                        </p>

                        <Link
                            href="/synergy"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-medium w-full justify-center"
                        >
                            Find Real Opportunities
                            <ArrowRight className="h-5 w-5" />
                        </Link>
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
                                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-purple-600">
                                        1
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Verify
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    We automatically analyze on-chain data,
                                    GitHub activity, and social signals.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-cyan-600">
                                        2
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Score
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Companies receive transparent, comparable
                                    index scores.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-green-600">
                                        3
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Connect
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Use verified data to approach acquisitions
                                    and partnerships with confidence.
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
                            <Building2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Corp Dev & M&A Teams
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Avoid bad first calls. Screen candidates before
                                outreach.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-border p-6 text-center">
                            <TrendingUp className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Web3 Investors & Funds
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Run pre-DD before the pitch deck arrives.
                            </p>
                        </div>
                        <div className="bg-card rounded-lg border border-border p-6 text-center">
                            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Web3 Founders
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Get discovered for what you actually build — not
                                how well you sell.
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
                        <p className="text-2xl font-bold text-purple-600 mb-8">
                            Web3 deserves better signals.
                        </p>
                        <div className="space-y-2 text-lg text-muted-foreground mb-8">
                            <p>Verification beats trust.</p>
                            <p>Data beats narratives.</p>
                            <p>Transparency compounds.</p>
                        </div>
                        <p className="text-muted-foreground">
                            FABRKNT is built in public — because credibility
                            matters.
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
                            FABRKNT is building the future of{" "}
                            <strong className="text-foreground">
                                Web3 verification and synergy
                            </strong>
                            .
                        </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-8">
                        <p className="text-muted-foreground mb-6 text-center">
                            Our mission is to{" "}
                            <strong className="text-foreground">
                                democratize access to trustworthy Web3 company
                                data
                            </strong>{" "}
                            and enable better decisions across M&A,
                            partnerships, and investments.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-2xl mb-2">🤖</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    100% automated verification
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl mb-2">🚫</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    No self-reported metrics
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl mb-2">🌐</p>
                                <p className="text-sm font-semibold text-foreground mb-1">
                                    Built for Web3, by Web3
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-200 p-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        Stop trusting claims.
                    </h2>
                    <h2 className="text-3xl font-bold text-purple-600 mb-8">
                        Start verifying.
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link
                            href="/cindex"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                        >
                            Explore Verified Companies
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/synergy"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition-colors font-medium"
                        >
                            Find Strategic Synergies
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground italic border-t border-purple-200 pt-6">
                        FABRKNT does not rank narratives.
                        <br />
                        We index reality.
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
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                                    </span>
                                    Preview
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Web3 Index & Synergy Platform
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                We are{" "}
                                <a
                                    href="https://www.fabrknt.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-purple-600 hover:text-purple-700"
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
                                        href="/cindex"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Index
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cindex/companies"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Company Directory
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/synergy"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Synergy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/synergy/opportunities"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Opportunities
                                    </Link>
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
