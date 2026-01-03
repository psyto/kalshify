import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMService {
    private model;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. LLM features will be disabled.");
        } else {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        }
    }

    async summarizePartnerships(title: string, url: string): Promise<string> {
        if (!this.model) return "LLM Summary Unavailable";

        try {
            const prompt = `
            Analyze this news headline and URL for Web3 partnership or integration details.
            
            Headline: "${title}"
            URL: "${url}"
            
            If this news indicates a partnership, integration, or collaboration, provide a 1-sentence summary.
            If it's a generic update or not relevant to partnerships, return "Not a partnership".
            `;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error("LLM Summarization failed:", error);
            return "Summary failed";
        }
    }

    async analyzeFundingPotential(companyName: string, roundType: string): Promise<boolean> {
        // Simple heuristic for now, but could use LLM for more complex sentiment analysis
        // on news snippets if we had full article text.
        return roundType.toLowerCase().includes("seed") || roundType.toLowerCase().includes("pre-seed");
    }

    /**
     * Analyze partnership quality with AI context understanding
     * Returns structured partnership analysis with quality tier and confidence
     */
    async analyzePartnershipQuality(newsItem: {
        title: string;
        content?: string;
        url?: string;
    }): Promise<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType:
            | "integration"
            | "collaboration"
            | "investment"
            | "grant"
            | "other";
        confidence: number;
        reasoning: string;
    }> {
        if (!this.model) {
            // Fallback to basic regex detection if LLM unavailable
            const title = newsItem.title.toLowerCase();
            const hasKeyword =
                /\b(partner|integration|collaboration)\b/i.test(title);
            return {
                isPartnership: hasKeyword,
                quality: hasKeyword ? "tier3" : "none",
                partnerNames: [],
                relationshipType: "other",
                confidence: hasKeyword ? 50 : 0,
                reasoning: "LLM unavailable, using basic keyword detection",
            };
        }

        try {
            const prompt = `
Analyze this announcement for partnership/integration signals in the Web3 space.

Title: "${newsItem.title}"
${newsItem.content ? `Content: "${newsItem.content.slice(0, 500)}..."` : ""}
${newsItem.url ? `URL: ${newsItem.url}` : ""}

Determine:
1. Is this a REAL partnership/integration? (not just mentioning another company)
   - Real: "Partners with Coinbase", "Integrating Uniswap", "Collaborating with Alchemy"
   - Not real: "Building on Ethereum", "Users can use USDC", "Similar to Uniswap"

2. Quality tier (based on partner prominence):
   - tier1: Major companies (Coinbase, Binance, Circle, Alchemy, a16z, Paradigm, etc.)
   - tier2: Established protocols (Uniswap, Aave, Chainlink, TheGraph, etc.)
   - tier3: Smaller partners or tool integrations
   - none: Not a partnership

3. Partner names: Extract actual partner company names

4. Relationship type:
   - integration: Technical integration (API, SDK, protocol)
   - collaboration: Joint initiative or co-marketing
   - investment: Funding or grant received
   - grant: Grant program announcement
   - other: Other type of partnership

5. Confidence (0-100): How confident are you this is a real partnership?

Return ONLY valid JSON (no markdown, no explanations):
{
  "isPartnership": true/false,
  "quality": "tier1" | "tier2" | "tier3" | "none",
  "partnerNames": ["Company1", "Company2"],
  "relationshipType": "integration" | "collaboration" | "investment" | "grant" | "other",
  "confidence": 0-100,
  "reasoning": "Brief 1-sentence explanation"
}`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Clean response (remove markdown code blocks if present)
            const cleanedResponse = response
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            const analysis = JSON.parse(cleanedResponse);

            // Validate structure
            if (
                typeof analysis.isPartnership !== "boolean" ||
                !["tier1", "tier2", "tier3", "none"].includes(
                    analysis.quality
                ) ||
                !Array.isArray(analysis.partnerNames) ||
                typeof analysis.confidence !== "number"
            ) {
                throw new Error("Invalid response structure from LLM");
            }

            return analysis;
        } catch (error) {
            console.error("Partnership analysis failed:", error);
            // Fallback to basic detection
            const title = newsItem.title.toLowerCase();
            const content = (newsItem.content || "").toLowerCase();
            const combined = `${title} ${content}`;

            const hasKeyword =
                /\b(partnership|integration|collaborat|partner with)\b/i.test(
                    combined
                );

            return {
                isPartnership: hasKeyword,
                quality: hasKeyword ? "tier3" : "none",
                partnerNames: [],
                relationshipType: "other",
                confidence: hasKeyword ? 40 : 0,
                reasoning: "Fallback to keyword detection due to LLM error",
            };
        }
    }

    /**
     * Batch analyze multiple news items for partnerships
     * More efficient than individual calls
     */
    async batchAnalyzePartnerships(
        newsItems: Array<{ title: string; content?: string; url?: string }>
    ): Promise<
        Array<{
            isPartnership: boolean;
            quality: "tier1" | "tier2" | "tier3" | "none";
            partnerNames: string[];
            relationshipType: string;
            confidence: number;
            reasoning: string;
        }>
    > {
        if (!this.model || newsItems.length === 0) {
            return newsItems.map(() => ({
                isPartnership: false,
                quality: "none" as const,
                partnerNames: [],
                relationshipType: "other",
                confidence: 0,
                reasoning: "LLM unavailable or no items",
            }));
        }

        try {
            const prompt = `
Analyze these ${newsItems.length} news announcements for partnership signals.

${newsItems
    .map(
        (item, i) => `
News ${i + 1}:
Title: "${item.title}"
${item.content ? `Content: "${item.content.slice(0, 300)}..."` : ""}
`
    )
    .join("\n")}

For each news item, determine if it's a real partnership and rate quality.

Quality tiers:
- tier1: Major companies (Coinbase, Binance, Circle, Alchemy, a16z, etc.)
- tier2: Established protocols (Uniswap, Aave, Chainlink, etc.)
- tier3: Smaller partners
- none: Not a partnership

Return ONLY a JSON array (no markdown):
[
  {
    "isPartnership": true/false,
    "quality": "tier1" | "tier2" | "tier3" | "none",
    "partnerNames": ["Company"],
    "relationshipType": "integration" | "collaboration" | "investment" | "grant" | "other",
    "confidence": 0-100,
    "reasoning": "Brief explanation"
  },
  ...
]`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const cleanedResponse = response
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            const analyses = JSON.parse(cleanedResponse);

            if (!Array.isArray(analyses) || analyses.length !== newsItems.length) {
                throw new Error("Invalid batch response from LLM");
            }

            return analyses;
        } catch (error) {
            console.error("Batch partnership analysis failed:", error);
            // Fallback to individual analysis
            return Promise.all(
                newsItems.map((item) => this.analyzePartnershipQuality(item))
            );
        }
    }
}
