"use client";

import { useState, useMemo } from "react";
import { OpportunityCard, type OpportunityCardData } from "./opportunity-card";
import { Sparkles, Target, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiscoveryGridProps {
  opportunities: OpportunityCardData[];
  currentCompanyCategory: string;
  onSwipe: (partnerSlug: string, action: "interested" | "passed" | "saved") => Promise<void>;
  alreadySwipedSlugs?: string[];
}

export function DiscoveryGrid({
  opportunities,
  currentCompanyCategory,
  onSwipe,
  alreadySwipedSlugs = [],
}: DiscoveryGridProps) {
  const [processingSlugs, setProcessingSlugs] = useState<Set<string>>(new Set());

  const handleAction = async (partnerSlug: string, action: "interested" | "passed" | "saved") => {
    setProcessingSlugs((prev) => new Set(prev).add(partnerSlug));
    try {
      await onSwipe(partnerSlug, action);
    } finally {
      setProcessingSlugs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(partnerSlug);
        return newSet;
      });
    }
  };

  // Filter out already reviewed opportunities
  const availableOpportunities = useMemo(() => {
    return opportunities.filter((p) => !alreadySwipedSlugs.includes(p.partnerSlug));
  }, [opportunities, alreadySwipedSlugs]);

  // Group opportunities
  const bestMatches = useMemo(() => {
    return availableOpportunities
      .filter((p) => p.matchScore >= 85)
      .slice(0, 6);
  }, [availableOpportunities]);

  const similarCategory = useMemo(() => {
    return availableOpportunities
      .filter((p) => p.partnerCategory.toLowerCase() === currentCompanyCategory.toLowerCase())
      .slice(0, 6);
  }, [availableOpportunities, currentCompanyCategory]);

  const complementary = useMemo(() => {
    return availableOpportunities
      .filter((p) => p.partnerCategory.toLowerCase() !== currentCompanyCategory.toLowerCase() && p.matchScore >= 70)
      .slice(0, 6);
  }, [availableOpportunities, currentCompanyCategory]);

  if (availableOpportunities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          All Caught Up!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You've reviewed all available synergy opportunities. Check back later for new recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Best Matches Section */}
      {bestMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Best Matches
              </h2>
              <p className="text-sm text-muted-foreground">
                Highest compatibility scores - strong synergy potential
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestMatches.map((opportunity) => (
              <OpportunityCard
                key={opportunity.partnerSlug}
                opportunity={opportunity}
                onAction={(action) => handleAction(opportunity.partnerSlug, action)}
                disabled={processingSlugs.has(opportunity.partnerSlug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Similar Category Section */}
      {similarCategory.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Similar {currentCompanyCategory.toUpperCase()} Companies
              </h2>
              <p className="text-sm text-muted-foreground">
                Companies in your category for strategic integration
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarCategory.map((opportunity) => (
              <OpportunityCard
                key={opportunity.partnerSlug}
                opportunity={opportunity}
                onAction={(action) => handleAction(opportunity.partnerSlug, action)}
                disabled={processingSlugs.has(opportunity.partnerSlug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Complementary Partners Section */}
      {complementary.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-50">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Complementary Companies
              </h2>
              <p className="text-sm text-muted-foreground">
                Cross-category synergies for expansion and co-marketing
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complementary.map((opportunity) => (
              <OpportunityCard
                key={opportunity.partnerSlug}
                opportunity={opportunity}
                onAction={(action) => handleAction(opportunity.partnerSlug, action)}
                disabled={processingSlugs.has(opportunity.partnerSlug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Recommendations Section */}
      {availableOpportunities.length > (bestMatches.length + similarCategory.length + complementary.length) && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              All Recommendations
            </h2>
            <p className="text-sm text-muted-foreground">
              {availableOpportunities.length} potential connections
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.partnerSlug}
                opportunity={opportunity}
                onAction={(action) => handleAction(opportunity.partnerSlug, action)}
                disabled={processingSlugs.has(opportunity.partnerSlug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
