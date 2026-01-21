import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getKalshiClient } from '@/lib/kalshi/client';

// GET - Check if market is in watchlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marketId } = await params;

    const existing = await prisma.marketWatchlist.findUnique({
      where: {
        userId_marketId: {
          userId: session.user.id,
          marketId,
        },
      },
    });

    return NextResponse.json({ isWatchlisted: !!existing });
  } catch (error) {
    console.error('Failed to check watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to check watchlist' },
      { status: 500 }
    );
  }
}

// POST - Add market to watchlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marketId } = await params;

    // Check if already exists
    const existing = await prisma.marketWatchlist.findUnique({
      where: {
        userId_marketId: {
          userId: session.user.id,
          marketId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already in watchlist' });
    }

    // Fetch market details
    const client = getKalshiClient();
    const market = await client.getMarket(marketId);

    // Add to watchlist
    await prisma.marketWatchlist.create({
      data: {
        userId: session.user.id,
        marketId,
        eventTicker: market.event_ticker,
        title: market.title,
        category: market.category,
      },
    });

    return NextResponse.json({ message: 'Added to watchlist' });
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove market from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marketId } = await params;

    await prisma.marketWatchlist.delete({
      where: {
        userId_marketId: {
          userId: session.user.id,
          marketId,
        },
      },
    });

    return NextResponse.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Failed to remove from watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
