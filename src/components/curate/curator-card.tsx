"use client";

import { Shield, ExternalLink, ChevronRight } from "lucide-react";
import { CuratorProfile } from "@/lib/curate/curators";

interface CuratorCardProps {
    curator: CuratorProfile;
    onViewStrategy?: () => void;
}

function formatAum(aum: number): string {
    if (aum >= 1_000_000_000) return `$${(aum / 1_000_000_000).toFixed(1)}B`;
    if (aum >= 1_000_000) return `$${(aum / 1_000_000).toFixed(0)}M`;
    return `$${(aum / 1_000).toFixed(0)}K`;
}

const TRUST_COLORS = {
    high: "text-green-400 bg-green-500/20",
    medium: "text-yellow-400 bg-yellow-500/20",
    low: "text-red-400 bg-red-500/20",
};

function getTrustLevel(score: number): "high" | "medium" | "low" {
    if (score >= 85) return "high";
    if (score >= 70) return "medium";
    return "low";
}

export function CuratorCard({ curator, onViewStrategy }: CuratorCardProps) {
    const trustLevel = getTrustLevel(curator.trustScore);

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">{curator.name}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {curator.platforms.map(p => p.protocol).join(", ")}
                        </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg ${TRUST_COLORS[trustLevel]}`}>
                        <div className="flex items-center gap-1.5">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">{curator.trustScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {curator.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">AUM</div>
                        <div className="text-lg font-semibold text-white">{formatAum(curator.aum)}+</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Track Record</div>
                        <div className="text-sm font-medium text-white">{curator.trackRecord.split(",")[0]}</div>
                    </div>
                </div>

                {/* Platforms */}
                <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Active Platforms</div>
                    <div className="flex flex-wrap gap-2">
                        {curator.platforms.slice(0, 4).map((platform) => (
                            <span
                                key={platform.protocol}
                                className="px-2 py-1 text-xs rounded bg-slate-700/50 text-slate-300 border border-slate-600/50"
                            >
                                {platform.protocol} ({platform.chain})
                            </span>
                        ))}
                        {curator.platforms.length > 4 && (
                            <span className="px-2 py-1 text-xs rounded bg-slate-700/50 text-slate-400">
                                +{curator.platforms.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2">Highlights</div>
                    <ul className="space-y-1">
                        {curator.highlights.slice(0, 2).map((highlight, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-cyan-400 mt-0.5">•</span>
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {curator.website && (
                        <a
                            href={curator.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Website
                        </a>
                    )}
                    {curator.twitter && (
                        <a
                            href={`https://twitter.com/${curator.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            @{curator.twitter}
                        </a>
                    )}
                </div>
                {onViewStrategy && (
                    <button
                        onClick={onViewStrategy}
                        className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        View Strategy
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
