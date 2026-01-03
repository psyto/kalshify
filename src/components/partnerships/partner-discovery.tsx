"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface UserCompany {
  slug: string;
  name: string;
  category: string;
  logo: string | null;
}

interface Company {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  overallScore: number | null;
  teamHealthScore: number | null;
  growthScore: number | null;
  socialScore: number | null;
  walletQualityScore: number | null;
  trend: string | null;
  indexData: any;
}

interface PartnerMatch {
  partner: Company;
  matchScore: number;
  compatibility: {
    userOverlap: number;
    technicalFit: number;
    categoryFit: string;
    synergy: string;
  };
  projectedImpact: {
    runwayExtension: number;
    userGrowth: number;
    revenueOpportunity: number;
  };
  partnershipType: string;
  reasoning: string;
}

interface Props {
  userCompany: UserCompany;
  allCompanies: Company[];
  swipedPartners: Set<string>;
}

export function PartnerDiscovery({ userCompany, allCompanies, swipedPartners }: Props) {
  const [matches, setMatches] = useState<PartnerMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const { toast } = useToast();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Load matches on mount
  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      setLoading(true);

      // Filter out already-swiped companies
      const availableCompanies = allCompanies.filter(
        (c) => !swipedPartners.has(c.slug)
      );

      // Get matches from AI engine
      const response = await fetch("/api/partnerships/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: userCompany.slug,
          companies: availableCompanies,
          limit: 50, // Get top 50 matches
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load matches");
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error loading matches:", error);
      toast({
        title: "Error",
        description: "Failed to load partnership matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipe(action: "interested" | "passed" | "super_like") {
    if (swiping || currentIndex >= matches.length) return;

    setSwiping(true);
    const currentMatch = matches[currentIndex];

    try {
      // Save swipe to database
      const response = await fetch("/api/partnerships/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: userCompany.slug,
          partnerSlug: currentMatch.partner.slug,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save swipe");
      }

      const result = await response.json();

      // Check for mutual match
      if (result.isMatch) {
        toast({
          title: "It's a Match! 🎉",
          description: `You and ${currentMatch.partner.name} are interested in partnering!`,
        });
      }

      // Move to next card
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving swipe:", error);
      toast({
        title: "Error",
        description: "Failed to save your choice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSwiping(false);
    }
  }

  function handleDragEnd(event: any, info: PanInfo) {
    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      // Swipe left = pass
      if (info.offset.x < 0) {
        handleSwipe("passed");
      }
      // Swipe right = interested
      else {
        handleSwipe("interested");
      }
    } else {
      // Reset position
      x.set(0);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Finding your perfect partners...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0 || currentIndex >= matches.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">No More Matches</h2>
          <p className="text-muted-foreground">
            You've reviewed all available partnership opportunities for {userCompany.name}.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for new companies, or view your existing matches.
          </p>
          <Button asChild>
            <a href="/partnerships/matches">View My Matches →</a>
          </Button>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];
  const remainingCount = matches.length - currentIndex;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userCompany.logo && (
              <Image
                src={userCompany.logo}
                alt={userCompany.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="font-semibold">{userCompany.name}</h1>
              <p className="text-xs text-muted-foreground">Partnership Discovery</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {remainingCount} {remainingCount === 1 ? "match" : "matches"} remaining
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24 md:pb-8">
        <div className="w-full max-w-lg">
          {/* Card Stack */}
          <div className="relative aspect-[3/4] max-h-[600px]">
            {/* Next card preview (behind) */}
            {currentIndex + 1 < matches.length && (
              <div className="absolute inset-0 bg-card border rounded-2xl scale-95 opacity-50" />
            )}

            {/* Current card */}
            <motion.div
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <PartnerCard match={currentMatch} />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-16 w-16 border-2 border-red-500 hover:bg-red-50 hover:border-red-600"
              onClick={() => handleSwipe("passed")}
              disabled={swiping}
            >
              <X className="h-8 w-8 text-red-500" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-20 w-20 border-2 border-blue-500 hover:bg-blue-50 hover:border-blue-600"
              onClick={() => handleSwipe("super_like")}
              disabled={swiping}
            >
              <Star className="h-10 w-10 text-blue-500" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-16 w-16 border-2 border-green-500 hover:bg-green-50 hover:border-green-600"
              onClick={() => handleSwipe("interested")}
              disabled={swiping}
            >
              <Heart className="h-8 w-8 text-green-500" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              <span>Super Like</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-500" />
              <span>Interested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerCard({ match }: { match: PartnerMatch }) {
  const { partner, matchScore, compatibility, projectedImpact, partnershipType, reasoning } = match;

  return (
    <div className="h-full bg-card border rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header with logo and match score */}
      <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {partner.logo && (
              <Image
                src={partner.logo}
                alt={partner.name}
                width={64}
                height={64}
                className="rounded-xl bg-background p-2"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{partner.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{partner.category}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{matchScore}</div>
            <div className="text-xs text-muted-foreground">Match</div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        {partner.description && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {partner.description}
            </p>
          </div>
        )}

        {/* Partnership Type */}
        <div>
          <h3 className="font-semibold mb-2">Partnership Type</h3>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
            {partnershipType.replace(/_/g, " ")}
          </div>
        </div>

        {/* Synergy */}
        <div>
          <h3 className="font-semibold mb-2">Why This Match?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {compatibility.synergy}
          </p>
        </div>

        {/* Projected Impact */}
        <div>
          <h3 className="font-semibold mb-3">Projected Impact</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">+{projectedImpact.runwayExtension}</div>
              <div className="text-xs text-muted-foreground">Months Runway</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">+{projectedImpact.userGrowth}%</div>
              <div className="text-xs text-muted-foreground">User Growth</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">
                ${(projectedImpact.revenueOpportunity / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">Revenue/mo</div>
            </div>
          </div>
        </div>

        {/* Compatibility Details */}
        <div>
          <h3 className="font-semibold mb-3">Compatibility</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">User Overlap</span>
              <span className="font-medium">{compatibility.userOverlap.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Technical Fit</span>
              <span className="font-medium">{compatibility.technicalFit}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{compatibility.categoryFit}</span>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        {(partner.overallScore || partner.teamHealthScore || partner.growthScore) && (
          <div>
            <h3 className="font-semibold mb-3">Health Metrics</h3>
            <div className="space-y-2">
              {partner.overallScore && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Score</span>
                  <span className="font-medium">{partner.overallScore}/100</span>
                </div>
              )}
              {partner.teamHealthScore && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Health</span>
                  <span className="font-medium">{partner.teamHealthScore}/100</span>
                </div>
              )}
              {partner.growthScore && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium">{partner.growthScore}/100</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Website Link */}
        {partner.website && (
          <div>
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Visit Website →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
