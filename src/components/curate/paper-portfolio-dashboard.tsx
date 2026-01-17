"use client";

import { useMemo } from "react";
import {
    FlaskConical,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    DollarSign,
    Target,
    ChevronRight,
    Sparkles,
    Clock,
    Shield,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";
import { useAllocation, PerformanceMetrics } from "@/contexts/allocation-context";

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
}

// Simple sparkline component
function MiniSparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "stable" }) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 32;
    const width = 80;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    const color = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#94a3b8";

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Progress ring for trust building
function TrustProgressRing({ days, target }: { days: number; target: number }) {
    const progress = Math.min(days / target, 1);
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r="18"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    className="text-slate-700"
                />
                <circle
                    cx="24"
                    cy="24"
                    r="18"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={progress >= 1 ? "text-green-500" : "text-purple-500"}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${progress >= 1 ? "text-green-400" : "text-purple-400"}`}>
                    {days}d
                </span>
            </div>
        </div>
    );
}

interface PaperPortfolioDashboardProps {
    onViewDetails?: () => void;
}

export function PaperPortfolioDashboard({ onViewDetails }: PaperPortfolioDashboardProps) {
    const {
        allocation,
        paperHistory,
        trackingDays,
        getAllPerformanceMetrics,
    } = useAllocation();

    const allMetrics = getAllPerformanceMetrics();

    // Aggregate performance across all portfolios
    const aggregateMetrics = useMemo(() => {
        if (allMetrics.length === 0) return null;

        const totalInvested = paperHistory.reduce(
            (sum, entry) => sum + entry.allocation.summary.totalAmount, 0
        );

        const totalYield = allMetrics.reduce(
            (sum, m) => sum + m.expectedYieldToDate, 0
        );

        const weightedApy = paperHistory.reduce((sum, entry, idx) => {
            const metrics = allMetrics.find(m => m.portfolioId === entry.id);
            const weight = entry.allocation.summary.totalAmount / totalInvested;
            return sum + (metrics?.currentApy || entry.allocation.summary.expectedApy) * weight;
        }, 0);

        // Get APY data points for sparkline
        const apyHistory: number[] = [];
        allMetrics.forEach(m => {
            m.snapshots.forEach(s => {
                apyHistory.push(s.totalCurrentApy);
            });
        });

        // Determine overall trend
        let overallTrend: "up" | "down" | "stable" = "stable";
        const upCount = allMetrics.filter(m => m.apyTrend === "up").length;
        const downCount = allMetrics.filter(m => m.apyTrend === "down").length;
        if (upCount > downCount) overallTrend = "up";
        else if (downCount > upCount) overallTrend = "down";

        return {
            totalInvested,
            totalYield,
            weightedApy,
            apyHistory: apyHistory.length > 1 ? apyHistory : [weightedApy, weightedApy],
            overallTrend,
            portfolioCount: paperHistory.length,
        };
    }, [allMetrics, paperHistory]);

    // Trust progress (14 days target)
    const trustTarget = 14;
    const trustProgress = Math.min(trackingDays / trustTarget, 1);
    const trustEarned = trustProgress >= 1 && allMetrics.some(m => m.apyTrend !== "down");

    if (!allocation && paperHistory.length === 0) {
        return null;
    }

    // Empty state - has allocation but not saved yet
    if (paperHistory.length === 0 && allocation) {
        return (
            <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <FlaskConical className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Paper Portfolio</h2>
                        <p className="text-sm text-slate-400">Track before you trade</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 mb-1">Start tracking your allocation</p>
                    <p className="text-xs text-slate-500">
                        Save to paper portfolio to see how it performs over time
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <FlaskConical className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Paper Portfolio</h2>
                            <p className="text-sm text-slate-400">
                                {paperHistory.length} allocation{paperHistory.length !== 1 ? "s" : ""} tracked
                            </p>
                        </div>
                    </div>
                    {trustEarned && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                            <Shield className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">Trust Earned</span>
                        </div>
                    )}
                </div>

                {/* Main Stats Grid */}
                {aggregateMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Total Invested */}
                        <div className="bg-slate-800/60 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-slate-500" />
                                <span className="text-xs text-slate-400">Paper Value</span>
                            </div>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(aggregateMetrics.totalInvested)}
                            </p>
                        </div>

                        {/* Estimated Yield */}
                        <div className="bg-slate-800/60 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-slate-400">Est. Yield</span>
                            </div>
                            <p className="text-xl font-bold text-green-400">
                                +{formatCurrency(aggregateMetrics.totalYield)}
                            </p>
                        </div>

                        {/* Current APY */}
                        <div className="bg-slate-800/60 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-cyan-500" />
                                <span className="text-xs text-slate-400">Avg APY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-white">
                                    {aggregateMetrics.weightedApy.toFixed(1)}%
                                </p>
                                <div className="flex items-center">
                                    {aggregateMetrics.overallTrend === "up" && (
                                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                                    )}
                                    {aggregateMetrics.overallTrend === "down" && (
                                        <TrendingDown className="h-4 w-4 text-red-400" />
                                    )}
                                    {aggregateMetrics.overallTrend === "stable" && (
                                        <Minus className="h-4 w-4 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust Progress */}
                        <div className="bg-slate-800/60 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span className="text-xs text-slate-400">Trust Progress</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <TrustProgressRing days={trackingDays} target={trustTarget} />
                                <div>
                                    <p className="text-sm text-white font-medium">
                                        {trustEarned ? "Complete!" : `${trustTarget - trackingDays} days left`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {trustEarned ? "Ready to trade" : "to build trust"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* APY Trend Chart */}
                {aggregateMetrics && aggregateMetrics.apyHistory.length > 1 && (
                    <div className="bg-slate-800/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-slate-500" />
                                <span className="text-sm text-slate-400">APY Performance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                    aggregateMetrics.overallTrend === "up" ? "text-green-400" :
                                    aggregateMetrics.overallTrend === "down" ? "text-red-400" :
                                    "text-slate-400"
                                }`}>
                                    {aggregateMetrics.overallTrend === "up" ? "Rising" :
                                     aggregateMetrics.overallTrend === "down" ? "Falling" : "Stable"}
                                </span>
                                <MiniSparkline
                                    data={aggregateMetrics.apyHistory}
                                    trend={aggregateMetrics.overallTrend}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            {allMetrics.reduce((sum, m) => sum + m.snapshots.length, 0)} data points collected
                        </p>
                    </div>
                )}
            </div>

            {/* View Details Button */}
            {onViewDetails && (
                <button
                    onClick={onViewDetails}
                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/40 hover:bg-slate-800/60 transition-colors border-t border-slate-700/50"
                >
                    <span className="text-sm text-slate-300">View all allocations</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
            )}

            {/* Value Proposition */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-t border-purple-500/20">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400 shrink-0" />
                    <p className="text-sm text-slate-300">
                        <span className="text-purple-400 font-medium">Paper trading</span>
                        {" "}lets you verify our recommendations work before risking real money.
                        Track for 14 days to build trust.
                    </p>
                </div>
            </div>
        </div>
    );
}
