// Twitter/X Scraper via Nitter RSS
// Scrapes public tweets from tracked accounts for market-relevant intel

import { IntelSignalData, IntelSource, SignalSeverity, SourceCategory } from './types';

// Tracked Twitter accounts for market intel
export const INTEL_SOURCES: IntelSource[] = [
  { platform: 'TWITTER', handle: 'disclosetv', displayName: 'Disclose.tv', category: 'NEWS', isVerified: true },
  { platform: 'TWITTER', handle: 'unusual_whales', displayName: 'Unusual Whales', category: 'ANALYST', isVerified: true },
  { platform: 'TWITTER', handle: 'zaborbryan', displayName: 'Bryan Zabor', category: 'JOURNALIST', isVerified: false },
  { platform: 'TWITTER', handle: 'dikitoone', displayName: 'Dikitoone', category: 'NEWS', isVerified: false },
  { platform: 'TWITTER', handle: 'Politico', displayName: 'Politico', category: 'NEWS', isVerified: true },
  { platform: 'TWITTER', handle: 'Reuters', displayName: 'Reuters', category: 'NEWS', isVerified: true },
  { platform: 'TWITTER', handle: 'AP', displayName: 'Associated Press', category: 'NEWS', isVerified: true },
  { platform: 'TWITTER', handle: 'business', displayName: 'Bloomberg', category: 'NEWS', isVerified: true },
];

// Keywords that could indicate market-moving news
const MARKET_KEYWORDS = {
  politics: ['trump', 'biden', 'election', 'congress', 'senate', 'supreme court', 'president', 'governor', 'vote', 'poll'],
  economics: ['fed', 'federal reserve', 'interest rate', 'inflation', 'gdp', 'jobs report', 'unemployment', 'recession'],
  crypto: ['bitcoin', 'ethereum', 'crypto', 'sec', 'etf'],
  tech: ['ai', 'artificial intelligence', 'openai', 'google', 'apple', 'microsoft', 'meta'],
  weather: ['hurricane', 'tornado', 'earthquake', 'flood', 'wildfire', 'climate'],
  sports: ['nfl', 'nba', 'mlb', 'super bowl', 'championship', 'playoffs'],
};

// Common Kalshi market tickers/keywords mapping
const TICKER_KEYWORDS: Record<string, string[]> = {
  'PRES': ['president', 'presidential', 'white house'],
  'FED': ['federal reserve', 'interest rate', 'fomc', 'powell'],
  'SCOTUS': ['supreme court', 'scotus'],
  'BTC': ['bitcoin', 'btc'],
  'ETH': ['ethereum', 'eth'],
};

interface ParsedTweet {
  handle: string;
  displayName: string;
  text: string;
  timestamp: Date;
  url: string;
  category: SourceCategory;
  isVerified: boolean;
}

interface NitterItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

// Available Nitter instances (some may be down, we try multiple)
const NITTER_INSTANCES = [
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.cz',
];

async function fetchNitterRss(handle: string): Promise<NitterItem[]> {
  const items: NitterItem[] = [];

  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${handle}/rss`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Kalshify/1.0)',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) continue;

      const xml = await response.text();

      // Simple XML parsing for RSS items
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/;
      const linkRegex = /<link>([\s\S]*?)<\/link>/;
      const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
      const descRegex = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/;

      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const title = titleRegex.exec(itemXml)?.[1] || '';
        const link = linkRegex.exec(itemXml)?.[1] || '';
        const pubDate = pubDateRegex.exec(itemXml)?.[1] || '';
        const description = descRegex.exec(itemXml)?.[1] || title;

        items.push({
          title: title.replace(/<[^>]*>/g, '').trim(),
          link,
          pubDate,
          description: description.replace(/<[^>]*>/g, '').trim(),
        });
      }

      // If we got items, break out of the loop
      if (items.length > 0) break;
    } catch {
      // Try next instance
      continue;
    }
  }

  return items;
}

function determineSeverity(text: string): SignalSeverity {
  const lowerText = text.toLowerCase();

  // Critical: Breaking news indicators
  if (
    lowerText.includes('breaking') ||
    lowerText.includes('just in') ||
    lowerText.includes('urgent') ||
    lowerText.includes('confirmed')
  ) {
    return 'CRITICAL';
  }

  // High: Direct market impact terms
  if (
    lowerText.includes('announced') ||
    lowerText.includes('decision') ||
    lowerText.includes('official') ||
    lowerText.includes('sources say')
  ) {
    return 'HIGH';
  }

  // Medium: News/report terms
  if (
    lowerText.includes('report') ||
    lowerText.includes('says') ||
    lowerText.includes('according to')
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function findMatchingTickers(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matches: string[] = [];

  for (const [ticker, keywords] of Object.entries(TICKER_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      matches.push(ticker);
    }
  }

  return matches;
}

function findMatchingCategories(text: string): string[] {
  const lowerText = text.toLowerCase();
  const categories: string[] = [];

  for (const [category, keywords] of Object.entries(MARKET_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories;
}

export async function scrapeTweets(
  sources: IntelSource[] = INTEL_SOURCES,
  maxAgeMinutes: number = 60
): Promise<ParsedTweet[]> {
  const allTweets: ParsedTweet[] = [];
  const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  for (const source of sources) {
    try {
      const items = await fetchNitterRss(source.handle);

      for (const item of items) {
        const tweetDate = new Date(item.pubDate);

        // Skip old tweets
        if (tweetDate < cutoffTime) continue;

        allTweets.push({
          handle: source.handle,
          displayName: source.displayName,
          text: item.description || item.title,
          timestamp: tweetDate,
          url: item.link,
          category: source.category,
          isVerified: source.isVerified || false,
        });
      }
    } catch {
      // Skip failed sources
      continue;
    }
  }

  // Sort by most recent first
  allTweets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return allTweets;
}

export function filterMarketRelevantTweets(tweets: ParsedTweet[]): ParsedTweet[] {
  return tweets.filter((tweet) => {
    const categories = findMatchingCategories(tweet.text);
    return categories.length > 0;
  });
}

export function convertTweetsToSignals(tweets: ParsedTweet[]): IntelSignalData[] {
  return tweets.map((tweet) => {
    const severity = determineSeverity(tweet.text);
    const matchingTickers = findMatchingTickers(tweet.text);
    const categories = findMatchingCategories(tweet.text);

    // Truncate text for title
    const maxTitleLength = 100;
    const truncatedText =
      tweet.text.length > maxTitleLength
        ? tweet.text.substring(0, maxTitleLength) + '...'
        : tweet.text;

    return {
      type: 'SOCIAL_INTEL',
      severity,
      ticker: matchingTickers[0] || undefined,
      marketTitle: undefined,
      title: 'SOCIAL INTEL',
      description: `@${tweet.handle}${tweet.isVerified ? ' ✓' : ''}: "${truncatedText}"`,
      data: {
        handle: tweet.handle,
        displayName: tweet.displayName,
        fullText: tweet.text,
        timestamp: tweet.timestamp.toISOString(),
        matchingTickers,
        categories,
        isVerified: tweet.isVerified,
      },
      sourceType: 'TWITTER',
      sourceHandle: tweet.handle,
      sourceUrl: tweet.url,
    };
  });
}

export async function scanSocialIntel(
  maxAgeMinutes: number = 60
): Promise<IntelSignalData[]> {
  const tweets = await scrapeTweets(INTEL_SOURCES, maxAgeMinutes);
  const relevantTweets = filterMarketRelevantTweets(tweets);
  const signals = convertTweetsToSignals(relevantTweets);

  return signals;
}
