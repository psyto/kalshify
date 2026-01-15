"use client";

import { useState, useEffect } from "react";
import { Loader2, Layers, TrendingUp, Shield, ExternalLink, Zap, Eye, FileText } from "lucide-react";

interface AlternativeYield {
    id: string;
    name: string;
    symbol: string;
    category: "restaking" | "perp_lp" | "rwa";
    protocol: string;
    chain: string;
    tvlUsd: number;
    apy: number;
    apyBreakdown?: {
        base?: number;
        mev?: number;
        ncn?: number;
        fees?: number;
    };
    riskLevel: "low" | "medium" | "high";
    description: string;
    tokenMint?: string;
    url?: string;
    lastUpdated: string;
}

interface AlternativeYieldsData {
    yields: AlternativeYield[];
    metadata: {
        totalYields: number;
        totalTvl: number;
        categories: string[];
        fetchedAt: string;
    };
}

function formatTvl(tvl: number): string {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
    return `$${tvl.toFixed(0)}`;
}

function getCategoryLabel(category: string): string {
    switch (category) {
        case "restaking":
            return "Restaking";
        case "perp_lp":
            return "Perp LP";
        case "rwa":
            return "RWA";
        default:
            return category;
    }
}

function getCategoryColor(category: string): string {
    switch (category) {
        case "restaking":
            return "text-purple-400 bg-purple-500/10 border-purple-500/30";
        case "perp_lp":
            return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
        case "rwa":
            return "text-green-400 bg-green-500/10 border-green-500/30";
        default:
            return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
}

function getRiskColor(risk: string): string {
    switch (risk) {
        case "low":
            return "text-green-400";
        case "medium":
            return "text-yellow-400";
        case "high":
            return "text-red-400";
        default:
            return "text-slate-400";
    }
}

function YieldCard({ yieldData }: { yieldData: AlternativeYield }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                        {yieldData.category === "restaking" ? (
                            <Layers className="h-5 w-5 text-purple-400" />
                        ) : (
                            <TrendingUp className="h-5 w-5 text-cyan-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">{yieldData.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{yieldData.protocol}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(yieldData.category)}`}>
                                {getCategoryLabel(yieldData.category)}
                            </span>
                        </div>
                    </div>
                </div>
                {yieldData.url && (
                    <a
                        href={yieldData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-900/50 rounded">
                    <p className="text-xs text-slate-500">APY</p>
                    <p className="text-lg font-bold text-green-400">{yieldData.apy.toFixed(2)}%</p>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                    <p className="text-xs text-slate-500">TVL</p>
                    <p className="text-sm font-semibold text-white">{formatTvl(yieldData.tvlUsd)}</p>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded">
                    <p className="text-xs text-slate-500">Risk</p>
                    <p className={`text-sm font-semibold capitalize ${getRiskColor(yieldData.riskLevel)}`}>
                        {yieldData.riskLevel}
                    </p>
                </div>
            </div>

            {/* APY Breakdown */}
            {yieldData.apyBreakdown && Object.keys(yieldData.apyBreakdown).length > 0 && (
                <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1.5">Yield Sources</p>
                    <div className="flex flex-wrap gap-2">
                        {yieldData.apyBreakdown.base !== undefined && yieldData.apyBreakdown.base > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                                Base: {yieldData.apyBreakdown.base.toFixed(1)}%
                            </span>
                        )}
                        {yieldData.apyBreakdown.mev !== undefined && yieldData.apyBreakdown.mev > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                                MEV: {yieldData.apyBreakdown.mev.toFixed(1)}%
                            </span>
                        )}
                        {yieldData.apyBreakdown.ncn !== undefined && yieldData.apyBreakdown.ncn > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded">
                                NCN: {yieldData.apyBreakdown.ncn.toFixed(1)}%
                            </span>
                        )}
                        {yieldData.apyBreakdown.fees !== undefined && yieldData.apyBreakdown.fees > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
                                Fees: {yieldData.apyBreakdown.fees.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed">{yieldData.description}</p>
        </div>
    );
}

export function AlternativeYields() {
    const [data, setData] = useState<AlternativeYieldsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchYields() {
            try {
                setLoading(true);
                const response = await fetch("/api/curate/alternative-yields");
                if (!response.ok) throw new Error("Failed to fetch alternative yields");
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchYields();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-slate-800">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (error || !data || data.yields.length === 0) {
        return null; // Don't show section if no data
    }

    const { yields, metadata } = data;

    return (
        <div className="space-y-4">
            {/* Trust badges */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-green-500" />
                    <span>Read-only</span>
                </span>
                <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span>Non-custodial</span>
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-green-500" />
                    <span>Transparent</span>
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Restaking & Perp LP</h2>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                        New
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{yields.length} opportunities</span>
                    <span>{formatTvl(metadata.totalTvl)} TVL</span>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-slate-300">
                        <span className="font-medium text-purple-400">Beyond DeFi Lending: </span>
                        These yields come from restaking protocols (extra rewards for securing networks)
                        and perpetual LP positions (earning trading fees). Higher complexity, different risk profiles.
                    </div>
                </div>
            </div>

            {/* Yield Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yields.map((yieldData) => (
                    <YieldCard key={yieldData.id} yieldData={yieldData} />
                ))}
            </div>
        </div>
    );
}
