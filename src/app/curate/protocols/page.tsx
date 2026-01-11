import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { getCompanies, type Company } from "@/lib/cindex/companies";
import { ProtocolCard } from "@/components/curate/protocol-card";

// Mark page as dynamic since it uses database
export const dynamic = "force-dynamic";

export default async function ProtocolsPage() {
    const protocolsList = await getCompanies();

    // Handle empty state
    if (protocolsList.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <Link
                        href="/curate"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Yields
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">
                        Protocol Directory
                    </h1>
                    <p className="text-sm text-muted-foreground mb-2">
                        Verified Protocol Intelligence
                    </p>
                    <p className="text-muted-foreground mt-2">
                        No protocols found. Please check your database connection.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/curate"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Yields
                </Link>
                <h1 className="text-3xl font-bold text-foreground">
                    Protocol Directory
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                    Verified Protocol Intelligence
                </p>
                <p className="text-muted-foreground mt-2">
                    Automated data collection showing what protocols actually do — not what they say. The foundation for AI-powered curation.
                </p>
            </div>

            {/* Data Fetching Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="relative flex h-3 w-3 mt-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            Data Collection in Progress
                        </h3>
                        <p className="text-sm text-blue-800">
                            We are currently fetching and verifying data from
                            GitHub, Twitter, npm downloads, and on-chain sources for all
                            protocols. Some metrics may be incomplete or show as
                            zero until the initial data collection is complete.
                            Index scores will be updated automatically as data
                            becomes available.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search protocols..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Total Protocols
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {protocolsList.length}
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        verified
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Avg Index Score
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {protocolsList.length > 0
                            ? Math.round(
                                  protocolsList.reduce(
                                      (sum: number, c: Company) =>
                                          sum + c.overallScore,
                                      0
                                  ) / protocolsList.length
                              )
                            : 0}
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        out of 100
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        DeFi Protocols
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {
                            protocolsList.filter((c: Company) => c.category === "defi")
                                .length
                        }
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        active
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                    <p className="text-sm text-muted-foreground mb-1">
                        Growing Fast
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {
                            protocolsList.filter(
                                (c: Company) => c.trend === "up"
                            ).length
                        }
                    </p>
                    <p className="text-sm text-muted-foreground/75 mt-1">
                        upward trend
                    </p>
                </div>
            </div>

            {/* Protocol Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {protocolsList.map((protocol: Company) => (
                    <ProtocolCard key={protocol.slug} protocol={protocol} />
                ))}
            </div>
        </div>
    );
}
