import { SynergyLayoutClient } from "@/components/synergy/synergy-layout-client";

export const metadata = {
    title: "Synergy - Opportunity Discovery | FABRKNT",
    description: "AI-powered partnership discovery for DeFi protocols. Find integration partners, acquisition targets, and strategic opportunities using verified data.",
};

export default function SynergyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SynergyLayoutClient>{children}</SynergyLayoutClient>;
}
