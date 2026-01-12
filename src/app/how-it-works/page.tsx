"use client";

import { CurateLayoutClient } from "@/components/curate/curate-layout-client";
import {
    Database,
    Brain,
    Shield,
    TrendingUp,
    Layers,
    Zap,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Clock,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
    return (
        <CurateLayoutClient>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Hero */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        How Fabrknt Works
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Transparent methodology. No black boxes. Here's exactly how we analyze
                        and score DeFi yield opportunities.
                    </p>
                </div>

                {/* Overview */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">The Pipeline</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { icon: Database, label: "1. Collect", desc: "Aggregate pool data from protocols" },
                            { icon: BarChart3, label: "2. Analyze", desc: "Calculate risk scores & metrics" },
                            { icon: Brain, label: "3. Rank", desc: "AI evaluates risk-adjusted returns" },
                            { icon: Zap, label: "4. Deliver", desc: "Surface best opportunities" },
                        ].map((step, i) => (
                            <div key={i} className="text-center p-4 bg-slate-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <step.icon className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">{step.label}</h3>
                                <p className="text-xs text-slate-400">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Sources */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="h-6 w-6 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Data Sources</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        We aggregate data from trusted, publicly available sources:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">DefiLlama API</h3>
                            <p className="text-sm text-slate-400">
                                TVL, APY, pool metadata, and historical yield data for 200+ protocols.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Protocol Documentation</h3>
                            <p className="text-sm text-slate-400">
                                Audit reports, team info, tokenomics, and upgrade authorities.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">On-Chain Data</h3>
                            <p className="text-sm text-slate-400">
                                Program verification, multisig configs, and oracle dependencies.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2">Historical Analysis</h3>
                            <p className="text-sm text-slate-400">
                                30-day APY trends, volatility metrics, and TVL stability.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Risk Scoring */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-6 w-6 text-green-400" />
                        <h2 className="text-xl font-semibold text-white">Risk Scoring Model</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Every pool receives a risk score from 0-100 based on five weighted factors:
                    </p>
                    <div className="space-y-4">
                        {[
                            {
                                name: "TVL Risk",
                                weight: "30%",
                                desc: "Lower TVL = higher risk. Pools under $1M get higher scores.",
                                color: "bg-cyan-500",
                            },
                            {
                                name: "APY Sustainability",
                                weight: "25%",
                                desc: "Extremely high APYs are often unsustainable. We penalize outliers.",
                                color: "bg-green-500",
                            },
                            {
                                name: "Asset Volatility",
                                weight: "20%",
                                desc: "Stablecoins = low risk. Volatile tokens = higher risk.",
                                color: "bg-yellow-500",
                            },
                            {
                                name: "Impermanent Loss",
                                weight: "15%",
                                desc: "LP pools with uncorrelated assets face IL risk.",
                                color: "bg-orange-500",
                            },
                            {
                                name: "Protocol Trust",
                                weight: "10%",
                                desc: "Audits, team reputation, time in market, upgrade authority.",
                                color: "bg-purple-500",
                            },
                        ].map((factor, i) => (
                            <div key={i} className="flex items-center gap-4 bg-slate-800/50 rounded-lg p-4">
                                <div className={`w-2 h-12 ${factor.color} rounded-full`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-medium">{factor.name}</h3>
                                        <span className="text-sm text-slate-400">{factor.weight}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{factor.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <h4 className="text-white font-medium mb-2">Risk Levels</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full" />
                                <span className="text-slate-300">Low (0-20)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                                <span className="text-slate-300">Medium (21-40)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-orange-500 rounded-full" />
                                <span className="text-slate-300">High (41-60)</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full" />
                                <span className="text-slate-300">Very High (61+)</span>
                            </span>
                        </div>
                    </div>
                </section>

                {/* AI Recommendations */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="h-6 w-6 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">AI-Powered Insights</h2>
                    </div>
                    <p className="text-slate-300 mb-6">
                        Beyond raw scoring, we use AI to provide contextual analysis:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                Smart Picks
                            </h3>
                            <p className="text-sm text-slate-400">
                                Algorithmically selected pools based on risk-adjusted returns,
                                not just raw APY.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-cyan-400" />
                                APY Stability Analysis
                            </h3>
                            <p className="text-sm text-slate-400">
                                Track 30-day trends to identify sustainable yields vs.
                                short-term promotions.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                Risk Alerts
                            </h3>
                            <p className="text-sm text-slate-400">
                                Automatic badges when APY drops significantly or unusual
                                activity is detected.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-purple-400" />
                                Portfolio Optimization
                            </h3>
                            <p className="text-sm text-slate-400">
                                AI suggests diversified allocations based on your risk
                                tolerance and goals.
                            </p>
                        </div>
                    </div>
                </section>

                {/* What We Don't Do */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-6 w-6 text-red-400" />
                        <h2 className="text-xl font-semibold text-white">What We Don't Do</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "We never request wallet signing permissions",
                            "We never custody or manage your funds",
                            "We never execute transactions on your behalf",
                            "We never sell your data to third parties",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-400 text-sm">✕</span>
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Update Frequency */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">Data Freshness</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">~15 min</p>
                            <p className="text-sm text-slate-400">APY & TVL updates</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">Daily</p>
                            <p className="text-sm text-slate-400">Risk score recalculation</p>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white mb-1">Weekly</p>
                            <p className="text-sm text-slate-400">Protocol trust reviews</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8 border-t border-slate-800">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Questions about our methodology?
                    </h2>
                    <p className="text-slate-400 mb-6">
                        We're transparent about how we work. Reach out anytime.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium rounded-lg transition-colors"
                        >
                            Explore Yields
                        </Link>
                        <Link
                            href="/about"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors"
                        >
                            About Us
                        </Link>
                    </div>
                </section>
            </div>
        </CurateLayoutClient>
    );
}
