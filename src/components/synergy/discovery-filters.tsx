"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterState {
  search: string;
  category: string;
  opportunityType: string;
  minScore: number;
  sortBy: string;
}

interface DiscoveryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT" },
  { value: "gaming", label: "Gaming" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "dao", label: "DAO" },
];

const partnershipTypes = [
  { value: "all", label: "All Types" },
  { value: "integration", label: "Integration" },
  { value: "co-marketing", label: "Co-Marketing" },
  { value: "merger", label: "Acquisition" },
  { value: "revenue_share", label: "Revenue Share" },
  { value: "investment", label: "Investment" },
];

const sortOptions = [
  { value: "score", label: "Match Score" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "tvl", label: "TVL (High to Low)" },
  { value: "users", label: "Users (High to Low)" },
];

const scoreRanges = [
  { value: "0", label: "All Scores" },
  { value: "70", label: "70+ (Good)" },
  { value: "85", label: "85+ (Excellent)" },
  { value: "95", label: "95+ (Perfect)" },
];

export function DiscoveryFilters({ filters, onFiltersChange, onReset }: DiscoveryFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.opportunityType !== "all" ||
    filters.minScore > 0 ||
    filters.sortBy !== "score";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search companies..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-10"
        />
      </div>

      {/* Horizontal Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Category
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opportunity Type Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Opportunity Type
          </label>
          <Select
            value={filters.opportunityType}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, opportunityType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {partnershipTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score Range Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Match Score
          </label>
          <Select
            value={filters.minScore.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, minScore: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scoreRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Sort By
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, sortBy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onReset}
          className="w-auto"
          size="sm"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
