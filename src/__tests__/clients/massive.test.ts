import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MassiveClient } from '@/clients/massive';

describe('MassiveClient', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockClear();
    process.env.MASSIVE_API_KEY = 'test_key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and map market data correctly', async () => {
    const mockResponse = {
      price: 150.25,
      sentiment: 0.7
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const signals = await MassiveClient.fetchMarketData('AAPL');

    expect(signals).toHaveLength(1);
    expect(signals[0].source).toBe('market');
    expect(signals[0].symbol).toBe('AAPL');
    expect(signals[0].text).toBe('Current price update for AAPL: 150.25');
    expect(signals[0].sentiment).toBe(0.7);
    expect(signals[0].tags).toContain('Market Data');
    expect(signals[0].tags).toContain('AAPL');
  });

  it('should handle missing price or sentiment gracefully', async () => {
    const mockResponse = {
      // Missing price and sentiment
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const signals = await MassiveClient.fetchMarketData('TSLA');

    expect(signals).toHaveLength(1);
    expect(signals[0].text).toContain('Unknown');
    expect(signals[0].sentiment).toBe(0); // fallback default
  });

  it('should handle non-OK responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Error', { status: 403 }));

    const signals = await MassiveClient.fetchMarketData('AAPL');
    expect(signals).toEqual([]);
  });

  it('should handle network/fetch failures gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const signals = await MassiveClient.fetchMarketData('AAPL');
    expect(signals).toEqual([]);
  });
});
