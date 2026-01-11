"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    Link2,
    Users,
    X,
    Percent,
    List,
    TrendingUp,
    Home,
    Target,
    UserPlus,
    Sparkles,
    MessageCircle,
    Lock,
    Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const curateNav = [
    { name: "Yields", href: "/curate", icon: Percent },
    { name: "Protocols", href: "/curate/protocols", icon: Building2 },
];

const synergyNav = [
    { name: "Discover", href: "/synergy/discover", icon: Sparkles },
    { name: "Connections", href: "/synergy/connections", icon: UserPlus },
    {
        name: "Messages",
        href: "/synergy/messages",
        icon: MessageCircle,
        disabled: true,
    },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const isCurate = pathname.startsWith("/curate");
    const isSynergy = pathname.startsWith("/synergy");
    const { data: session } = useSession();
    const [hasClaimed, setHasClaimed] = useState(false);

    // Check if user has claimed a company
    useEffect(() => {
        if (session) {
            fetch("/api/profile/status")
                .then((res) => res.json())
                .then((data) => {
                    setHasClaimed(data.hasClaimed);
                })
                .catch((error) => {
                    console.error("Error checking profile status:", error);
                });
        } else {
            setHasClaimed(false);
        }
    }, [session]);

    return (
        <>
            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-muted border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Mobile Header with Close Button */}
                    <div className="flex h-16 items-center justify-end border-b border-border px-6">
                        <button
                            onClick={onClose}
                            className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
                        {/* Home */}
                        <Link
                            href="/"
                            onClick={onClose}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                !isCurate && !isSynergy
                                    ? "bg-gray-100 text-foreground"
                                    : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                            )}
                        >
                            <Home className="mr-3 h-5 w-5" />
                            Home
                        </Link>

                        {/* Claim Company - Only show if signed in and hasn't claimed yet */}
                        {session && !hasClaimed && (
                            <Link
                                href="/dashboard/claim-company"
                                onClick={onClose}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all border-2 border-dashed",
                                    pathname === "/dashboard/claim-company"
                                        ? "bg-green-50 border-green-600 text-green-700"
                                        : "border-green-300 text-green-700 hover:bg-green-50 hover:border-green-600"
                                )}
                            >
                                <Award className="mr-3 h-5 w-5" />
                                Claim Your Company
                            </Link>
                        )}

                        {/* CURATE Section */}
                        <div>
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <Percent className="h-4 w-4 text-cyan-600" />
                                Curate
                            </div>
                            <div className="space-y-1">
                                {curateNav.map((item) => {
                                    const isActive =
                                        item.href === "/curate"
                                            ? pathname === "/curate"
                                            : pathname === item.href ||
                                              pathname.startsWith(
                                                  item.href + "/"
                                              );
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                isActive
                                                    ? "text-white bg-cyan-600 shadow-lg shadow-cyan-600/40"
                                                    : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SYNERGY Section */}
                        <div>
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <Link2 className="h-4 w-4 text-green-600" />
                                Synergy
                                {!session && (
                                    <span className="ml-auto text-[10px] normal-case text-orange-600 flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        Sign in
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                {synergyNav.map((item) => {
                                    const isActive =
                                        item.href === "/synergy"
                                            ? pathname === "/synergy"
                                            : pathname === item.href ||
                                              pathname.startsWith(
                                                  item.href + "/"
                                              );
                                    const Icon = item.icon;

                                    if (item.disabled) {
                                        return (
                                            <div
                                                key={item.name}
                                                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                                            >
                                                <Icon className="mr-3 h-5 w-5" />
                                                {item.name}
                                                <span className="ml-auto text-xs">
                                                    (Soon)
                                                </span>
                                            </div>
                                        );
                                    }

                                    // If not signed in, redirect to sign-in page
                                    const href = !session
                                        ? `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`
                                        : item.href;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                isActive
                                                    ? "text-white bg-green-600 shadow-lg shadow-green-600/40"
                                                    : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                            {!session && (
                                                <Lock className="ml-auto h-3.5 w-3.5 text-orange-600" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-border p-4">
                        <div className="text-xs text-muted-foreground/75">
                            <div className="font-medium text-foreground">
                                FABRKNT
                            </div>
                            <div className="mt-1">DeFi Intelligence Platform</div>
                            <div className="mt-1 text-cyan-600">Preview</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full w-64 flex-col bg-muted border-r border-border">
                {/* Navigation */}
                <nav className="flex-1 space-y-4 px-3 py-4 pt-6">
                    {/* Home */}
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            !isCurate && !isSynergy
                                ? "bg-gray-100 text-foreground"
                                : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                        )}
                    >
                        <Home className="mr-3 h-5 w-5" />
                        Home
                    </Link>

                    {/* Claim Company - Only show if signed in and hasn't claimed yet */}
                    {session && !hasClaimed && (
                        <Link
                            href="/dashboard/claim-company"
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all border-2 border-dashed",
                                pathname === "/dashboard/claim-company"
                                    ? "bg-green-50 border-green-600 text-green-700"
                                    : "border-green-300 text-green-700 hover:bg-green-50 hover:border-green-600"
                            )}
                        >
                            <Award className="mr-3 h-5 w-5" />
                            Claim Your Company
                        </Link>
                    )}

                    {/* CURATE Section */}
                    <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Percent className="h-4 w-4 text-cyan-600" />
                            Curate
                        </div>
                        <div className="space-y-1">
                            {curateNav.map((item) => {
                                const isActive =
                                    item.href === "/curate"
                                        ? pathname === "/curate"
                                        : pathname === item.href ||
                                          pathname.startsWith(item.href + "/");
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                            isActive
                                                ? "text-white bg-cyan-600 shadow-lg shadow-cyan-600/40"
                                                : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* SYNERGY Section */}
                    <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <Link2 className="h-4 w-4 text-green-600" />
                            Synergy
                            {!session && (
                                <span className="ml-auto text-[10px] normal-case text-orange-600 flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Sign in
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            {synergyNav.map((item) => {
                                const isActive =
                                    item.href === "/synergy"
                                        ? pathname === "/synergy"
                                        : pathname === item.href ||
                                          pathname.startsWith(item.href + "/");
                                const Icon = item.icon;

                                if (item.disabled) {
                                    return (
                                        <div
                                            key={item.name}
                                            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                            <span className="ml-auto text-xs">
                                                (Soon)
                                            </span>
                                        </div>
                                    );
                                }

                                // If not signed in, redirect to sign-in page
                                const href = !session
                                    ? `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`
                                    : item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={href}
                                        className={cn(
                                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                            isActive
                                                ? "text-white bg-green-600 shadow-lg shadow-green-600/40"
                                                : "text-foreground/90 hover:bg-gray-50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                        {!session && (
                                            <Lock className="ml-auto h-3.5 w-3.5 text-orange-600" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <div className="text-xs text-muted-foreground/75">
                        <div className="font-medium text-foreground">
                            FABRKNT
                        </div>
                        <div className="mt-1">DeFi Intelligence Platform</div>
                        <div className="mt-1 text-cyan-600">Preview</div>
                    </div>
                </div>
            </div>
        </>
    );
}
