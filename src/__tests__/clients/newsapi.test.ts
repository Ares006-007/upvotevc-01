import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NewsApiClient } from '@/clients/newsapi';

describe('NewsApiClient', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockClear();
    process.env.NEWS_API_KEY = 'test_key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and map news articles correctly', async () => {
    const mockResponse = {
      articles: [
        {
          source: { name: 'TechCrunch' },
          title: 'Startup raises $10M',
          description: 'A new startup just raised money.',
          url: 'https://example.com/news/1',
          publishedAt: '2024-01-01T00:00:00Z'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const signals = await NewsApiClient.fetchNews('startups', 1);

    expect(signals).toHaveLength(1);
    expect(signals[0].source).toBe('news');
    expect(signals[0].title).toBe('Startup raises $10M');
    expect(signals[0].text).toBe('A new startup just raised money.');
    expect(signals[0].companyName).toBe('TechCrunch');
    expect(signals[0].tags).toContain('News');
    expect(signals[0].tags).toContain('startups');
  });

  it('should handle missing descriptions gracefully', async () => {
    const mockResponse = {
      articles: [
        {
          source: { name: 'BBC' },
          title: 'Title only',
          url: 'https://example.com',
          publishedAt: '2024-01-01T00:00:00Z'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const signals = await NewsApiClient.fetchNews('test');

    expect(signals).toHaveLength(1);
    expect(signals[0].text).toBe(''); // Defaults to empty string
  });

  it('should handle non-OK responses gracefully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Error', { status: 401 }));

    const signals = await NewsApiClient.fetchNews('startups');
    expect(signals).toEqual([]);
  });

  it('should handle malformed article payloads safely', async () => {
    const mockResponse = {
      articles: [
        {
          source: null, // missing required nested data structurally or causing parse issues
          title: 123, // Invalid type
          url: 'https://example.com'
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const signals = await NewsApiClient.fetchNews('startups');
    expect(signals).toEqual([]);
  });

  it('should gracefully handle network failures', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    const signals = await NewsApiClient.fetchNews('startups');
    expect(signals).toEqual([]);
  });
});
