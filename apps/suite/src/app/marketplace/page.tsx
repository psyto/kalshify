import Link from 'next/link';
import { Building2, DollarSign, TrendingUp, Clock, Eye, Award, ArrowRight } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getMockListings, calculateMarketplaceStats } from '@/lib/mock-data';
import {
  getFeaturedListings,
  getRecentlyListed,
  getBestValue,
  getHighInterest,
} from '@/lib/marketplace/helpers';
import { MarketplaceSpotlightSection } from '@/components/marketplace/marketplace-spotlight';

export default function MarketplacePage() {
  const stats = calculateMarketplaceStats();
  const listings = getMockListings();

  // Spotlight sections
  const featured = getFeaturedListings(listings, 5);
  const recentlyListed = getRecentlyListed(listings, 5);
  const bestValue = getBestValue(listings, 5);
  const highInterest = getHighInterest(listings, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Verified Web3 Marketplace</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Acquire web3 companies with verified on-chain and off-chain intelligence
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Listings"
          value={stats.totalListings}
          icon={Building2}
          trend="up"
          change={12}
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon={TrendingUp}
          trend="up"
          change={8}
        />
        <StatsCard
          title="Total Value"
          value={`$${(stats.totalValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="up"
          change={15}
        />
        <StatsCard
          title="Avg Intelligence Score"
          value={stats.avgFabrkntScore}
          icon={Award}
          trend="up"
          change={3}
        />
      </div>

      {/* Spotlight Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Listings */}
        <MarketplaceSpotlightSection
          title="Featured Listings"
          description="Highest verified intelligence scores"
          icon={Award}
          listings={featured}
          iconColor="text-yellow-600"
        />

        {/* Recently Listed */}
        <MarketplaceSpotlightSection
          title="Recently Listed"
          description="Latest acquisition opportunities"
          icon={Clock}
          listings={recentlyListed}
          iconColor="text-blue-600"
        />

        {/* High Interest */}
        <MarketplaceSpotlightSection
          title="High Interest"
          description="Most active user bases"
          icon={Eye}
          listings={highInterest}
          iconColor="text-purple-600"
        />

        {/* Best Value */}
        <MarketplaceSpotlightSection
          title="Best Value"
          description="Lowest revenue multiples"
          icon={TrendingUp}
          listings={bestValue}
          iconColor="text-green-600"
        />
      </div>

      {/* Marketplace Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Revenue Breakdown */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Marketplace Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-bold text-foreground">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M ARR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total MAU</span>
              <span className="font-bold text-foreground">
                {(stats.totalMAU / 1000).toFixed(0)}K Users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified Listings</span>
              <span className="font-bold text-cyan-600">
                {listings.filter((l) => l.suiteData?.revenue_verified).length}/{stats.totalListings}
              </span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Category Distribution</h3>
          <div className="space-y-4">
            {['defi', 'gaming', 'dao', 'nft', 'infrastructure'].map((category) => {
              const count = listings.filter((l) => l.category === category).length;
              const percentage = (count / stats.totalListings) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{category}</span>
                    <span className="font-medium text-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                        boxShadow: '0 2px 8px 0 rgba(6, 182, 212, 0.4)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-cyan-900 mb-4">Verified Intelligence</h3>
        <p className="text-cyan-800 max-w-2xl mx-auto mb-6">
          Every listing includes verified on-chain and off-chain intelligence metrics. See team health,
          growth momentum, and verified revenue before you buy.
        </p>
        <Link
          href="/marketplace/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-medium"
        >
          Explore All Listings
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
