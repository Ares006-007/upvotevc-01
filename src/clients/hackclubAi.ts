import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { SignalDTO, InsightSummaryDTO, InsightSummarySchema } from '../dto/schemas';

export class HackClubAiClient {
  static async generateInsight(signals: SignalDTO[]): Promise<InsightSummaryDTO> {
    try {
      // Placeholder for Hack Club AI / LLM endpoint
      const url = `https://api.hackclub.example.com/v1/chat/completions`;
      
      const prompt = `Analyze the following market signals and provide a JSON response with keys: 'summary' (string), 'riskFactors' (array of strings), 'opportunities' (array of strings), and 'sentimentScore' (number from -1.0 to 1.0). Signals: ${JSON.stringify(signals)}`;

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.HACK_CLUB_AI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4', // placeholder
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`HackClub AI error: ${response.status}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      
      let parsedJson;
      try {
        parsedJson = JSON.parse(content || '{}');
      } catch (e) {
        throw new Error('Failed to parse JSON from AI response');
      }

      const validated = InsightSummarySchema.safeParse(parsedJson);
      
      if (!validated.success) {
        throw new Error(`Invalid schema from AI: ${validated.error.message}`);
      }

      return validated.data;
    } catch (error) {
      logger.error('Failed to generate insights via Hack Club AI', error);
      // Fallback response so the app doesn't crash
      return {
        summary: "Error analyzing signals.",
        riskFactors: [],
        opportunities: [],
        sentimentScore: 0
      };
    }
  }
}
