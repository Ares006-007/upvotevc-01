import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HackClubAiClient } from '@/clients/hackclubAi';

describe('HackClubAiClient', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockClear();
    process.env.HACK_CLUB_AI_KEY = 'test_key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate valid insights and parse them correctly', async () => {
    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: 'Overall positive.',
              riskFactors: ['High volatility'],
              opportunities: ['Undervalued assets'],
              sentimentScore: 0.8
            })
          }
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockAiResponse), { status: 200 }));

    const insight = await HackClubAiClient.generateInsight([]);

    expect(insight.summary).toBe('Overall positive.');
    expect(insight.riskFactors).toContain('High volatility');
    expect(insight.opportunities).toContain('Undervalued assets');
    expect(insight.sentimentScore).toBe(0.8);
  });

  it('should fallback to error response if AI returns invalid schema', async () => {
    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              // Missing required fields from InsightSummarySchema
              randomField: 'hello'
            })
          }
        }
      ]
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockAiResponse), { status: 200 }));

    const insight = await HackClubAiClient.generateInsight([]);

    expect(insight.summary).toBe('Error analyzing signals.');
    expect(insight.sentimentScore).toBe(0);
  });

  it('should fallback if fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Server error', { status: 500 }));

    const insight = await HackClubAiClient.generateInsight([]);

    expect(insight.summary).toBe('Error analyzing signals.');
  });
});
