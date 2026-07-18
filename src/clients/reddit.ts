import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { SignalDTO, SignalSchema } from '../dto/schemas';

export class RedditClient {
  static async fetchSubreddit(subreddit: string, limit: number = 10): Promise<SignalDTO[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const response = await fetchWithRetry(url, {
        headers: { 'User-Agent': 'UpvoteVC/1.0.0' }
      });

      if (!response.ok) {
        logger.error(`Reddit API error: ${response.status}`, { subreddit });
        return [];
      }

      const json = await response.json();
      const posts = json.data?.children || [];

      const signals = posts
        .filter((child: any) => !child.data.stickied && !child.data.is_video)
        .map((child: any) => {
          const data = child.data;
          const signalRaw = {
            id: `reddit-${data.id}`,
            source: 'reddit',
            assetType: 'stock', // Naive default
            subreddit: data.subreddit,
            title: data.title,
            text: data.selftext.substring(0, 1000),
            url: `https://reddit.com${data.permalink}`,
            raw: undefined, // omitting raw to keep payload clean
            sentiment: 0,
            tags: [data.subreddit, 'Retail'],
            createdAt: new Date(data.created_utc * 1000).toISOString(),
            ingestedAt: new Date().toISOString(),
          };

          const parsed = SignalSchema.safeParse(signalRaw);
          if (!parsed.success) {
            logger.warn(`Failed to parse reddit signal ${data.id}`, { error: parsed.error });
            return null;
          }
          return parsed.data;
        })
        .filter((s: SignalDTO | null): s is SignalDTO => s !== null);

      return signals;
    } catch (error) {
      logger.error('Failed to fetch from Reddit', error, { subreddit });
      return [];
    }
  }
}
