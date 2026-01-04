"use client";

import Link from "next/link";
import { Link2, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface SynergyCTAProps {
  variant?: "primary" | "secondary" | "footer";
  className?: string;
}

export function SynergyCTA({ variant = "primary", className = "" }: SynergyCTAProps) {
  const { data: session } = useSession();

  const href = session ? "/synergy/discover" : "/auth/signin?callbackUrl=/synergy/discover";

  if (variant === "footer") {
    return (
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Synergy {!session && <span className="text-xs">(Sign in)</span>}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 transition-colors font-medium ${className}`}
      >
        <div className="flex flex-col items-center">
          <span>Find Synergies</span>
          {!session && <span className="text-xs">Sign in required</span>}
        </div>
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  // Primary variant (hero section)
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold text-lg relative group ${className}`}
    >
      <Link2 className="h-6 w-6" />
      <div className="flex flex-col items-start">
        <span>Find Real Synergies</span>
        {!session && <span className="text-xs font-normal text-green-100">Sign in required</span>}
      </div>
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}

// For the mobile card variant
export function SynergyCTACard() {
  const { data: session } = useSession();
  const href = session ? "/synergy/discover" : "/auth/signin?callbackUrl=/synergy/discover";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium w-full justify-center"
    >
      <div className="flex flex-col items-center">
        <span>Find Synergies</span>
        {!session && <span className="text-xs">Sign in required</span>}
      </div>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
