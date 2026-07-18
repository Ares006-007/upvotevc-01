import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { SignalDTO, SignalSchema } from '../dto/schemas';

export class MassiveClient {
  static async fetchMarketData(symbol: string): Promise<SignalDTO[]> {
    try {
      // Placeholder URL for Massive API
      const url = `https://api.massive.example.com/v1/quotes?symbol=${symbol}`;
      
      const response = await fetchWithRetry(url, {
        headers: {
          'Authorization': `Bearer ${env.MASSIVE_API_KEY}`
        }
      });

      if (!response.ok) {
        logger.error(`Massive API error: ${response.status}`);
        return [];
      }

      const json = await response.json();
      
      const signalRaw = {
        id: `market-${symbol}-${Date.now()}`,
        source: 'market',
        assetType: 'stock',
        symbol: symbol,
        title: `${symbol} Market Update`,
        text: `Current price update for ${symbol}: ${json.price || 'Unknown'}`,
        url: '',
        sentiment: json.sentiment || 0,
        tags: ['Market Data', symbol],
        createdAt: new Date().toISOString(),
        ingestedAt: new Date().toISOString(),
      };

      const parsed = SignalSchema.safeParse(signalRaw);
      if (!parsed.success) {
        logger.warn(`Failed to parse massive signal`, { error: parsed.error });
        return [];
      }

      return [parsed.data];
    } catch (error) {
      logger.error('Failed to fetch from Massive API', error);
      return [];
    }
  }
}
