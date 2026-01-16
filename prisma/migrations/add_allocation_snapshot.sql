-- Add AllocationSnapshot table for tracking performance of allocation recommendations
-- This table stores daily snapshots of each risk profile's recommended allocation
-- and tracks actual performance over time to build trust through transparency

CREATE TABLE IF NOT EXISTS "AllocationSnapshot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "riskProfile" TEXT NOT NULL,
    "allocations" JSONB NOT NULL,
    "expectedApy" DOUBLE PRECISION NOT NULL,
    "weightedRiskScore" DOUBLE PRECISION NOT NULL,
    "actualReturn7d" DOUBLE PRECISION,
    "actualReturn30d" DOUBLE PRECISION,
    "poolPerformance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllocationSnapshot_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one snapshot per date per risk profile
CREATE UNIQUE INDEX IF NOT EXISTS "AllocationSnapshot_date_riskProfile_key"
ON "AllocationSnapshot"("date", "riskProfile");

-- Index for querying by date
CREATE INDEX IF NOT EXISTS "AllocationSnapshot_date_idx"
ON "AllocationSnapshot"("date");

-- Index for querying by risk profile
CREATE INDEX IF NOT EXISTS "AllocationSnapshot_riskProfile_idx"
ON "AllocationSnapshot"("riskProfile");

-- Enable Row Level Security (if using Supabase)
ALTER TABLE "AllocationSnapshot" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to all authenticated users
CREATE POLICY IF NOT EXISTS "AllocationSnapshot_select_policy" ON "AllocationSnapshot"
    FOR SELECT
    USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY IF NOT EXISTS "AllocationSnapshot_insert_policy" ON "AllocationSnapshot"
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "AllocationSnapshot_update_policy" ON "AllocationSnapshot"
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "AllocationSnapshot_delete_policy" ON "AllocationSnapshot"
    FOR DELETE
    USING (auth.role() = 'service_role');
