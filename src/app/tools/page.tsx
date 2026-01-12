"use client";

import { Calculator, LineChart, Wrench } from "lucide-react";
import { ILCalculator } from "@/components/curate/il-calculator";
import { PositionSimulator } from "@/components/curate/position-simulator";
import { CurateLayoutClient } from "@/components/curate/curate-layout-client";

export default function ToolsPage() {
    return (
        <CurateLayoutClient>
            <div className="space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <Wrench className="h-6 w-6 text-cyan-400" />
                            <h1 className="text-2xl font-bold text-white">DeFi Tools</h1>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">
                            Calculate impermanent loss and simulate position returns for your DeFi strategies.
                        </p>
                    </div>
                </div>

                {/* Tool Navigation */}
                <div className="flex gap-4 border-b border-slate-700/50 pb-4">
                    <a
                        href="#il-calculator"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                    >
                        <Calculator className="h-4 w-4" />
                        IL Calculator
                    </a>
                    <a
                        href="#position-simulator"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                        <LineChart className="h-4 w-4" />
                        Position Simulator
                    </a>
                </div>

                {/* IL Calculator */}
                <section id="il-calculator">
                    <ILCalculator standalone />
                </section>

                {/* Position Simulator */}
                <section id="position-simulator">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <LineChart className="h-5 w-5 text-green-400" />
                            <h2 className="text-lg font-semibold text-white">
                                Position Simulator
                            </h2>
                        </div>
                        <PositionSimulator standalone />
                    </div>
                </section>
            </div>
        </CurateLayoutClient>
    );
}
