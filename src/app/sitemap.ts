import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        "https://www.fabrknt.com";

    const now = new Date();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/cindex`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/cindex/companies`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/synergy`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/synergy/opportunities`,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 0.9,
        },
    ];

    // Dynamic routes - Companies
    let companyRoutes: MetadataRoute.Sitemap = [];
    try {
        const companies = await prisma.company.findMany({
            where: { isActive: true },
            select: {
                slug: true,
                updatedAt: true,
            },
            take: 1000, // Limit to avoid too large sitemap
        });

        companyRoutes = companies.map((company) => ({
            url: `${baseUrl}/cindex/${company.slug}`,
            lastModified: company.updatedAt || now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Error fetching companies for sitemap:", error);
    }

    // Dynamic routes - Listings
    let listingRoutes: MetadataRoute.Sitemap = [];
    try {
        const listings = await prisma.listing.findMany({
            where: { status: "active" },
            select: {
                id: true,
                updatedAt: true,
            },
            take: 500, // Limit to avoid too large sitemap
        });

        listingRoutes = listings.map((listing) => ({
            url: `${baseUrl}/synergy/opportunities/${listing.id}`,
            lastModified: listing.updatedAt || now,
            changeFrequency: "daily" as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error("Error fetching listings for sitemap:", error);
    }

    return [...staticRoutes, ...companyRoutes, ...listingRoutes];
}
