import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

// Get the base URL for metadata
const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://kalshify.vercel.app";

export const metadata: Metadata = {
    title: {
        default: "Kalshify - Experience Kalshi Prediction Markets From Anywhere",
        template: "%s | Kalshify",
    },
    description:
        "The AI-powered paper trading platform for Kalshi prediction markets. Practice trading with real market data from anywhere in the world — no US residency required. Get AI recommendations and track your P&L risk-free.",
    keywords: [
        "Kalshi",
        "prediction markets",
        "paper trading",
        "AI trading",
        "Kalshify",
        "Claude AI",
        "global prediction markets",
        "learn trading",
        "practice trading",
        "event contracts",
        "trading simulator",
        "market predictions",
    ],
    authors: [{ name: "Kalshify" }],
    creator: "Kalshify",
    publisher: "Kalshify",
    metadataBase: new URL(baseUrl),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: "Kalshify",
        title: "Kalshify - Experience Kalshi Prediction Markets From Anywhere",
        description:
            "Paper trade on Kalshi prediction markets from anywhere in the world. AI-powered recommendations, real market data, zero risk. No US residency required.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Kalshify - Experience Kalshi From Anywhere",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Kalshify - Experience Kalshi From Anywhere",
        description:
            "Paper trade on Kalshi prediction markets worldwide. AI recommendations, real data, zero risk. No US residency required.",
        creator: "@kalshify",
        site: "@kalshify",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

// Structured data for SEO
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kalshify",
    url: baseUrl,
    description:
        "Experience Kalshi prediction markets from anywhere in the world. AI-powered paper trading platform with real market data — no US residency required.",
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/markets?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
    publisher: {
        "@type": "Organization",
        name: "Kalshify",
        url: baseUrl,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            </head>
            <body className={inter.className}>
                <Providers>{children}</Providers>
                <Toaster />
                <Analytics />
            </body>
        </html>
    );
}
