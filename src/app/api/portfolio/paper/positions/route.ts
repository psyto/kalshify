import { NextRequest, NextResponse } from 'next/server';
import { getKalshiClient } from '@/lib/kalshi/client';
import { recordTrade, createSnapshot, getOrCreateTraderStats } from '@/lib/kalshi/performance-tracker';

// In-memory store for paper positions (demo mode)
// In production, this would use a database
interface PaperPosition {
  id: string;
  marketId: string;
  marketTitle: string;
  eventTicker: string | null;
  position: 'yes' | 'no';
  quantity: number;
  entryPrice: number;
  currentPrice?: number;
  simulatedPrice?: number; // For simulation mode
  status: 'open' | 'closed';
  createdAt: Date;
  closedAt?: Date;
  exitPrice?: number;
  realizedPnl?: number;
}

// Global in-memory store (persists across requests in dev mode)
const positions: Map<string, PaperPosition> = new Map();

// Demo visitor ID for unauthenticated users
const DEMO_VISITOR_ID = 'demo_visitor_001';

// Get visitor ID from request
function getVisitorId(request: NextRequest): string {
  const visitorId = request.cookies.get('visitor_id')?.value;
  return visitorId || DEMO_VISITOR_ID;
}

// Simulation mode flag
let simulationMode = true;

// Generate unique ID
function generateId(): string {
  return `pos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Simulate random price movement
function simulatePriceMovement(entryPrice: number): number {
  // Random walk: -10 to +10 cents change, bounded 1-99
  const change = Math.floor(Math.random() * 21) - 10;
  const newPrice = entryPrice + change;
  return Math.max(1, Math.min(99, newPrice));
}

// GET - Fetch user's paper positions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const simulate = searchParams.get('simulate') === 'true';

    const allPositions = Array.from(positions.values());

    // Update current prices
    const client = getKalshiClient();
    const updatedPositions = await Promise.all(
      allPositions.map(async (pos) => {
        if (pos.status === 'closed') {
          return pos;
        }

        // If simulation mode, use simulated prices
        if (simulationMode || simulate) {
          // Generate or use existing simulated price
          if (!pos.simulatedPrice) {
            pos.simulatedPrice = simulatePriceMovement(pos.entryPrice);
            positions.set(pos.id, pos);
          }
          return { ...pos, currentPrice: pos.simulatedPrice };
        }

        // Otherwise try to fetch from Kalshi
        try {
          const market = await client.getMarket(pos.marketId);
          const currentPrice = pos.position === 'yes' ? market.yes_bid : market.no_bid;
          return { ...pos, currentPrice: currentPrice || pos.entryPrice };
        } catch {
          return { ...pos, currentPrice: pos.entryPrice };
        }
      })
    );

    return NextResponse.json({
      positions: updatedPositions,
      simulationMode
    });
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
    const body = await request.json();
    const { marketId, marketTitle, eventTicker, position, quantity, price } = body;

    if (!marketId || !position || !quantity || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = generateId();
    const paperPosition: PaperPosition = {
      id,
      marketId,
      marketTitle: marketTitle || marketId,
      eventTicker: eventTicker || null,
      position,
      quantity,
      entryPrice: price,
      currentPrice: price,
      status: 'open',
      createdAt: new Date(),
    };

    positions.set(id, paperPosition);

    return NextResponse.json({ position: paperPosition });
  } catch (error) {
    console.error('Failed to create position:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
}

// PATCH - Simulate price changes or update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, positionId, newPrice } = body;

    switch (action) {
      case 'simulate_all':
        // Simulate new prices for all open positions
        positions.forEach((pos, id) => {
          if (pos.status === 'open') {
            pos.simulatedPrice = simulatePriceMovement(pos.entryPrice);
            positions.set(id, pos);
          }
        });
        return NextResponse.json({ success: true, message: 'Prices simulated' });

      case 'set_price':
        // Set a specific price for a position
        if (!positionId || newPrice === undefined) {
          return NextResponse.json(
            { error: 'positionId and newPrice required' },
            { status: 400 }
          );
        }
        const pos = positions.get(positionId);
        if (!pos) {
          return NextResponse.json(
            { error: 'Position not found' },
            { status: 404 }
          );
        }
        pos.simulatedPrice = Math.max(1, Math.min(99, newPrice));
        positions.set(positionId, pos);
        return NextResponse.json({ success: true, position: { ...pos, currentPrice: pos.simulatedPrice } });

      case 'toggle_simulation':
        simulationMode = !simulationMode;
        return NextResponse.json({ simulationMode });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update positions:', error);
    return NextResponse.json(
      { error: 'Failed to update positions' },
      { status: 500 }
    );
  }
}

// DELETE - Close a paper position
export async function DELETE(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request);
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('id');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID required' },
        { status: 400 }
      );
    }

    const position = positions.get(positionId);

    if (!position) {
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

    // Get exit price - use simulated price if available, otherwise try Kalshi
    let exitPrice = position.simulatedPrice || position.entryPrice;

    if (!position.simulatedPrice && !simulationMode) {
      try {
        const client = getKalshiClient();
        const market = await client.getMarket(position.marketId);
        exitPrice = position.position === 'yes' ? market.yes_bid : market.no_bid;
      } catch {
        // Use entry price if market unavailable
      }
    }

    // Calculate realized P&L
    const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;

    // Close position
    const closedPosition: PaperPosition = {
      ...position,
      status: 'closed',
      exitPrice,
      closedAt: new Date(),
      realizedPnl,
    };

    positions.set(positionId, closedPosition);

    // Record trade for leaderboard
    recordTrade(visitorId, realizedPnl);

    // Create performance snapshot
    const allPositions = Array.from(positions.values());
    const openPositions = allPositions.filter((p) => p.status === 'open');
    const closedPositions = allPositions.filter((p) => p.status === 'closed');

    let portfolioValue = 0;
    let totalCost = 0;
    let unrealizedPnl = 0;
    let totalRealizedPnl = 0;
    let winCount = 0;
    let lossCount = 0;

    openPositions.forEach((p) => {
      const currentPrice = p.simulatedPrice || p.currentPrice || p.entryPrice;
      portfolioValue += currentPrice * p.quantity;
      totalCost += p.entryPrice * p.quantity;
      unrealizedPnl += (currentPrice - p.entryPrice) * p.quantity;
    });

    closedPositions.forEach((p) => {
      totalRealizedPnl += p.realizedPnl || 0;
      if ((p.realizedPnl || 0) > 0) {
        winCount++;
      } else if ((p.realizedPnl || 0) < 0) {
        lossCount++;
      }
    });

    createSnapshot(visitorId, {
      portfolioValue,
      totalCost,
      unrealizedPnl,
      realizedPnl: totalRealizedPnl,
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      winCount,
      lossCount,
    });

    return NextResponse.json({ position: closedPosition });
  } catch (error) {
    console.error('Failed to close position:', error);
    return NextResponse.json(
      { error: 'Failed to close position' },
      { status: 500 }
    );
  }
}
