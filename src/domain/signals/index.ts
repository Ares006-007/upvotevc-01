import { RedditClient } from '../../clients/reddit';
import { NewsApiClient } from '../../clients/newsapi';
import { MassiveClient } from '../../clients/massive';
import { SignalDTO } from '../../dto/schemas';
import { logger } from '../../utils/logger';

export class SignalService {
  /**
   * Orchestrates fetching and normalizing signals from all configured clients.
   */
  static async getAggregatedSignals(options?: { query?: string, limit?: number }): Promise<SignalDTO[]> {
    logger.info('Aggregating signals...', options);
    const limit = options?.limit || 5;
    const query = options?.query || 'venture capital';
    
    // Fetch from all sources concurrently
    const [redditSignals, newsSignals, marketSignals] = await Promise.all([
      RedditClient.fetchSubreddit('wallstreetbets', limit),
      NewsApiClient.fetchNews(query, limit),
      MassiveClient.fetchMarketData('SPY') // Placeholder
    ]);

    // Flatten and optionally sort by date or apply custom domain rules
    const aggregated = [...redditSignals, ...newsSignals, ...marketSignals];
    
    // Example domain logic: Sort by newest first
    aggregated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return aggregated;
  }
}
