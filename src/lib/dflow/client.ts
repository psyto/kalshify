// DFlow Prediction Markets API Client
// Handles Solana tokenization and Builder Codes integration

import axios, { AxiosInstance } from 'axios';
import {
  DFlowConfig,
  DFlowMarket,
  DFlowPosition,
  MintRequest,
  RedeemRequest,
  DFlowTransaction,
  BuilderCodeStats,
  CLPQuote,
  CLPPool,
} from './types';

const MAINNET_URL = 'https://api.dflow.net/v1';
const DEVNET_URL = 'https://devnet-api.dflow.net/v1';

export class DFlowClient {
  private client: AxiosInstance;
  private builderCode: string;

  constructor(config: DFlowConfig) {
    const baseURL = config.network === 'mainnet' ? MAINNET_URL : DEVNET_URL;
    this.builderCode = config.builderCode;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'X-Builder-Code': config.builderCode,
      },
    });
  }

  // Get available prediction markets
  async getMarkets(): Promise<DFlowMarket[]> {
    const response = await this.client.get('/prediction-markets');
    return response.data.markets;
  }

  // Get single market details
  async getMarket(marketId: string): Promise<DFlowMarket> {
    const response = await this.client.get(`/prediction-markets/${marketId}`);
    return response.data.market;
  }

  // Get user positions
  async getPositions(walletAddress: string): Promise<DFlowPosition[]> {
    const response = await this.client.get(`/positions/${walletAddress}`);
    return response.data.positions;
  }

  // Get quote for minting tokens
  async getMintQuote(request: MintRequest): Promise<CLPQuote> {
    const response = await this.client.post('/quote/mint', {
      ...request,
      builderCode: this.builderCode,
    });
    return response.data.quote;
  }

  // Get quote for redeeming tokens
  async getRedeemQuote(request: RedeemRequest): Promise<CLPQuote> {
    const response = await this.client.post('/quote/redeem', {
      ...request,
      builderCode: this.builderCode,
    });
    return response.data.quote;
  }

  // Build mint transaction (returns unsigned transaction)
  async buildMintTransaction(request: MintRequest): Promise<{ transaction: string }> {
    const response = await this.client.post('/transaction/mint', {
      ...request,
      builderCode: this.builderCode,
    });
    return response.data;
  }

  // Build redeem transaction (returns unsigned transaction)
  async buildRedeemTransaction(request: RedeemRequest): Promise<{ transaction: string }> {
    const response = await this.client.post('/transaction/redeem', {
      ...request,
      builderCode: this.builderCode,
    });
    return response.data;
  }

  // Get CLP pool info
  async getCLPPool(marketId: string): Promise<CLPPool> {
    const response = await this.client.get(`/clp/${marketId}`);
    return response.data.pool;
  }

  // Get transaction history for wallet
  async getTransactionHistory(
    walletAddress: string,
    limit = 50
  ): Promise<DFlowTransaction[]> {
    const response = await this.client.get(`/transactions/${walletAddress}`, {
      params: { limit },
    });
    return response.data.transactions;
  }

  // Builder Code Statistics
  async getBuilderCodeStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<BuilderCodeStats> {
    const response = await this.client.get('/builder/stats', {
      params: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      },
    });
    return response.data.stats;
  }

  // Record a transaction with builder code (for tracking)
  async recordTransaction(transaction: Omit<DFlowTransaction, 'builderCode'>): Promise<void> {
    await this.client.post('/builder/record', {
      ...transaction,
      builderCode: this.builderCode,
    });
  }
}

// Singleton instance
let clientInstance: DFlowClient | null = null;

export function getDFlowClient(): DFlowClient | null {
  if (!clientInstance && process.env.DFLOW_API_KEY && process.env.DFLOW_BUILDER_CODE) {
    clientInstance = new DFlowClient({
      apiKey: process.env.DFLOW_API_KEY,
      builderCode: process.env.DFLOW_BUILDER_CODE,
      network: process.env.DFLOW_NETWORK === 'mainnet' ? 'mainnet' : 'devnet',
    });
  }
  return clientInstance;
}

export default DFlowClient;
