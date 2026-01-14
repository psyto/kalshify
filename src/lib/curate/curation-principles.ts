/**
 * Core curation principles that curators use to make allocation decisions.
 * These mental models help users understand the "why" behind strategy choices.
 */

export interface CurationPrinciple {
    id: string;
    name: string;
    shortName: string;          // For badges/tags
    description: string;        // One-line explanation
    deepExplanation: string;    // Full educational content
    example: string;            // Concrete example of application
    icon: "scale" | "grid" | "clock" | "shield" | "droplet" | "link";
    color: string;              // Tailwind color class
}

export const CURATION_PRINCIPLES: CurationPrinciple[] = [
    {
        id: "risk-reward",
        name: "Risk/Reward Balance",
        shortName: "Risk/Reward",
        description: "Higher yield always comes with higher risk - there's no free lunch in DeFi.",
        deepExplanation:
            "Every yield opportunity has an underlying risk. When you see 50% APY, ask yourself: " +
            "where is this yield coming from? Is it sustainable? Smart curators balance their portfolios " +
            "between stable, lower-yield positions and higher-risk opportunities. The goal isn't to " +
            "maximize yield, but to optimize risk-adjusted returns.",
        example: "A curator allocates 40% to stable USDC lending (6% APY) and only 15% to a high-yield " +
            "volatile pair (25% APY). The stable portion protects capital while the smaller high-yield " +
            "allocation provides upside.",
        icon: "scale",
        color: "cyan",
    },
    {
        id: "diversification",
        name: "Diversification",
        shortName: "Diversify",
        description: "Don't concentrate in one protocol or asset - spread risk across multiple positions.",
        deepExplanation:
            "Diversification is your primary defense against catastrophic loss. If one protocol gets " +
            "hacked or an asset depeg, a diversified portfolio limits your exposure. But diversification " +
            "isn't just about quantity - it's about correlation. Holding 5 different stablecoin positions " +
            "on the same protocol isn't true diversification.",
        example: "Instead of putting 100% in one high-APY pool, a curator spreads across 4-5 pools on " +
            "different protocols (Kamino, Marginfi, Drift) and different asset types (stables, SOL, " +
            "liquid staking tokens).",
        icon: "grid",
        color: "purple",
    },
    {
        id: "yield-sustainability",
        name: "Yield Sustainability",
        shortName: "Sustainable",
        description: "Distinguish between real yield from fees and temporary yield from token emissions.",
        deepExplanation:
            "There are two types of yield: organic yield from trading fees and borrowing demand, and " +
            "incentive yield from token emissions. Organic yield is sustainable because it comes from " +
            "real economic activity. Emission-based yield will decrease over time as incentive programs " +
            "end. Smart curators prefer sustainable yield and factor in emission schedules when " +
            "evaluating opportunities.",
        example: "A pool shows 20% APY, but 15% comes from reward tokens. A curator recognizes that " +
            "when rewards end, yield drops to 5%. They size their position accordingly and plan to " +
            "rotate out before emissions decline.",
        icon: "clock",
        color: "green",
    },
    {
        id: "protocol-trust",
        name: "Protocol Trust",
        shortName: "Trust",
        description: "Evaluate protocol security through TVL, audit history, team track record, and time in market.",
        deepExplanation:
            "Not all protocols are created equal. Before depositing funds, curators assess: How long " +
            "has the protocol been live? What's the TVL and how has it grown? Are there multiple audits " +
            "from reputable firms? Is the code open source? What's the team's reputation? Higher TVL " +
            "and longer track record generally indicate lower smart contract risk, though this isn't " +
            "a guarantee.",
        example: "A curator sees similar APY on two protocols. Protocol A has $500M TVL, 18 months " +
            "live, and 3 audits. Protocol B has $20M TVL, 2 months live, no audits. The curator " +
            "allocates more to Protocol A despite identical yields.",
        icon: "shield",
        color: "yellow",
    },
    {
        id: "liquidity-depth",
        name: "Liquidity Depth",
        shortName: "Liquidity",
        description: "Ensure you can exit positions without significant slippage when needed.",
        deepExplanation:
            "High APY means nothing if you can't exit your position. Liquidity depth determines how " +
            "much you can withdraw without moving the price against you. In a market crash, liquidity " +
            "often disappears right when you need it most. Curators check utilization rates, pool " +
            "depth, and withdrawal mechanisms before sizing positions.",
        example: "A curator limits their position to 2% of a pool's TVL. If the pool has $10M TVL, " +
            "they cap their deposit at $200K. This ensures they can exit quickly without major " +
            "slippage even during market stress.",
        icon: "droplet",
        color: "blue",
    },
    {
        id: "correlation",
        name: "Correlation Awareness",
        shortName: "Correlation",
        description: "Understand how positions move together - correlated assets multiply risk, not reduce it.",
        deepExplanation:
            "True diversification requires understanding correlation. If all your positions drop " +
            "together in a market crash, you haven't actually reduced risk. Stablecoins provide " +
            "low correlation to volatile assets. SOL and mSOL are highly correlated - a 'diversified' " +
            "portfolio of SOL pools isn't really diversified. Smart curators mix uncorrelated assets " +
            "to smooth returns across market conditions.",
        example: "A curator holds 40% in stablecoins (uncorrelated to market moves), 35% in SOL-based " +
            "positions (market exposure), and 25% in liquid staking (partially correlated). This mix " +
            "reduces portfolio volatility compared to 100% SOL exposure.",
        icon: "link",
        color: "orange",
    },
];

/**
 * Get a principle by its ID
 */
export function getPrinciple(id: string): CurationPrinciple | undefined {
    return CURATION_PRINCIPLES.find(p => p.id === id);
}

/**
 * Get multiple principles by their IDs
 */
export function getPrinciples(ids: string[]): CurationPrinciple[] {
    return ids
        .map(id => getPrinciple(id))
        .filter((p): p is CurationPrinciple => p !== undefined);
}

/**
 * Map principle IDs to allocations for easy lookup
 */
export const ALLOCATION_PRINCIPLES: Record<string, string[]> = {
    // Gauntlet allocations
    "gauntlet-usdc-lending": ["risk-reward", "yield-sustainability"],
    "gauntlet-sol-staking": ["protocol-trust", "liquidity-depth"],
    "gauntlet-msol-sol": ["correlation", "yield-sustainability"],
    "gauntlet-jitosol": ["protocol-trust", "yield-sustainability"],
    "gauntlet-usdc-sol": ["diversification", "risk-reward"],
    "gauntlet-bonk-sol": ["risk-reward", "liquidity-depth"],
    "gauntlet-jup-usdc": ["diversification", "risk-reward"],
    "gauntlet-ray-usdc": ["risk-reward", "liquidity-depth"],

    // Steakhouse allocations
    "steakhouse-usdc-prime": ["yield-sustainability", "protocol-trust"],
    "steakhouse-usdt-prime": ["diversification", "protocol-trust"],
    "steakhouse-weth-prime": ["correlation", "risk-reward"],

    // RE7 allocations
    "re7-sol-perp": ["risk-reward", "liquidity-depth"],
    "re7-jto-vault": ["yield-sustainability", "protocol-trust"],
    "re7-msol-lending": ["correlation", "yield-sustainability"],
    "re7-bonk-perp": ["risk-reward", "liquidity-depth"],
};

/**
 * Get principles for a specific allocation
 */
export function getAllocationPrinciples(allocationId: string): CurationPrinciple[] {
    const principleIds = ALLOCATION_PRINCIPLES[allocationId] || [];
    return getPrinciples(principleIds);
}
