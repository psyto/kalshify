-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "Swipe" CASCADE;
DROP TABLE IF EXISTS "ClaimedProfile" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Watchlist" CASCADE;
DROP TABLE IF EXISTS "Document" CASCADE;
DROP TABLE IF EXISTS "DataRoomRequest" CASCADE;
DROP TABLE IF EXISTS "Offer" CASCADE;
DROP TABLE IF EXISTS "Listing" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Company" CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Company table
CREATE TABLE "Company" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "website" TEXT,
  "overallScore" INTEGER NOT NULL DEFAULT 0,
  "teamHealthScore" INTEGER NOT NULL DEFAULT 0,
  "growthScore" INTEGER NOT NULL DEFAULT 0,
  "socialScore" INTEGER NOT NULL DEFAULT 0,
  "walletQualityScore" INTEGER NOT NULL DEFAULT 0,
  "trend" TEXT NOT NULL DEFAULT 'stable',
  "indexData" JSONB,
  "isListed" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastFetchedAt" TIMESTAMP(3),
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE INDEX "Company_slug_idx" ON "Company"("slug");
CREATE INDEX "Company_category_idx" ON "Company"("category");
CREATE INDEX "Company_overallScore_idx" ON "Company"("overallScore");
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- User table
CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "walletAddress" TEXT,
  "displayName" TEXT,
  "bio" TEXT,
  "website" TEXT,
  "twitter" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");
CREATE INDEX "User_email_idx" ON "User"("email");

-- Account table (NextAuth)
CREATE TABLE "Account" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Session table (NextAuth)
CREATE TABLE "Session" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VerificationToken table (NextAuth)
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- ClaimedProfile table
CREATE TABLE "ClaimedProfile" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "userId" TEXT NOT NULL,
  "companySlug" TEXT NOT NULL,
  "verificationType" TEXT NOT NULL,
  "verificationProof" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClaimedProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClaimedProfile_companySlug_key" ON "ClaimedProfile"("companySlug");
CREATE INDEX "ClaimedProfile_userId_idx" ON "ClaimedProfile"("userId");
CREATE INDEX "ClaimedProfile_companySlug_idx" ON "ClaimedProfile"("companySlug");

ALTER TABLE "ClaimedProfile" ADD CONSTRAINT "ClaimedProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Swipe table
CREATE TABLE "Swipe" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "userId" TEXT NOT NULL,
  "companySlug" TEXT NOT NULL,
  "partnerSlug" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Swipe_companySlug_partnerSlug_key" ON "Swipe"("companySlug", "partnerSlug");
CREATE INDEX "Swipe_userId_idx" ON "Swipe"("userId");
CREATE INDEX "Swipe_companySlug_idx" ON "Swipe"("companySlug");
CREATE INDEX "Swipe_partnerSlug_idx" ON "Swipe"("partnerSlug");

ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match table
CREATE TABLE "Match" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "companyASlug" TEXT NOT NULL,
  "companyBSlug" TEXT NOT NULL,
  "matchScore" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "partnershipType" TEXT,
  "partnershipMetrics" JSONB,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Match_companyASlug_companyBSlug_key" ON "Match"("companyASlug", "companyBSlug");
CREATE INDEX "Match_companyASlug_idx" ON "Match"("companyASlug");
CREATE INDEX "Match_companyBSlug_idx" ON "Match"("companyBSlug");
CREATE INDEX "Match_status_idx" ON "Match"("status");
CREATE INDEX "Match_matchedAt_idx" ON "Match"("matchedAt");

-- Listing table
CREATE TABLE "Listing" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "type" TEXT NOT NULL,
  "projectName" TEXT NOT NULL,
  "productType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "askingPrice" DECIMAL(15,2),
  "revenue" DECIMAL(15,2) NOT NULL,
  "mau" INTEGER NOT NULL,
  "seekingPartners" TEXT[] NOT NULL DEFAULT '{}',
  "offeringCapabilities" TEXT[] NOT NULL DEFAULT '{}',
  "partnershipType" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "chain" TEXT NOT NULL,
  "website" TEXT,
  "logoUrl" TEXT,
  "hasNDA" BOOLEAN NOT NULL DEFAULT false,
  "requiresProofOfFunds" BOOLEAN NOT NULL DEFAULT false,
  "minBuyerCapital" DECIMAL(15,2),
  "indexCompanyId" TEXT,
  "suiteDataSnapshot" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "sellerId" TEXT NOT NULL,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Listing_category_idx" ON "Listing"("category");
CREATE INDEX "Listing_type_idx" ON "Listing"("type");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Offer table
CREATE TABLE "Offer" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "amount" DECIMAL(15,2),
  "proposalText" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "contactEmail" TEXT,
  "contactTelegram" TEXT,
  "proofOfFundsUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  "listingId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Offer_listingId_idx" ON "Offer"("listingId");
CREATE INDEX "Offer_buyerId_idx" ON "Offer"("buyerId");
CREATE INDEX "Offer_status_idx" ON "Offer"("status");
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataRoomRequest table
CREATE TABLE "DataRoomRequest" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "purpose" TEXT NOT NULL,
  "companyName" TEXT,
  "position" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
  "ndaSignedAt" TIMESTAMP(3),
  "ndaDocumentUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  "listingId" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  CONSTRAINT "DataRoomRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataRoomRequest_listingId_idx" ON "DataRoomRequest"("listingId");
CREATE INDEX "DataRoomRequest_requesterId_idx" ON "DataRoomRequest"("requesterId");
CREATE INDEX "DataRoomRequest_status_idx" ON "DataRoomRequest"("status");

ALTER TABLE "DataRoomRequest" ADD CONSTRAINT "DataRoomRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataRoomRequest" ADD CONSTRAINT "DataRoomRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Document table
CREATE TABLE "Document" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "requiresDataRoomAccess" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "listingId" TEXT NOT NULL,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Document_listingId_idx" ON "Document"("listingId");
CREATE INDEX "Document_type_idx" ON "Document"("type");

ALTER TABLE "Document" ADD CONSTRAINT "Document_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Watchlist table
CREATE TABLE "Watchlist" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Watchlist_userId_listingId_key" ON "Watchlist"("userId", "listingId");
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification table
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "linkUrl" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "emailSent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
