"use client";

import { useState } from "react";
import { GraduationCap, Scale, Grid3X3, Clock, Shield, Droplet, Link, ChevronRight, BookOpen } from "lucide-react";
import { CURATION_PRINCIPLES, CurationPrinciple } from "@/lib/curate/curation-principles";

const ICON_MAP = {
    scale: Scale,
    grid: Grid3X3,
    clock: Clock,
    shield: Shield,
    droplet: Droplet,
    link: Link,
};

const COLOR_CLASSES = {
    cyan: {
        bg: "from-cyan-500/20 to-cyan-500/5",
        border: "border-cyan-500/30",
        icon: "text-cyan-400",
        glow: "group-hover:shadow-cyan-500/20",
    },
    purple: {
        bg: "from-purple-500/20 to-purple-500/5",
        border: "border-purple-500/30",
        icon: "text-purple-400",
        glow: "group-hover:shadow-purple-500/20",
    },
    green: {
        bg: "from-green-500/20 to-green-500/5",
        border: "border-green-500/30",
        icon: "text-green-400",
        glow: "group-hover:shadow-green-500/20",
    },
    yellow: {
        bg: "from-yellow-500/20 to-yellow-500/5",
        border: "border-yellow-500/30",
        icon: "text-yellow-400",
        glow: "group-hover:shadow-yellow-500/20",
    },
    blue: {
        bg: "from-blue-500/20 to-blue-500/5",
        border: "border-blue-500/30",
        icon: "text-blue-400",
        glow: "group-hover:shadow-blue-500/20",
    },
    orange: {
        bg: "from-orange-500/20 to-orange-500/5",
        border: "border-orange-500/30",
        icon: "text-orange-400",
        glow: "group-hover:shadow-orange-500/20",
    },
};

interface PrincipleDetailCardProps {
    principle: CurationPrinciple;
    isExpanded: boolean;
    onToggle: () => void;
}

function PrincipleDetailCard({ principle, isExpanded, onToggle }: PrincipleDetailCardProps) {
    const Icon = ICON_MAP[principle.icon];
    const colors = COLOR_CLASSES[principle.color as keyof typeof COLOR_CLASSES];

    return (
        <div
            className={`
                group relative overflow-hidden rounded-xl border transition-all duration-300
                ${colors.border} ${isExpanded ? "bg-slate-800/50" : "bg-slate-900/50 hover:bg-slate-800/30"}
                ${isExpanded ? "shadow-lg" : ""} ${colors.glow}
            `}
        >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`} />

            {/* Header - always visible */}
            <button
                onClick={onToggle}
                className="relative w-full p-5 flex items-start gap-4 text-left"
            >
                <div className={`p-3 rounded-xl bg-slate-800/80 ${colors.icon} shrink-0`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">{principle.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{principle.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-500 shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="relative px-5 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                    {/* Deep explanation */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-slate-500" />
                            <h4 className="text-sm font-medium text-slate-300">Understanding This Principle</h4>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed pl-6">
                            {principle.deepExplanation}
                        </p>
                    </div>

                    {/* Example */}
                    <div className={`p-4 rounded-lg bg-slate-800/50 border ${colors.border}`}>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Real Example</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {principle.example}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function LearnCurationSection() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <GraduationCap className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Learn DeFi Curation</h2>
                        <p className="text-sm text-slate-400">Master the 6 principles that guide professional curators</p>
                    </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    These mental models help you understand why curators make specific allocation decisions.
                    Click any principle to learn more and see real examples of how it&apos;s applied.
                </p>
            </div>

            {/* Principles grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {CURATION_PRINCIPLES.map((principle) => (
                    <PrincipleDetailCard
                        key={principle.id}
                        principle={principle}
                        isExpanded={expandedId === principle.id}
                        onToggle={() => setExpandedId(expandedId === principle.id ? null : principle.id)}
                    />
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center py-4">
                <p className="text-sm text-slate-500">
                    See these principles in action in the{" "}
                    <span className="text-cyan-400">Insights</span> tab when exploring curator strategies.
                </p>
            </div>
        </div>
    );
}
