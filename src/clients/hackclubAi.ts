import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { SignalDTO, InsightSummaryDTO, InsightSummarySchema } from '../dto/schemas';

export class HackClubAiClient {
  static async completion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const url = `https://api.hackclub.example.com/v1/chat/completions`;
      
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.HACK_CLUB_AI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HackClub AI error: ${response.status}`);
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content || '';
    } catch (error) {
      logger.error('Failed to call Hack Club AI', error);
      throw error;
    }
  }

  // Kept for backward compatibility if needed in some older tests/routes, but shouldn't be used
  static async generateInsight(signals: SignalDTO[]): Promise<InsightSummaryDTO> {
    try {
      const prompt = `Analyze the following market signals and provide a JSON response with keys: 'summary' (string), 'riskFactors' (array of strings), 'opportunities' (array of strings), and 'sentimentScore' (number from -1.0 to 1.0). Signals: ${JSON.stringify(signals)}`;
      const content = await this.completion("You are a helpful AI.", prompt);
      const parsedJson = JSON.parse(content || '{}');
      const validated = InsightSummarySchema.safeParse(parsedJson);
      
      if (!validated.success) {
        throw new Error(`Invalid schema from AI: ${validated.error.message}`);
      }
      return validated.data;
    } catch (error) {
      return {
        summary: "Error analyzing signals.",
        riskFactors: [],
        opportunities: [],
        sentimentScore: 0
      };
    }
  }
}

