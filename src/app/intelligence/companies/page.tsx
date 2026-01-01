import { Search } from 'lucide-react';
import { companies } from '@/lib/intelligence/companies';
import { CompanyCard } from '@/components/intelligence/company-card';

export default function CompaniesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Directory</h1>
        <p className="text-muted-foreground mt-2">
          Browse all {companies.length} verified web3 companies with on-chain and off-chain intelligence
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
          <p className="text-3xl font-bold text-foreground">{companies.length}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">verified</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Avg Intelligence Score</p>
          <p className="text-3xl font-bold text-foreground">
            {Math.round(companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length)}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">out of 100</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Listed in Marketplace</p>
          <p className="text-3xl font-bold text-foreground">
            {companies.filter((c) => c.isListed).length}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">available for acquisition</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Growing Fast</p>
          <p className="text-3xl font-bold text-foreground">
            {companies.filter((c) => c.trend === 'up').length}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">upward trend</p>
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.slug} company={company} />
        ))}
      </div>
    </div>
  );
}
