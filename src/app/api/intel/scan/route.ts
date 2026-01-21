// POST /api/intel/scan - Trigger manual market scan

import { NextRequest, NextResponse } from 'next/server';
import { scanMarkets, scanSocial } from '@/lib/intel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const scanType = body.type || 'all'; // 'markets', 'social', or 'all'

    const results: {
      markets?: Awaited<ReturnType<typeof scanMarkets>>;
      social?: Awaited<ReturnType<typeof scanSocial>>;
    } = {};

    if (scanType === 'markets' || scanType === 'all') {
      results.markets = await scanMarkets();
    }

    if (scanType === 'social' || scanType === 'all') {
      results.social = await scanSocial();
    }

    const totalNewSignals =
      (results.markets?.newSignals || 0) + (results.social?.newSignals || 0);

    return NextResponse.json({
      success: true,
      newSignals: totalNewSignals,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run scan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
