"use client";

import { useState, useMemo } from "react";
import { Users, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { UserStrategy } from "@/lib/curate/user-strategy";
import { compareToCurator, CuratorComparison } from "@/lib/curate/strategy-feedback";

const CURATORS = [
    { slug: "gauntlet", name: "Gauntlet", riskTolerance: "moderate" },
    { slug: "steakhouse", name: "Steakhouse", riskTolerance: "conservative" },
    { slug: "re7", name: "RE7 Capital", riskTolerance: "aggressive" },
] as const;

const RISK_COLORS = {
    conservative: "text-green-400",
    moderate: "text-yellow-400",
    aggressive: "text-orange-400",
};

interface ComparisonCardProps {
    comparison: CuratorComparison;
    userMetrics: {
        apy: number;
        riskScore: number;
        stablecoinPercent: number;
    };
}

function ComparisonCard({ comparison, userMetrics }: ComparisonCardProps) {
    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-white">{comparison.curatorName}</h4>
                    <span className={`text-xs ${RISK_COLORS[comparison.curatorRiskTolerance]}`}>
                        {comparison.curatorRiskTolerance}
                    </span>
                </div>
                <Users className="h-5 w-5 text-purple-400" />
            </div>

            {/* Metrics comparison */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="text-xs text-slate-500 mb-1">APY</div>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-sm text-white">{userMetrics.apy.toFixed(1)}%</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="text-sm text-slate-400">{comparison.curatorMetrics.avgApy}%</span>
                    </div>
                </div>
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="text-xs text-slate-500 mb-1">Risk</div>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-sm text-white">{userMetrics.riskScore.toFixed(0)}</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="text-sm text-slate-400">{comparison.curatorMetrics.riskScore}</span>
                    </div>
                </div>
                <div className="p-2 bg-slate-900/50 rounded">
                    <div className="text-xs text-slate-500 mb-1">Stable</div>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-sm text-white">{userMetrics.stablecoinPercent.toFixed(0)}%</span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span className="text-sm text-slate-400">{comparison.curatorMetrics.stablecoinPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Similarities */}
            {comparison.similarities.length > 0 && (
                <div>
                    <h5 className="text-xs text-slate-500 mb-1">Similarities</h5>
                    <div className="space-y-1">
                        {comparison.similarities.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                                <CheckCircle className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Differences */}
            {comparison.differences.length > 0 && (
                <div>
                    <h5 className="text-xs text-slate-500 mb-1">Key Differences</h5>
                    <div className="space-y-1">
                        {comparison.differences.map((d, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                                <ArrowRight className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                                <span className="text-slate-300">{d}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Your advantages and risks */}
            <div className="grid grid-cols-2 gap-3">
                {comparison.yourAdvantages.length > 0 && (
                    <div>
                        <h5 className="text-xs text-green-400 mb-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Your Advantages
                        </h5>
                        <ul className="space-y-0.5">
                            {comparison.yourAdvantages.map((a, i) => (
                                <li key={i} className="text-xs text-slate-400">• {a}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {comparison.yourRisks.length > 0 && (
                    <div>
                        <h5 className="text-xs text-orange-400 mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Your Risks
                        </h5>
                        <ul className="space-y-0.5">
                            {comparison.yourRisks.map((r, i) => (
                                <li key={i} className="text-xs text-slate-400">• {r}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StrategyComparisonProps {
    strategy: UserStrategy;
}

export function StrategyComparison({ strategy }: StrategyComparisonProps) {
    const [selectedCurator, setSelectedCurator] = useState<string>("gauntlet");

    const comparison = useMemo(
        () => compareToCurator(strategy, selectedCurator),
        [strategy, selectedCurator]
    );

    const userMetrics = useMemo(() => {
        const totalAlloc = strategy.allocations.reduce((sum, a) => sum + a.allocation, 0);
        if (totalAlloc === 0) {
            return { apy: 0, riskScore: 0, stablecoinPercent: 0 };
        }

        const weightedApy = strategy.allocations.reduce(
            (sum, a) => sum + (a.apy * a.allocation) / totalAlloc,
            0
        );

        const riskScoreMap: Record<string, number> = {
            low: 20,
            medium: 40,
            high: 60,
        };
        const weightedRisk = strategy.allocations.reduce(
            (sum, a) => sum + (riskScoreMap[a.riskLevel] * a.allocation) / totalAlloc,
            0
        );

        const stableAssets = ["USDC", "USDT", "DAI"];
        const stablecoinPercent = strategy.allocations
            .filter(a => stableAssets.includes(a.asset))
            .reduce((sum, a) => sum + a.allocation, 0);

        return {
            apy: weightedApy,
            riskScore: weightedRisk,
            stablecoinPercent,
        };
    }, [strategy.allocations]);

    if (strategy.allocations.length === 0) {
        return (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center">
                <p className="text-sm text-slate-500">
                    Add allocations to compare with curators
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Curator selector */}
            <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
                {CURATORS.map(curator => (
                    <button
                        key={curator.slug}
                        onClick={() => setSelectedCurator(curator.slug)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                            selectedCurator === curator.slug
                                ? "bg-slate-600 text-white"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        {curator.name}
                    </button>
                ))}
            </div>

            {/* Comparison card */}
            {comparison && (
                <ComparisonCard comparison={comparison} userMetrics={userMetrics} />
            )}
        </div>
    );
}
