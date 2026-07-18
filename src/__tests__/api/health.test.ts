import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('API Route: /api/health', () => {
  it('should return a 200 OK status', async () => {
    const response = await GET();
    
    expect(response.status).toBe(200);
    
    const json = await response.json();
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeDefined();
  });
});
