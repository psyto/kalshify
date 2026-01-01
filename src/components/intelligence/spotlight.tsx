import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Company } from '@/lib/intelligence/companies';
import { cn } from '@/lib/utils';

interface SpotlightSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  companies: Company[];
  iconColor?: string;
}

const categoryColors = {
  defi: 'bg-purple-100 text-purple-700',
  infrastructure: 'bg-blue-100 text-blue-700',
  nft: 'bg-pink-100 text-pink-700',
  dao: 'bg-green-100 text-green-700',
  gaming: 'bg-orange-100 text-orange-700',
};

export function SpotlightSection({ title, description, icon: Icon, companies, iconColor = 'text-purple-600' }: SpotlightSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-lg bg-purple-50', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {companies.map((company, index) => (
          <Link
            key={company.slug}
            href={`/intelligence/${company.slug}`}
            className="block p-3 rounded-lg border border-border hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-lg font-bold text-muted-foreground/40 w-6">#{index + 1}</div>
                <div className="text-2xl">{company.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{company.name}</h4>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', categoryColors[company.category])}>
                      {company.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{company.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-xl font-bold text-green-600">{company.overallScore}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/intelligence/companies"
          className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View All Companies
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

interface CategoryLeaderCardProps {
  category: string;
  company: Company;
}

export function CategoryLeaderCard({ category, company }: CategoryLeaderCardProps) {
  return (
    <Link
      href={`/intelligence/${company.slug}`}
      className="block bg-card rounded-lg border border-border p-4 hover:border-purple-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', categoryColors[company.category])}>
          {category}
        </span>
        <div className="text-2xl">{company.logo}</div>
      </div>
      <h4 className="font-semibold text-foreground mb-1">{company.name}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{company.description}</p>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Overall</p>
          <p className="text-lg font-bold text-green-600">{company.overallScore}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Team</p>
          <p className="text-lg font-bold text-foreground">{company.teamHealth.score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Growth</p>
          <p className="text-lg font-bold text-foreground">{company.growth.score}</p>
        </div>
      </div>
    </Link>
  );
}
