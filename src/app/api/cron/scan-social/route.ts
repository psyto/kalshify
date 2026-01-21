// Cron job: Scan social media for intel
// Runs every 10 minutes via Vercel Cron

import { NextRequest, NextResponse } from 'next/server';
import { scanSocial } from '@/lib/intel';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting social scan...');
    const startTime = Date.now();

    const result = await scanSocial();

    const duration = Date.now() - startTime;
    console.log(`[CRON] Social scan completed in ${duration}ms`, {
      newSignals: result.newSignals,
      errors: result.errors,
    });

    return NextResponse.json({
      success: true,
      ...result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Social scan failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Social scan failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
