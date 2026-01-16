"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Shield,
    Clock,
    ChevronRight,
    RefreshCw,
    BarChart3,
    Info,
} from "lucide-react";

interface AllocationData {
    poolId: string;
    poolName: string;
    protocol: string;
    asset: string;
    allocation: number;
    apy: number;
    riskScore: number;
}

interface PerformanceSummary {
    riskProfile: string;
    displayName: string;
    latestSnapshot: {
        date: string;
        expectedApy: number;
        weightedRiskScore: number;
        allocations: AllocationData[];
    } | null;
    performance: {
        return7d: number | null;
        return30d: number | null;
        return7dAnnualized: number | null;
        return30dAnnualized: number | null;
    };
    trend: "up" | "down" | "stable";
    snapshotCount: number;
}

interface PerformanceCardProps {
    onViewDetails?: (profile: string) => void;
    compact?: boolean;
}

const PROFILE_COLORS = {
    preserver: {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400",
        label: "Preserver",
        icon: Shield,
    },
    steady: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        label: "Steady",
        icon: Shield,
    },
    balanced: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        label: "Balanced",
        icon: BarChart3,
    },
    growth: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        label: "Growth",
        icon: TrendingUp,
    },
    maximizer: {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        label: "Maximizer",
        icon: TrendingUp,
    },
};

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
}

function formatPercent(value: number | null, decimals: number = 2): string {
    if (value === null) return "—";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(decimals)}%`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PerformanceCard({ onViewDetails, compact = false }: PerformanceCardProps) {
    const [summaries, setSummaries] = useState<PerformanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPerformance();
    }, []);

    async function fetchPerformance() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/curate/performance");
            if (!response.ok) {
                throw new Error("Failed to fetch performance data");
            }

            const data = await response.json();
            setSummaries(data.summaries || []);
        } catch (err) {
            console.error("Error fetching performance:", err);
            setError("Unable to load performance data");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading performance data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-center text-slate-400">
                    <p>{error}</p>
                    <button
                        onClick={fetchPerformance}
                        className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mx-auto"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Check if we have any data
    const hasData = summaries.some(s => s.snapshotCount > 0);

    if (!hasData) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Performance Tracking</h3>
                    <p className="text-sm text-slate-400 mb-3">
                        We track how our allocation recommendations perform over time.
                        Check back soon for historical data.
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                        <Info className="h-3 w-3" />
                        <span>Data collection starting</span>
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-400" />
                            Our Track Record
                        </h3>
                        <button
                            onClick={fetchPerformance}
                            className="text-slate-500 hover:text-slate-400"
                            title="Refresh"
                        >
                            <RefreshCw className="h-3 w-3" />
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-slate-700/50">
                    {summaries.map((summary) => {
                        const config = PROFILE_COLORS[summary.riskProfile as keyof typeof PROFILE_COLORS];
                        const Icon = config?.icon || BarChart3;

                        return (
                            <div
                                key={summary.riskProfile}
                                className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors cursor-pointer"
                                onClick={() => onViewDetails?.(summary.riskProfile)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${config?.bg || "bg-slate-700"}`}>
                                        <Icon className={`h-4 w-4 ${config?.text || "text-slate-400"}`} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-white font-medium">
                                            {summary.displayName}
                                        </span>
                                        {summary.latestSnapshot && (
                                            <div className="text-xs text-slate-500">
                                                {summary.latestSnapshot.expectedApy.toFixed(1)}% target APY
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {summary.performance.return30d !== null && (
                                        <div className="text-right">
                                            <div className={`text-sm font-medium ${
                                                summary.performance.return30d >= 0 ? "text-green-400" : "text-red-400"
                                            }`}>
                                                {formatPercent(summary.performance.return30d, 3)}
                                            </div>
                                            <div className="text-xs text-slate-500">30d return</div>
                                        </div>
                                    )}
                                    <TrendIcon trend={summary.trend} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Full card view
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-cyan-400" />
                            Allocation Performance
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                            How our recommendations have performed
                        </p>
                    </div>
                    <button
                        onClick={fetchPerformance}
                        className="text-slate-500 hover:text-slate-400 p-2"
                        title="Refresh data"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {summaries.map((summary) => {
                        const config = PROFILE_COLORS[summary.riskProfile as keyof typeof PROFILE_COLORS];
                        const Icon = config?.icon || BarChart3;

                        return (
                            <div
                                key={summary.riskProfile}
                                className={`p-4 rounded-xl border ${config?.border || "border-slate-700"} ${config?.bg || "bg-slate-800/50"} hover:border-opacity-50 transition-all`}
                            >
                                {/* Profile Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-5 w-5 ${config?.text || "text-slate-400"}`} />
                                        <span className="font-medium text-white">
                                            {summary.displayName}
                                        </span>
                                    </div>
                                    <TrendIcon trend={summary.trend} />
                                </div>

                                {/* Expected APY */}
                                {summary.latestSnapshot && (
                                    <div className="mb-3">
                                        <div className="text-2xl font-bold text-white">
                                            {summary.latestSnapshot.expectedApy.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Target APY
                                        </div>
                                    </div>
                                )}

                                {/* Actual Returns */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">7-day return</span>
                                        <span className={
                                            summary.performance.return7d === null
                                                ? "text-slate-500"
                                                : summary.performance.return7d >= 0
                                                    ? "text-green-400 font-medium"
                                                    : "text-red-400 font-medium"
                                        }>
                                            {formatPercent(summary.performance.return7d, 3)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">30-day return</span>
                                        <span className={
                                            summary.performance.return30d === null
                                                ? "text-slate-500"
                                                : summary.performance.return30d >= 0
                                                    ? "text-green-400 font-medium"
                                                    : "text-red-400 font-medium"
                                        }>
                                            {formatPercent(summary.performance.return30d, 3)}
                                        </span>
                                    </div>
                                </div>

                                {/* Annualized */}
                                {summary.performance.return30dAnnualized !== null && (
                                    <div className="pt-2 border-t border-slate-700/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Annualized (30d)</span>
                                            <span className={
                                                summary.performance.return30dAnnualized >= 0
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }>
                                                {formatPercent(summary.performance.return30dAnnualized, 1)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Snapshot info */}
                                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {summary.latestSnapshot
                                            ? `Updated ${formatDate(summary.latestSnapshot.date)}`
                                            : "No data yet"
                                        }
                                    </div>
                                    <span>{summary.snapshotCount} snapshots</span>
                                </div>

                                {/* View Details */}
                                {onViewDetails && (
                                    <button
                                        onClick={() => onViewDetails(summary.riskProfile)}
                                        className="mt-3 w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 border-t border-slate-700/50"
                                    >
                                        View Details
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Trust Message */}
            <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                    Performance is calculated from daily snapshots of our allocation recommendations.
                    Past performance does not guarantee future results.
                </p>
            </div>
        </div>
    );
}

/**
 * Mini version for displaying in sidebar or banners
 */
export function PerformanceBadge() {
    const [bestPerformer, setBestPerformer] = useState<PerformanceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBest() {
            try {
                const response = await fetch("/api/curate/performance");
                if (!response.ok) return;

                const data = await response.json();
                const summaries: PerformanceSummary[] = data.summaries || [];

                // Find best 30d performer
                const withReturns = summaries.filter(s => s.performance.return30d !== null);
                if (withReturns.length > 0) {
                    const best = withReturns.reduce((a, b) =>
                        (a.performance.return30d || 0) > (b.performance.return30d || 0) ? a : b
                    );
                    setBestPerformer(best);
                }
            } catch {
                // Silently fail
            } finally {
                setLoading(false);
            }
        }

        fetchBest();
    }, []);

    if (loading || !bestPerformer || bestPerformer.performance.return30d === null) {
        return null;
    }

    const isPositive = bestPerformer.performance.return30d >= 0;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-full text-xs">
            <BarChart3 className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-400">
                {bestPerformer.displayName}:
            </span>
            <span className={isPositive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                {formatPercent(bestPerformer.performance.return30d, 2)} (30d)
            </span>
        </div>
    );
}
