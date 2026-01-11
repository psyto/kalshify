import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    Minus,
    Github,
    Activity,
    Twitter,
    Zap,
    Globe,
    Newspaper,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { formatNumber, formatCategory, formatSubcategory } from "@/lib/utils/format";
import { NewsSection } from "@/components/cindex/news-section";
import { ClaimProfileButton } from "@/components/claim-profile-button";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};

const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    stable: "text-gray-600 bg-gray-50",
};

const categoryColors: Record<string, string> = {
    defi: "bg-purple-100 text-purple-700",
    "defi-infra": "bg-blue-100 text-blue-700",
};

const chainColors = {
    ethereum: "bg-slate-100 text-slate-700",
    base: "bg-blue-50 text-blue-600",
    arbitrum: "bg-sky-50 text-sky-600",
    solana: "bg-violet-50 text-violet-600",
};

function getProtocolSocialLinks(slug: string): {
    github?: string;
    twitter?: string;
    githubOrg?: string;
} {
    const socialMap: Record<string, { github: string; twitter: string }> = {
        orca: { github: "orca-so", twitter: "orca_so" },
        jupiter: { github: "jup-ag", twitter: "JupiterExchange" },
        uniswap: { github: "Uniswap", twitter: "Uniswap" },
        morpho: { github: "morpho-org", twitter: "MorphoLabs" },
        euler: { github: "euler-xyz", twitter: "eulerfinance" },
        rocketpool: { github: "rocket-pool", twitter: "Rocket_Pool" },
        blur: { github: "blur-io", twitter: "blur_io" },
        safe: { github: "safe-global", twitter: "safe" },
        drift: { github: "drift-labs", twitter: "DriftProtocol" },
        marginfi: { github: "marginfi", twitter: "marginfi" },
        kamino: { github: "Kamino-Finance", twitter: "KaminoFinance" },
        tensor: { github: "tensor-hq", twitter: "tensor_hq" },
        lido: { github: "lidofinance", twitter: "LidoFinance" },
        zora: { github: "ourzora", twitter: "zora" },
        zerox: { github: "0xProject", twitter: "0xProject" },
        parallel: { github: "ParallelNFT", twitter: "ParallelTCG" },
        velodrome: { github: "velodrome-finance", twitter: "VelodromeFi" },
        metaplex: { github: "metaplex-foundation", twitter: "metaplex" },
        jito: { github: "jito-foundation", twitter: "jito_sol" },
        staratlas: { github: "staratlasmeta", twitter: "staratlas" },
        aurory: { github: "AuroryProject", twitter: "AuroryProject" },
        mangomarkets: { github: "blockworks-foundation", twitter: "mangomarkets" },
        fabrknt: { github: "fabrknt", twitter: "fabrknt" },
    };

    const social = socialMap[slug.toLowerCase()];
    if (!social) return {};

    return {
        github: `https://github.com/${social.github}`,
        twitter: `https://twitter.com/${social.twitter}`,
        githubOrg: social.github,
    };
}

async function getProtocolData(slug: string) {
    try {
        const protocol = await prisma.company.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                subcategory: true,
                description: true,
                logo: true,
                website: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                walletQualityScore: true,
                trend: true,
                isListed: true,
                indexData: true,
                lastFetchedAt: true,
            },
        });

        if (!protocol) {
            return null;
        }

        const indexData = protocol.indexData as any;
        const github = indexData?.github || {};
        const onchain = indexData?.onchain || {};
        const twitter = indexData?.twitter || {};

        return {
            ...protocol,
            teamHealth: {
                score: protocol.teamHealthScore,
                githubCommits30d: github.totalCommits30d || 0,
                activeContributors: github.activeContributors30d || 0,
                contributorRetention:
                    github.activeContributors30d && github.totalContributors
                        ? Math.round(
                              (github.activeContributors30d /
                                  github.totalContributors) *
                                  100
                          )
                        : 0,
                codeQuality: Math.min(protocol.teamHealthScore, 100),
            },
            growth: {
                score: protocol.growthScore,
                onChainActivity30d: onchain.transactionCount30d || 0,
                walletGrowth: 0,
                userGrowthRate: 0,
                tvl: onchain.tvl,
                volume30d: onchain.volume30d,
                npmDownloads30d: indexData?.npm?.downloads30d,
            },
            social: {
                score: protocol.socialScore,
                twitterFollowers: indexData?.twitter?.followers,
                discordMembers: 0,
                telegramMembers: 0,
                communityEngagement: protocol.socialScore,
            },
            news: indexData?.news || [],
            scores: {
                overall: protocol.overallScore,
                teamHealth: protocol.teamHealthScore,
                growthScore: protocol.growthScore,
                socialScore: protocol.socialScore,
                walletQuality: protocol.walletQualityScore,
                breakdown: {
                    github: {
                        contributorScore: github.totalContributors
                            ? Math.min((github.totalContributors / 50) * 100, 100)
                            : 0,
                        activityScore: github.totalCommits30d
                            ? Math.min((github.totalCommits30d / 200) * 100, 100)
                            : 0,
                        retentionScore:
                            github.activeContributors30d && github.totalContributors
                                ? Math.round(
                                      (github.activeContributors30d /
                                          github.totalContributors) *
                                          100
                                  )
                                : 0,
                    },
                    onchain: {
                        userGrowthScore: Math.min(protocol.growthScore, 100),
                        transactionScore: Math.min(
                            (onchain.transactionCount30d || 0) / 100,
                            100
                        ),
                        tvlScore: onchain.tvl
                            ? Math.min(onchain.tvl / 1000000, 100)
                            : 0,
                        attentionScore: Math.min(protocol.socialScore, 100),
                    },
                    wallet: {
                        distributionScore: Math.min(protocol.walletQualityScore, 100),
                        smartMoneyScore: Math.min(protocol.walletQualityScore * 0.8, 100),
                    },
                    social: {
                        followersScore: Math.min((twitter.followers || 0) / 10000, 100),
                        engagementScore: twitter.engagement30d
                            ? Math.min((twitter.engagement30d.likes || 0) / 100, 100)
                            : 0,
                    },
                },
            },
        };
    } catch (error) {
        console.error("Error fetching protocol data:", error);
        return null;
    }
}

const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://www.fabrknt.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const protocolData = await getProtocolData(slug);

    if (!protocolData) {
        return {
            title: "Protocol Not Found",
            description: "The requested protocol profile could not be found.",
        };
    }

    const description =
        protocolData.description ||
        `View ${protocolData.name}'s verified DeFi metrics, team health (${protocolData.teamHealthScore}/100), growth score (${protocolData.growthScore}/100), and social engagement. Overall score: ${protocolData.overallScore}/100.`;

    const ogImage = protocolData.logo
        ? protocolData.logo.startsWith("http")
            ? protocolData.logo
            : `${baseUrl}${protocolData.logo}`
        : `${baseUrl}/og-image.png`;

    return {
        title: `${protocolData.name} - DeFi Protocol Profile`,
        description,
        keywords: [
            protocolData.name,
            protocolData.category,
            "DeFi",
            "Protocol",
            "Profile",
            "On-chain Metrics",
            "Team Health",
            "Growth Metrics",
        ],
        openGraph: {
            title: `${protocolData.name} - DeFi Protocol Profile | Fabrknt`,
            description,
            url: `${baseUrl}/curate/protocol/${slug}`,
            siteName: "Fabrknt",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${protocolData.name} - DeFi Protocol Profile`,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${protocolData.name} - DeFi Protocol Profile`,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: `/curate/protocol/${slug}`,
        },
    };
}

export default async function ProtocolProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const protocolData = await getProtocolData(slug);

    if (!protocolData) {
        notFound();
    }

    const protocol = protocolData;
    const scores = protocolData.scores;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: protocol.name,
        description: protocol.description || `${protocol.name} - DeFi ${protocol.category} protocol`,
        url: protocol.website || `${baseUrl}/curate/protocol/${slug}`,
        logo: protocol.logo?.startsWith("http")
            ? protocol.logo
            : protocol.logo
            ? `${baseUrl}${protocol.logo}`
            : `${baseUrl}/logo.png`,
        sameAs: [
            ...(getProtocolSocialLinks(slug).github ? [getProtocolSocialLinks(slug).github] : []),
            ...(getProtocolSocialLinks(slug).twitter ? [getProtocolSocialLinks(slug).twitter] : []),
        ],
        aggregateRating: protocol.overallScore
            ? {
                  "@type": "AggregateRating",
                  ratingValue: protocol.overallScore / 20,
                  bestRating: 5,
                  worstRating: 0,
              }
            : undefined,
    };

    const trend = protocol.trend as "up" | "down" | "stable";
    const TrendIcon = trendIcons[trend];
    const scoreColor =
        protocol.overallScore >= 85
            ? "text-green-600"
            : protocol.overallScore >= 70
            ? "text-yellow-600"
            : "text-red-600";

    const socialLinks = getProtocolSocialLinks(protocol.slug);
    const category = protocol.category as "defi" | "defi-infra";
    const chain = ((protocolData.indexData as any)?.onchain?.chain || "ethereum") as
        | "ethereum"
        | "base"
        | "arbitrum"
        | "solana";

    return (
        <div className="min-h-screen bg-muted">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="p-8">
                    <Link
                        href="/curate/protocols"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Protocols
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                                {protocol.logo ? (
                                    <img
                                        src={protocol.logo}
                                        alt={`${protocol.name} logo`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-4xl font-bold text-muted-foreground">
                                        {protocol.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">
                                    {protocol.name}
                                </h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full font-medium",
                                            categoryColors[category]
                                        )}
                                    >
                                        {formatCategory(category)}
                                    </span>
                                    {protocol.subcategory && (
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                                            {formatSubcategory(protocol.subcategory)}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full font-medium",
                                            chainColors[chain]
                                        )}
                                    >
                                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                                    </span>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                            trendColors[trend]
                                        )}
                                    >
                                        <TrendIcon className="h-3 w-3" />
                                        <span>
                                            {trend === "up"
                                                ? "Growing"
                                                : trend === "down"
                                                ? "Declining"
                                                : "Stable"}
                                        </span>
                                    </div>
                                    {protocol.isListed && (
                                        <Link
                                            href={`/synergy/opportunities`}
                                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                                        >
                                            <span>Listed in Marketplace</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    {protocol.description}
                                </p>
                                {protocol.website && (
                                    <a
                                        href={protocol.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 mt-2"
                                    >
                                        {protocol.website}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 items-end">
                            <ClaimProfileButton
                                companySlug={protocol.slug}
                                companyName={protocol.name}
                                githubOrg={socialLinks.githubOrg}
                                website={protocol.website || undefined}
                            />

                            <div className="text-center bg-muted rounded-lg p-6">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Overall Index Score
                                </p>
                                <p className={cn("text-5xl font-bold", scoreColor)}>
                                    {protocol.overallScore}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    out of 100
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
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
                                We are currently fetching and verifying data from GitHub, Twitter, npm downloads, and on-chain sources. Some metrics may be incomplete or show as zero until the initial data collection is complete.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Growth Metrics */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-5 w-5 text-cyan-600" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Growth Metrics
                            </h2>
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {protocol.growth.score}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Growth momentum score
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total Contributors
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(
                                        (protocolData.indexData as any)?.github?.totalContributors || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Active Contributors (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(protocol.teamHealth.activeContributors)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    GitHub Commits (30d)
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(protocol.teamHealth.githubCommits30d)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Contributor Retention
                                </span>
                                <span className="font-medium text-foreground">
                                    {protocol.teamHealth.contributorRetention}%
                                </span>
                            </div>
                            {protocol.growth.tvl && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total Value Locked
                                    </span>
                                    <span className="font-medium text-foreground">
                                        ${formatNumber(protocol.growth.tvl)}
                                    </span>
                                </div>
                            )}
                            {protocol.growth.npmDownloads30d && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        npm Downloads (30d)
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {formatNumber(protocol.growth.npmDownloads30d)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Score */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Twitter className="h-5 w-5 text-cyan-600" />
                                <h2 className="text-xl font-semibold text-foreground">
                                    Social Score
                                </h2>
                            </div>
                            {socialLinks.twitter && (
                                <a
                                    href={socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan-600 transition-colors"
                                >
                                    <Twitter className="h-4 w-4" />
                                    <span className="text-xs">Source</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground mb-1">
                                {scores?.socialScore || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Twitter activity score
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Twitter Followers
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatNumber(protocol.social.twitterFollowers || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* News */}
                <NewsSection news={protocol.news} />

                {/* Verification Info */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-cyan-900 mb-3">
                        About Index Verification
                    </h3>
                    <div className="text-sm text-cyan-800 space-y-2">
                        <p>
                            <strong>Automated Data Sources:</strong> All metrics are automatically verified through on-chain data (smart contracts, wallets, DAOs) and off-chain sources (GitHub, npm downloads, Twitter).
                        </p>
                        <p>
                            <strong>No Manual Input:</strong> Index scores are calculated algorithmically based on verified data, ensuring trustworthy and objective protocol assessments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
