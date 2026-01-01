import Link from 'next/link';
import { ArrowRight, Trophy, TrendingUp, Github, Star } from 'lucide-react';
import {
  companies,
  getTopCompanies,
  getFastestGrowing,
  getMostActiveTeams,
  getRisingStars,
  getCategoryLeaders,
} from '@/lib/intelligence/companies';
import { SpotlightSection, CategoryLeaderCard } from '@/components/intelligence/spotlight';

export default function IntelligencePage() {
  const topCompanies = getTopCompanies(5);
  const fastestGrowing = getFastestGrowing(5);
  const mostActiveTeams = getMostActiveTeams(5);
  const risingStars = getRisingStars(5);
  const categoryLeaders = getCategoryLeaders();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Preview
          </span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Web3 Company Intelligence</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Automated intelligence for {companies.length} web3 companies with verified on-chain and off-chain data
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Companies Tracked</p>
          <p className="text-4xl font-bold text-foreground">{companies.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Avg Intelligence Score</p>
          <p className="text-4xl font-bold text-foreground">
            {Math.round(companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Growing Fast</p>
          <p className="text-4xl font-bold text-green-600">
            {companies.filter((c) => c.trend === 'up').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Listed for Sale</p>
          <p className="text-4xl font-bold text-purple-600">
            {companies.filter((c) => c.isListed).length}
          </p>
        </div>
      </div>

      {/* Spotlight Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Overall */}
        <SpotlightSection
          title="Top Performers"
          description="Highest overall intelligence scores"
          icon={Trophy}
          companies={topCompanies}
          iconColor="text-yellow-600"
        />

        {/* Fastest Growing */}
        <SpotlightSection
          title="Fastest Growing"
          description="Highest user growth rate (30 days)"
          icon={TrendingUp}
          companies={fastestGrowing}
          iconColor="text-green-600"
        />

        {/* Most Active Teams */}
        <SpotlightSection
          title="Most Active Teams"
          description="Highest GitHub commit velocity"
          icon={Github}
          companies={mostActiveTeams}
          iconColor="text-blue-600"
        />

        {/* Rising Stars */}
        <SpotlightSection
          title="Rising Stars"
          description="Biggest growth momentum"
          icon={Star}
          companies={risingStars}
          iconColor="text-purple-600"
        />
      </div>

      {/* Category Leaders */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Category Leaders</h2>
          <p className="text-sm text-muted-foreground mt-1">Top companies in each category</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <CategoryLeaderCard category="DeFi" company={categoryLeaders.defi} />
          <CategoryLeaderCard category="Infrastructure" company={categoryLeaders.infrastructure} />
          <CategoryLeaderCard category="NFT" company={categoryLeaders.nft} />
          <CategoryLeaderCard category="DAO" company={categoryLeaders.dao} />
          <CategoryLeaderCard category="Gaming" company={categoryLeaders.gaming} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-purple-900 mb-4">Fully Automated Intelligence</h3>
        <p className="text-purple-800 max-w-2xl mx-auto mb-6">
          All company metrics are automatically verified through on-chain data (contracts, wallets, DAOs) and
          off-chain sources (GitHub, Discord, Twitter). No manual data entry means trustworthy, objective intelligence.
        </p>
        <Link
          href="/intelligence/companies"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
        >
          Explore All Companies
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
