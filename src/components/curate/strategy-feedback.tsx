"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronRight } from "lucide-react";
import { StrategyFeedback, FeedbackItem, getPrincipleForFeedback } from "@/lib/curate/strategy-feedback";
import { PrincipleModal, usePrincipleModal } from "./curation-principles";

const GRADE_COLORS = {
    A: "text-green-400 bg-green-500/10 border-green-500/30",
    B: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    C: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    D: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    F: "text-red-400 bg-red-500/10 border-red-500/30",
};

const FEEDBACK_ICONS = {
    success: CheckCircle,
    warning: AlertTriangle,
    danger: XCircle,
    info: Info,
};

const FEEDBACK_COLORS = {
    success: "text-green-400 bg-green-500/10 border-green-500/30",
    warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    danger: "text-red-400 bg-red-500/10 border-red-500/30",
    info: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};

interface FeedbackItemCardProps {
    item: FeedbackItem;
    onPrincipleClick?: () => void;
}

function FeedbackItemCard({ item, onPrincipleClick }: FeedbackItemCardProps) {
    const Icon = FEEDBACK_ICONS[item.type];
    const colors = FEEDBACK_COLORS[item.type];
    const principle = item.principleId ? getPrincipleForFeedback(item.principleId) : null;

    return (
        <div className={`p-3 rounded-lg border ${colors}`}>
            <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <p className="text-xs opacity-80 mt-0.5">{item.message}</p>
                    {principle && (
                        <button
                            onClick={onPrincipleClick}
                            className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <span>Learn: {principle.shortName}</span>
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface StrategyFeedbackDisplayProps {
    feedback: StrategyFeedback;
}

export function StrategyFeedbackDisplay({ feedback }: StrategyFeedbackDisplayProps) {
    const { selectedPrinciple, openPrinciple, closePrinciple } = usePrincipleModal();
    const [showAll, setShowAll] = useState(false);

    // Sort feedback: dangers first, then warnings, then successes
    const sortedItems = [...feedback.items].sort((a, b) => {
        const order = { danger: 0, warning: 1, info: 2, success: 3 };
        return order[a.type] - order[b.type];
    });

    const displayItems = showAll ? sortedItems : sortedItems.slice(0, 3);
    const hasMore = sortedItems.length > 3;

    const handlePrincipleClick = (principleId: string) => {
        const principle = getPrincipleForFeedback(principleId);
        if (principle) {
            openPrinciple(principle);
        }
    };

    return (
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
            {/* Grade */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Strategy Analysis</h3>
                <div className={`px-3 py-1 rounded-lg border text-lg font-bold ${GRADE_COLORS[feedback.grade]}`}>
                    {feedback.grade}
                </div>
            </div>

            {/* Score bar */}
            <div>
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Score</span>
                    <span className="text-white">{feedback.overallScore}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${
                            feedback.overallScore >= 75
                                ? "bg-green-500"
                                : feedback.overallScore >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${feedback.overallScore}%` }}
                    />
                </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-slate-400">{feedback.summary}</p>

            {/* Feedback items */}
            {sortedItems.length > 0 && (
                <div className="space-y-2">
                    {displayItems.map((item, idx) => (
                        <FeedbackItemCard
                            key={idx}
                            item={item}
                            onPrincipleClick={
                                item.principleId
                                    ? () => handlePrincipleClick(item.principleId!)
                                    : undefined
                            }
                        />
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            {showAll ? "Show less" : `Show ${sortedItems.length - 3} more`}
                        </button>
                    )}
                </div>
            )}

            {sortedItems.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-2">
                    Add allocations to see feedback
                </p>
            )}

            {/* Principle modal */}
            <PrincipleModal principle={selectedPrinciple} onClose={closePrinciple} />
        </div>
    );
}
