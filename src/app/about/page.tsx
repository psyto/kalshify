"use client";

import { CurateLayoutClient } from "@/components/curate/curate-layout-client";
import { User, Target, Shield, Eye, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <CurateLayoutClient>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Hero */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        About Fabrknt
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Personalized DeFi allocations in 30 seconds. Actionable recommendations, not data dumps.
                    </p>
                </div>

                {/* Mission */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">Our Mission</h2>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-4">
                        Most DeFi tools show you data. We tell you what to do with it.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        Fabrknt gives you a personalized DeFi allocation in 30 seconds—tell us your amount and risk
                        tolerance, and we'll show you exactly where to put your money with step-by-step execution
                        instructions. Want to learn instead? We also teach you how professional curators think,
                        so you can build your own strategies with confidence.
                    </p>
                </section>

                {/* Why We Built This */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="h-6 w-6 text-purple-400" />
                        <h2 className="text-xl font-semibold text-white">The Origin Story</h2>
                    </div>
                    <div className="text-slate-300 leading-relaxed space-y-4">
                        <p>
                            Coming from traditional banking and enterprise software, I saw how institutional
                            finance evaluates risk systematically—due diligence, stress testing, portfolio
                            diversification. But when I started exploring DeFi yields, I found a Wild West:
                            flashy APYs with no context, hidden risks, and no clear answer to "where should I put my money?"
                        </p>
                        <p>
                            Most tools gave me more data, not answers. I wanted something that would just tell me
                            what to do—like a financial advisor, but for DeFi. That's Fabrknt: actionable allocations
                            based on your goals, with the option to learn the thinking behind them if you want to go deeper.
                        </p>
                    </div>
                </section>

                {/* Team */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">The Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-xl font-bold text-cyan-400">
                                    HS
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold">Hiroyuki Saito</h3>
                                    <p className="text-sm text-slate-400 mb-3">Founder</p>
                                    <p className="text-sm text-slate-300 mb-3">
                                        Banking & enterprise software background. AWS certified, Stanford blockchain
                                        certification. Building at the intersection of institutional finance and DeFi.
                                        Based in Tokyo.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href="https://x.com/psyto"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-white transition-colors"
                                            title="@psyto"
                                        >
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/hiroyuki-saito/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                        <a
                                            href="https://github.com/fabrknt"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Github className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust & Security */}
                <section id="trust" className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-8 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-6 w-6 text-green-400" />
                        <h2 className="text-xl font-semibold text-white">Trust & Security</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Eye className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-white font-medium mb-2">Read-Only</h3>
                            <p className="text-sm text-slate-400">
                                We never request wallet permissions. We analyze, you decide and execute.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-white font-medium mb-2">Non-Custodial</h3>
                            <p className="text-sm text-slate-400">
                                Your keys, your funds. We never touch or manage your assets.
                            </p>
                        </div>
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Target className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-white font-medium mb-2">Transparent</h3>
                            <p className="text-sm text-slate-400">
                                Our methodology is open. See exactly how we score risk and rank pools.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="text-center py-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Get in Touch</h2>
                    <p className="text-slate-400 mb-6">
                        Questions, feedback, or partnership inquiries? We'd love to hear from you.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href="https://x.com/fabrknt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                        >
                            <Twitter className="h-4 w-4" />
                            @fabrknt
                        </a>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8 border-t border-slate-800">
                    <p className="text-slate-400 mb-4">Ready to get your personalized allocation?</p>
                    <Link
                        href="/?tab=start"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium rounded-lg transition-colors"
                    >
                        Get My Allocation
                    </Link>
                </section>
            </div>
        </CurateLayoutClient>
    );
}
