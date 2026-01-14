"use client";

import { useState } from "react";
import { Scale, Grid3X3, Clock, Shield, Droplet, Link, X, ChevronRight } from "lucide-react";
import { CurationPrinciple, CURATION_PRINCIPLES, getPrinciples } from "@/lib/curate/curation-principles";

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
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        icon: "text-cyan-400",
        border: "border-cyan-500/30",
    },
    purple: {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        icon: "text-purple-400",
        border: "border-purple-500/30",
    },
    green: {
        badge: "bg-green-500/10 text-green-400 border-green-500/30",
        icon: "text-green-400",
        border: "border-green-500/30",
    },
    yellow: {
        badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        icon: "text-yellow-400",
        border: "border-yellow-500/30",
    },
    blue: {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        icon: "text-blue-400",
        border: "border-blue-500/30",
    },
    orange: {
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        icon: "text-orange-400",
        border: "border-orange-500/30",
    },
};

interface PrincipleBadgeProps {
    principle: CurationPrinciple;
    onClick?: () => void;
    showIcon?: boolean;
    size?: "sm" | "md";
}

/**
 * Small badge showing a principle - clickable to show full explanation
 */
export function PrincipleBadge({ principle, onClick, showIcon = true, size = "sm" }: PrincipleBadgeProps) {
    const Icon = ICON_MAP[principle.icon];
    const colors = COLOR_CLASSES[principle.color as keyof typeof COLOR_CLASSES];

    return (
        <button
            onClick={onClick}
            className={`
                inline-flex items-center gap-1 rounded-full border transition-colors
                hover:opacity-80
                ${colors.badge}
                ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
            `}
        >
            {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
            <span>{principle.shortName}</span>
        </button>
    );
}

interface PrincipleBadgeGroupProps {
    principleIds: string[];
    onPrincipleClick?: (principle: CurationPrinciple) => void;
    size?: "sm" | "md";
}

/**
 * Group of principle badges for an allocation
 */
export function PrincipleBadgeGroup({ principleIds, onPrincipleClick, size = "sm" }: PrincipleBadgeGroupProps) {
    const principles = getPrinciples(principleIds);

    if (principles.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1">
            {principles.map(principle => (
                <PrincipleBadge
                    key={principle.id}
                    principle={principle}
                    onClick={() => onPrincipleClick?.(principle)}
                    size={size}
                />
            ))}
        </div>
    );
}

interface PrincipleCardProps {
    principle: CurationPrinciple;
    expanded?: boolean;
    onToggle?: () => void;
}

/**
 * Full principle card with explanation
 */
export function PrincipleCard({ principle, expanded = false, onToggle }: PrincipleCardProps) {
    const Icon = ICON_MAP[principle.icon];
    const colors = COLOR_CLASSES[principle.color as keyof typeof COLOR_CLASSES];

    return (
        <div className={`border rounded-lg overflow-hidden ${colors.border} bg-slate-800/30`}>
            <button
                onClick={onToggle}
                className="w-full p-3 flex items-start gap-3 text-left hover:bg-slate-800/50 transition-colors"
            >
                <div className={`p-2 rounded-lg bg-slate-800/50 ${colors.icon}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white">{principle.name}</h4>
                    <p className="text-sm text-slate-400 mt-0.5">{principle.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-500 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>

            {expanded && (
                <div className="px-3 pb-3 pt-0 space-y-3">
                    <div className="pl-12">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {principle.deepExplanation}
                        </p>
                    </div>
                    <div className="pl-12 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Example</div>
                        <p className="text-sm text-slate-400">
                            {principle.example}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

interface PrincipleModalProps {
    principle: CurationPrinciple | null;
    onClose: () => void;
}

/**
 * Modal showing full principle details
 */
export function PrincipleModal({ principle, onClose }: PrincipleModalProps) {
    if (!principle) return null;

    const Icon = ICON_MAP[principle.icon];
    const colors = COLOR_CLASSES[principle.color as keyof typeof COLOR_CLASSES];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-800 ${colors.icon}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{principle.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-slate-300">{principle.description}</p>

                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Deep Dive</h4>
                        <p className="text-slate-300 leading-relaxed">
                            {principle.deepExplanation}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Real Example</h4>
                        <p className="text-slate-300">
                            {principle.example}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface AllPrinciplesListProps {
    showExpanded?: boolean;
}

/**
 * List of all curation principles - for educational overview
 */
export function AllPrinciplesList({ showExpanded = false }: AllPrinciplesListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            {CURATION_PRINCIPLES.map(principle => (
                <PrincipleCard
                    key={principle.id}
                    principle={principle}
                    expanded={showExpanded || expandedId === principle.id}
                    onToggle={() => setExpandedId(expandedId === principle.id ? null : principle.id)}
                />
            ))}
        </div>
    );
}

/**
 * Hook for managing principle modal state
 */
export function usePrincipleModal() {
    const [selectedPrinciple, setSelectedPrinciple] = useState<CurationPrinciple | null>(null);

    return {
        selectedPrinciple,
        openPrinciple: (principle: CurationPrinciple) => setSelectedPrinciple(principle),
        closePrinciple: () => setSelectedPrinciple(null),
    };
}
