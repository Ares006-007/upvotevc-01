import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { SignalDTO, SignalSchema } from '../dto/schemas';

export class NewsApiClient {
  static async fetchNews(query: string, limit: number = 10): Promise<SignalDTO[]> {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${limit}`;
      const response = await fetchWithRetry(url, {
        headers: {
          'X-Api-Key': env.NEWS_API_KEY
        }
      });

      if (!response.ok) {
        logger.error(`NewsAPI error: ${response.status}`);
        return [];
      }

      const json = await response.json();
      const articles = json.articles || [];

      const signals = articles.map((article: any) => {
        const signalRaw = {
          id: `news-${Buffer.from(article.url || '').toString('base64').substring(0, 15)}`,
          source: 'news',
          assetType: 'macro', // Default for news
          companyName: article.source.name,
          title: article.title,
          text: article.description || article.content?.substring(0, 500) || '',
          url: article.url,
          sentiment: 0,
          tags: ['News', query],
          createdAt: article.publishedAt || new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
        };

        const parsed = SignalSchema.safeParse(signalRaw);
        if (!parsed.success) {
          logger.warn(`Failed to parse news signal`, { error: parsed.error });
          return null;
        }
        return parsed.data;
      }).filter((s: SignalDTO | null): s is SignalDTO => s !== null);

      return signals;
    } catch (error) {
      logger.error('Failed to fetch from NewsAPI', error);
      return [];
    }
  }
}
