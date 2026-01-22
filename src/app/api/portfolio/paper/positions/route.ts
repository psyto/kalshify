import { NextRequest, NextResponse } from 'next/server';
import { getKalshiClient } from '@/lib/kalshi/client';
import { recordTrade, createSnapshot, getOrCreateTraderStats, checkAchievements } from '@/lib/kalshi/performance-tracker';
import { resolveUserId } from '@/lib/auth/visitor';
import { prisma } from '@/lib/db';

// GET - Fetch user's paper positions
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json({ positions: [] });
    }

    const positions = await prisma.paperPosition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Update current prices from Kalshi API
    const client = getKalshiClient();
    const updatedPositions = await Promise.all(
      positions.map(async (pos) => {
        if (pos.status === 'closed') {
          return pos;
        }

        // Fetch real price from Kalshi
        try {
          const market = await client.getMarket(pos.marketId);
          const currentPrice = pos.position === 'yes' ? market.yes_bid : market.no_bid;
          return { ...pos, currentPrice: currentPrice || pos.entryPrice };
        } catch {
          // If market not found, return entry price
          return { ...pos, currentPrice: pos.entryPrice };
        }
      })
    );

    return NextResponse.json({ positions: updatedPositions });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// POST - Create a new paper position
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { marketId, marketTitle, eventTicker, position, quantity, price } = body;

    if (!marketId || !position || !quantity || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paperPosition = await prisma.paperPosition.create({
      data: {
        userId,
        marketId,
        marketTitle: marketTitle || marketId,
        eventTicker: eventTicker || null,
        position,
        quantity,
        entryPrice: price,
        currentPrice: price,
        status: 'open',
      },
    });

    return NextResponse.json({ position: paperPosition });
  } catch (error) {
    console.error('Failed to create position:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
}

// DELETE - Close a paper position
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID required' },
        { status: 400 }
      );
    }

    // Run user resolution and position fetch in parallel
    const [userId, position] = await Promise.all([
      resolveUserId(),
      prisma.paperPosition.findUnique({ where: { id: positionId } }),
    ]);

    if (!userId) {
      return NextResponse.json(
        { error: 'User identification required' },
        { status: 401 }
      );
    }

    if (!position || position.userId !== userId) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    if (position.status === 'closed') {
      return NextResponse.json(
        { error: 'Position already closed' },
        { status: 400 }
      );
    }

    // Get current market price for exit
    let exitPrice = position.entryPrice;
    try {
      const client = getKalshiClient();
      const market = await client.getMarket(position.marketId);
      exitPrice = position.position === 'yes' ? market.yes_bid : market.no_bid;
      if (!exitPrice) exitPrice = position.entryPrice;
    } catch {
      // If can't fetch market, use entry price
      exitPrice = position.entryPrice;
    }

    const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;

    // Close position and get all positions in parallel
    const [closedPosition, allPositions] = await Promise.all([
      prisma.paperPosition.update({
        where: { id: positionId },
        data: {
          status: 'closed',
          exitPrice,
          closedAt: new Date(),
          realizedPnl,
        },
      }),
      prisma.paperPosition.findMany({
        where: { userId },
        select: {
          status: true,
          entryPrice: true,
          quantity: true,
          currentPrice: true,
          realizedPnl: true,
        },
      }),
    ]);

    // Calculate stats (fast in-memory)
    let portfolioValue = 0;
    let totalCost = 0;
    let unrealizedPnl = 0;
    let totalRealizedPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let openCount = 0;
    let closedCount = 0;

    for (const p of allPositions) {
      if (p.status === 'open') {
        openCount++;
        const currentPrice = p.currentPrice || p.entryPrice;
        portfolioValue += currentPrice * p.quantity;
        totalCost += p.entryPrice * p.quantity;
        unrealizedPnl += (currentPrice - p.entryPrice) * p.quantity;
      } else {
        closedCount++;
        totalRealizedPnl += p.realizedPnl || 0;
        if ((p.realizedPnl || 0) > 0) winCount++;
        else if ((p.realizedPnl || 0) < 0) lossCount++;
      }
    }

    // Run recordTrade and createSnapshot, then get updated stats
    await Promise.all([
      recordTrade(userId, realizedPnl),
      createSnapshot(userId, {
        portfolioValue,
        totalCost,
        unrealizedPnl,
        realizedPnl: totalRealizedPnl,
        openPositions: openCount,
        closedPositions: closedCount,
        winCount,
        lossCount,
      }),
    ]);

    // Get updated stats for celebration data
    const updatedStats = await getOrCreateTraderStats(userId);

    // Calculate P&L percentage
    const pnlPercent = position.entryPrice > 0
      ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100
      : 0;

    // Check for newly unlocked achievements
    // The client passes previously unlocked achievement IDs in a header
    const previouslyUnlockedHeader = request.headers.get('x-unlocked-achievements');
    const previouslyUnlocked = previouslyUnlockedHeader
      ? previouslyUnlockedHeader.split(',').filter(Boolean)
      : [];

    const newAchievements = await checkAchievements(userId, previouslyUnlocked);

    return NextResponse.json({
      position: closedPosition,
      celebration: realizedPnl > 0 ? {
        id: closedPosition.id,
        marketTitle: closedPosition.marketTitle,
        pnlCents: realizedPnl,
        pnlPercent,
        streak: updatedStats.currentStreak,
        position: closedPosition.position,
        quantity: closedPosition.quantity,
        entryPrice: closedPosition.entryPrice,
        exitPrice,
      } : null,
      newAchievements: newAchievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        rarity: a.rarity,
        message: a.message,
      })),
    });
  } catch (error) {
    console.error('Failed to close position:', error);
    return NextResponse.json(
      { error: 'Failed to close position' },
      { status: 500 }
    );
  }
}
