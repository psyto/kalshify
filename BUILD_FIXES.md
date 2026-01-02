# Next.js 16 Production Build Fixes

## Overview

Fixed all issues preventing the production build from completing successfully on Next.js 16.1.1 with Turbopack.

## Issues Fixed

### 1. TypeScript Error - Async Params in API Route Error Handler

**Error:**
```
Type error: Property 'id' does not exist on type 'Promise<{ id: string; }>'.
./src/app/api/listings/[id]/route.ts:92:47
```

**Cause:** In Next.js 16, all route parameters (`params`) are asynchronous Promises. The GET method's error handler was still using `params.id` directly instead of awaiting the Promise.

**Fix:** Updated `/src/app/api/listings/[id]/route.ts:92`
```typescript
// BEFORE
catch (error) {
  console.error(`GET /api/listings/${params.id} error:`, error);
  // ...
}

// AFTER
catch (error) {
  const { id } = await params;
  console.error(`GET /api/listings/${id} error:`, error);
  // ...
}
```

### 2. Wagmi Hook Prerendering Error

**Error:**
```
Error occurred prerendering page "/synergy/seller/create"
Error [WagmiProviderNotFoundError]: `useConfig` must be used within `WagmiProvider`.
```

**Cause:** The create listing page uses wagmi hooks (via `useAuth`) which require browser context and the WagmiProvider. Next.js was trying to pre-render this page at build time, causing the hooks to fail.

**Solution Attempts:**
1. ❌ `export const dynamic = 'force-dynamic'` - Didn't prevent prerendering
2. ❌ `next/dynamic` with `ssr: false` in Server Component - Not allowed in Next.js 16
3. ✅ **Final Solution:** `next/dynamic` with `ssr: false` in Client Component

**Fix:** Updated `/src/app/synergy/seller/create/page.tsx`
```typescript
"use client";

import dynamic from "next/dynamic";

// Dynamically import with ssr: false to prevent prerendering
// This is needed because the component uses wagmi hooks that require browser context
const CreateListingClient = dynamic(
    () => import("./CreateListingClient").then((mod) => ({ default: mod.CreateListingClient })),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        ),
    }
);

export default function CreateListingPage() {
    return <CreateListingClient />;
}
```

## Key Learnings

1. **Next.js 16 Breaking Change**: Route `params` are now asynchronous Promises
   - Must be awaited in ALL usages, including error handlers
   - Affects both page routes and API routes

2. **`next/dynamic` with `ssr: false`**:
   - Only works in Client Components (pages with `"use client"`)
   - Cannot be used in Server Components in Next.js 16
   - Essential for components that use browser-only hooks (like wagmi)

3. **Turbopack Build Process**:
   - Attempts to prerender all routes by default
   - Use `ssr: false` to skip prerendering for client-only pages
   - Build errors are more strict than dev mode

## Build Result

✅ **Production build successful!**

```
Route (app)
├ ƒ /                              (Dynamic)
├ ○ /_not-found                    (Static)
├ ƒ /api/index/[companyId]        (Dynamic)
├ ƒ /api/index/search             (Dynamic)
├ ƒ /api/listings                 (Dynamic)
├ ƒ /api/listings/[id]            (Dynamic)
├ ƒ /api/users/[address]          (Dynamic)
├ ƒ /index                        (Dynamic)
├ ƒ /index/[company]              (Dynamic)
├ ƒ /index/companies              (Dynamic)
├ ƒ /synergy                      (Dynamic)
├ ○ /synergy/opportunities        (Static)
├ ƒ /synergy/opportunities/[id]   (Dynamic)
├ ○ /synergy/seller               (Static)
└ ○ /synergy/seller/create        (Static with client-side dynamic loading)
```

**Total Routes**: 15
- **Dynamic (ƒ)**: 11 routes (server-rendered on demand)
- **Static (○)**: 4 routes (prerendered at build time)

## Files Modified

1. `/src/app/api/listings/[id]/route.ts` - Fixed async params in GET error handler
2. `/src/app/synergy/seller/create/page.tsx` - Added `next/dynamic` with `ssr: false`

## Related Documentation

- [Next.js 16 Async Params Migration](/NEXTJS16_MIGRATION.md)
- [Index Pages Fix](/INDEX_PAGES_FIXED.md)
