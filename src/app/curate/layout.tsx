import { CurateLayoutClient } from "@/components/curate/curate-layout-client";

export const metadata = {
    title: "Curate - Risk Scoring & Yield Analysis | FABRKNT",
    description: "DeFi Intelligence Platform - Risk scoring, APY stability analysis, and liquidity risk assessment. Building the foundation for AI-powered curation.",
};

export default function CurateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CurateLayoutClient>{children}</CurateLayoutClient>;
}
