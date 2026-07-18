import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignalService } from '@/domain/signals';
import { RedditJsonClient } from '@/clients/redditJson';
import { NewsApiClient } from '@/clients/newsapi';
import { MassiveClient } from '@/clients/massive';

describe('SignalService', () => {
  beforeEach(() => {
    vi.spyOn(RedditJsonClient, 'fetchSubredditPosts').mockClear();
    vi.spyOn(NewsApiClient, 'fetchNews').mockClear();
    vi.spyOn(MassiveClient, 'fetchMarketData').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should aggregate and map signals from all sources correctly', async () => {
    vi.spyOn(RedditJsonClient, 'fetchSubredditPosts').mockResolvedValueOnce([
      {
        post_id: 'r1',
        subreddit: 'wallstreetbets',
        title: 'Reddit Post',
        selftext: 'Body',
        author: 'u1',
        score: 10,
        num_comments: 1,
        created_utc: 1700000000,
        permalink: '/r/wallstreetbets/comments/r1',
        url: 'url',
        flair: null,
        raw_json: {}
      }
    ]);

    vi.spyOn(NewsApiClient, 'fetchNews').mockResolvedValueOnce([
      {
        id: 'n1',
        source: 'news',
        assetType: 'macro',
        title: 'News Article',
        tags: ['News'],
        createdAt: new Date(1700000001000).toISOString(),
        ingestedAt: new Date().toISOString()
      }
    ]);

    vi.spyOn(MassiveClient, 'fetchMarketData').mockResolvedValueOnce([
      {
        id: 'm1',
        source: 'market',
        assetType: 'stock',
        title: 'Market Data',
        tags: ['Market'],
        createdAt: new Date(1700000002000).toISOString(),
        ingestedAt: new Date().toISOString()
      }
    ]);

    const signals = await SignalService.getAggregatedSignals({ limit: 1 });

    expect(signals).toHaveLength(3);
    
    // Check if sorted properly (newest first)
    expect(signals[0].id).toBe('m1');
    expect(signals[1].id).toBe('n1');
    expect(signals[2].id).toBe('reddit-r1');
  });
});
