import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/signals/route';
import { SignalService } from '@/domain/signals';

describe('API Route: /api/signals', () => {
  beforeEach(() => {
    vi.spyOn(SignalService, 'getAggregatedSignals').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 for invalid query parameters', async () => {
    const request = new Request('http://localhost/api/signals?limit=999'); // Exceeds max 50
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid query parameters');
  });

  it('should return aggregated signals successfully', async () => {
    vi.spyOn(SignalService, 'getAggregatedSignals').mockResolvedValueOnce([
      {
        id: '1',
        source: 'reddit',
        assetType: 'stock',
        title: 'Test',
        tags: [],
        createdAt: new Date().toISOString(),
        ingestedAt: new Date().toISOString()
      }
    ]);

    const request = new Request('http://localhost/api/signals?limit=5');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('1');
  });
});
