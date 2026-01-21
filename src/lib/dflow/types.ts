// DFlow Prediction Markets API Types
// For Solana-based tokenized prediction markets

export interface DFlowConfig {
  apiKey: string;
  builderCode: string;
  network: 'mainnet' | 'devnet';
}

export interface DFlowMarket {
  marketId: string;
  kalshiTicker: string;
  tokenMint: string; // Solana token mint address
  yesTokenMint: string;
  noTokenMint: string;
  collateralMint: string; // Usually USDC
  totalLiquidity: number;
  status: 'active' | 'resolved' | 'expired';
}

export interface DFlowPosition {
  marketId: string;
  walletAddress: string;
  yesBalance: number;
  noBalance: number;
  collateralLocked: number;
}

export interface MintRequest {
  marketId: string;
  amount: number; // Amount of collateral
  position: 'yes' | 'no';
  walletAddress: string;
}

export interface RedeemRequest {
  marketId: string;
  amount: number;
  position: 'yes' | 'no';
  walletAddress: string;
}

export interface DFlowTransaction {
  signature: string;
  type: 'mint' | 'redeem' | 'transfer';
  marketId: string;
  amount: number;
  position?: 'yes' | 'no';
  walletAddress: string;
  timestamp: Date;
  builderCode: string;
  feeAmount: number;
}

export interface BuilderCodeStats {
  builderCode: string;
  totalVolume: number;
  totalTransactions: number;
  totalFeesEarned: number;
  uniqueUsers: number;
  periodStart: Date;
  periodEnd: Date;
}

// CLP (Conditional Liquidity Pool) types
export interface CLPQuote {
  marketId: string;
  inputAmount: number;
  outputAmount: number;
  position: 'yes' | 'no';
  slippage: number;
  priceImpact: number;
  fee: number;
}

export interface CLPPool {
  marketId: string;
  yesReserve: number;
  noReserve: number;
  collateralReserve: number;
  totalShares: number;
  fee: number; // in basis points
}
