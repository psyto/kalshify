# Data Sources Overview

This document explains where Intelligence and Match features get their data from.

## 🎯 Summary

| Feature                                            | Data Source                | Status                                           |
| -------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| **Intelligence API** (`/api/intelligence/*`)       | **Supabase (Database)** ✅ | Uses Prisma to query `Company` table             |
| **Intelligence Pages** (`/intelligence/[company]`) | **JSON Files** ⚠️          | Falls back to JSON files, not using Supabase yet |
| **Match API** (`/api/listings/*`)                  | **Supabase (Database)** ✅ | Uses Prisma to query `Listing` table             |
| **Match Pages** (`/match/*`)                       | **Mock Data** ⚠️           | Still using `getMockListings()` instead of API   |

---

## 📊 Intelligence Feature

### API Routes (✅ Using Supabase)

#### `/api/intelligence/search`

-   **Source**: Supabase `Company` table via Prisma
-   **File**: `src/app/api/intelligence/search/route.ts`
-   **Query**: Searches companies by name, slug, or description
-   **Returns**: Company data from database

#### `/api/intelligence/[companyId]`

-   **Source**: Supabase `Company` table via Prisma
-   **File**: `src/app/api/intelligence/[companyId]/route.ts`
-   **Query**: Fetches company by ID with full intelligence data
-   **Returns**: Company with PULSE + TRACE scores from `intelligenceData` JSONB field

### Pages (⚠️ Using JSON Files - Needs Update)

#### `/intelligence/[company]`

-   **Source**: JSON files from `data/companies/*.json`
-   **File**: `src/app/intelligence/[company]/page.tsx`
-   **Functions Used**:
    -   `getCompanyBySlug()` → `loadCompanyFromJson()` → reads from `data/companies/{slug}.json`
    -   `loadCompanyScores()` → reads scores from JSON files
-   **Status**: ⚠️ **Not using Supabase yet** - should be updated to fetch from API

### Data Flow

```
Intelligence API (✅ Supabase)
├── /api/intelligence/search → prisma.company.findMany()
└── /api/intelligence/[companyId] → prisma.company.findUnique()

Intelligence Pages (⚠️ JSON Files)
└── /intelligence/[company] → getCompanyBySlug() → loadCompanyFromJson()
```

---

## 🎯 Match Feature

### API Routes (✅ Using Supabase)

#### `/api/listings`

-   **Source**: Supabase `Listing` table via Prisma
-   **File**: `src/app/api/listings/route.ts`
-   **Query**: Fetches listings with filters (type, category, status)
-   **Returns**: Listings with seller info and counts

#### `/api/listings/[id]`

-   **Source**: Supabase `Listing` table via Prisma
-   **File**: `src/app/api/listings/[id]/route.ts`
-   **Query**: Fetches single listing with offers, data room requests, documents
-   **Returns**: Full listing details

### Pages (⚠️ Using Mock Data - Needs Update)

#### `/match` (Homepage)

-   **Source**: Mock data from `getMockListings()`
-   **File**: `src/app/match/page.tsx`
-   **Function**: `getMockListings()` → `generateMockListings()` → hardcoded mock data
-   **Status**: ⚠️ **Not using API** - should fetch from `/api/listings`

#### `/match/opportunities` (Marketplace)

-   **Source**: Mock data from `getMockListings()`
-   **File**: `src/app/match/opportunities/page.tsx`
-   **Function**: `getMockListings()` → `generateMockListings()` → hardcoded mock data
-   **Status**: ⚠️ **Not using API** - should fetch from `/api/listings`

### Data Flow

```
Match API (✅ Supabase)
├── /api/listings → prisma.listing.findMany()
└── /api/listings/[id] → prisma.listing.findUnique()

Match Pages (⚠️ Mock Data)
├── /match → getMockListings() → generateMockListings()
└── /match/opportunities → getMockListings() → generateMockListings()
```

---

## 🔄 Migration Status

### ✅ Completed

-   [x] Intelligence API routes use Supabase
-   [x] Match API routes use Supabase
-   [x] Company table seeded with 23 companies from JSON files
-   [x] Database schema matches requirements

### ⚠️ Needs Update

#### Intelligence Pages

-   [ ] Update `/intelligence/[company]` to fetch from `/api/intelligence/[companyId]` instead of JSON files
-   [ ] Update Intelligence search/list pages to use API instead of JSON files

#### Match Pages

-   [ ] Update `/match` to fetch from `/api/listings` instead of `getMockListings()`
-   [ ] Update `/match/opportunities` to fetch from `/api/listings` instead of `getMockListings()`
-   [ ] Add loading states and error handling for API calls

---

## 📁 File Locations

### Intelligence

-   **API Routes**: `src/app/api/intelligence/`
-   **Pages**: `src/app/intelligence/`
-   **Data Loader**: `src/lib/intelligence/data-loader.ts`
-   **Company Utils**: `src/lib/intelligence/companies.ts`
-   **JSON Data**: `data/companies/*.json`

### Match

-   **API Routes**: `src/app/api/listings/`
-   **Pages**: `src/app/match/`
-   **Mock Data**: `src/lib/mock-data.ts`
-   **Helpers**: `src/lib/match/helpers.ts`

### Database

-   **Schema**: `prisma/schema.prisma`
-   **Client**: `src/lib/db.ts`
-   **Seed Script**: `scripts/seed-companies.ts`
-   **SQL Seed**: `supabase-seed-companies.sql`

---

## 🚀 Next Steps

1. **Update Intelligence Pages** to use API instead of JSON files
2. **Update Match Pages** to use API instead of mock data
3. **Add API client utilities** for consistent data fetching
4. **Add loading/error states** for better UX
5. **Consider Server Components** for better performance

---

## 💡 Quick Reference

### To check if data is from Supabase:

```typescript
// Look for these patterns:
import { prisma } from "@/lib/db";
await prisma.company.findMany();
await prisma.listing.findMany();
```

### To check if data is from JSON:

```typescript
// Look for these patterns:
import { loadCompanyFromJson } from "@/lib/intelligence/data-loader";
loadCompanyFromJson(slug);
```

### To check if data is mock:

```typescript
// Look for these patterns:
import { getMockListings } from "@/lib/mock-data";
getMockListings();
generateMockListings();
```
