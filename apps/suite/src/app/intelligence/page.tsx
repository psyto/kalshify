import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { companies, getTopCompanies } from '@/lib/intelligence/companies';

export default function IntelligencePage() {
  const topCompanies = getTopCompanies(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
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

      {/* Top Companies Preview */}
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Top Performers</h2>
            <p className="text-sm text-muted-foreground mt-1">Companies with highest intelligence scores</p>
          </div>
          <Link
            href="/intelligence/companies"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            View All Companies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {topCompanies.map((company, index) => (
            <Link
              key={company.slug}
              href={`/intelligence/${company.slug}`}
              className="block p-4 rounded-lg border border-border hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground/50 w-8">#{index + 1}</div>
                  <div className="text-3xl">{company.logo}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-green-600">{company.overallScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Team Health</p>
                    <p className="text-2xl font-bold text-foreground">{company.teamHealth.score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Growth</p>
                    <p className="text-2xl font-bold text-foreground">{company.growth.score}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
