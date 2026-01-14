"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ArrowRight, Shield, Droplets, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { YieldSpread } from "@/lib/curate/yield-spreads";

interface SpreadResponse {
    spreads: YieldSpread[];
    topOpportunities: YieldSpread[];
    filters: {
        chain: string;
        minSpread: number;
        asset: string;
    };
    metadata: {
        assetsAnalyzed: number;
        poolsCompared: number;
        spreadsFound: number;
        generatedAt: string;
    };
}

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(0)}M`;
    return `$${(tvl / 1_000).toFixed(0)}K`;
}

const CONFIDENCE_COLORS = {
    high: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function SpreadCard({ spread }: { spread: YieldSpread }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        spread.assetType === "stablecoin"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-purple-500/20 text-purple-400"
                    }`}>
                        {spread.asset}
                    </span>
                    <span className="text-green-400 font-semibold">
                        +{spread.apySpread.toFixed(2)}% APY
                    </span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded border ${CONFIDENCE_COLORS[spread.confidence]}`}>
                    {spread.confidence.toUpperCase()}
                </span>
            </div>

            {/* Pool comparison */}
            <div className="flex items-center gap-2 mb-3">
                {/* High pool */}
                <div className="flex-1 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="text-sm font-medium text-white">{spread.highPool.protocol}</div>
                    <div className="text-xs text-slate-400 mb-1">{spread.highPool.symbol}</div>
                    <div className="text-lg font-bold text-green-400">{spread.highPool.apy.toFixed(2)}%</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{formatTvl(spread.highPool.tvl)}</span>
                        <span className="text-xs text-slate-600">|</span>
                        <span className="text-xs text-slate-500">Risk: {spread.highPool.riskScore}</span>
                    </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-5 w-5 text-slate-500 flex-shrink-0" />

                {/* Low pool */}
                <div className="flex-1 bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                    <div className="text-sm font-medium text-white">{spread.lowPool.protocol}</div>
                    <div className="text-xs text-slate-400 mb-1">{spread.lowPool.symbol}</div>
                    <div className="text-lg font-bold text-slate-300">{spread.lowPool.apy.toFixed(2)}%</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{formatTvl(spread.lowPool.tvl)}</span>
                        <span className="text-xs text-slate-600">|</span>
                        <span className="text-xs text-slate-500">Risk: {spread.lowPool.riskScore}</span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Net Spread</div>
                    <div className="text-green-400 font-medium">+{spread.netSpread.toFixed(2)}%</div>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Min Liquidity</div>
                    <div className="text-white font-medium">{formatTvl(spread.minLiquidity)}</div>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Sustainable</div>
                    <div className={`font-medium ${spread.isBaseApyDriven ? "text-green-400" : "text-yellow-400"}`}>
                        {spread.isBaseApyDriven ? "Yes" : "Partially"}
                    </div>
                </div>
            </div>

            {/* Base APY note */}
            {spread.isBaseApyDriven && (
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-400 bg-green-500/5 rounded p-2 border border-green-500/10">
                    <Sparkles className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Base APY driven - this spread is primarily from organic protocol yield, not token emissions.</span>
                </div>
            )}
        </div>
    );
}

export function YieldSpreadsPanel() {
    const [data, setData] = useState<SpreadResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "stablecoin" | "volatile">("all");

    useEffect(() => {
        async function fetchSpreads() {
            try {
                setLoading(true);
                const response = await fetch("/api/curate/spreads?chain=Solana&minSpread=0.5");
                if (!response.ok) throw new Error("Failed to fetch spreads");
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load spreads");
            } finally {
                setLoading(false);
            }
        }

        fetchSpreads();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Detecting yield opportunities...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error || "Failed to load yield opportunities"}</span>
                </div>
            </div>
        );
    }

    const filteredSpreads = filter === "all"
        ? data.spreads
        : data.spreads.filter(s => s.assetType === filter);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Yield Opportunities</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{data.metadata.poolsCompared} pools analyzed</span>
                        <span className="text-slate-600">|</span>
                        <span>{data.metadata.spreadsFound} opportunities found</span>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    APY spreads between protocols for the same asset
                </p>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-slate-800 flex gap-2">
                {(["all", "stablecoin", "volatile"] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            filter === type
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                        }`}
                    >
                        {type === "all" ? "All Assets" : type === "stablecoin" ? "Stablecoins" : "Volatile"}
                    </button>
                ))}
            </div>

            {/* Spreads list */}
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {filteredSpreads.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Droplets className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No significant yield spreads detected for {filter === "all" ? "any assets" : filter + "s"}</p>
                    </div>
                ) : (
                    filteredSpreads.slice(0, 10).map((spread) => (
                        <SpreadCard key={spread.id} spread={spread} />
                    ))
                )}
            </div>

            {/* Footer */}
            {filteredSpreads.length > 10 && (
                <div className="p-4 border-t border-slate-800 text-center">
                    <span className="text-sm text-slate-400">
                        Showing top 10 of {filteredSpreads.length} opportunities
                    </span>
                </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 border-t border-slate-800 bg-slate-800/30">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                        Advisory only. Spreads may close quickly. Always verify current rates before making decisions.
                        Past spreads do not guarantee future opportunities.
                    </span>
                </div>
            </div>
        </div>
    );
}
