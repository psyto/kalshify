import { CurateLayoutClient } from "@/components/curate/curate-layout-client";

export const metadata = {
    title: "Curate | FABRKNT",
    description: "DeFi Yield Intelligence - Risk scoring, APY stability analysis, and liquidity risk assessment",
};

export default function CurateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CurateLayoutClient>{children}</CurateLayoutClient>;
}
