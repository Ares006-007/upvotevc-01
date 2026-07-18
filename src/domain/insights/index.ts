import { HackClubAiClient } from '../../clients/hackclubAi';
import { SignalDTO, InsightSummaryDTO } from '../../dto/schemas';
import { logger } from '../../utils/logger';

export class InsightService {
  /**
   * Orchestrates generating an AI summary from a batch of signals.
   */
  static async generateInsightFromSignals(signals: SignalDTO[]): Promise<InsightSummaryDTO> {
    logger.info(`Generating insight for ${signals.length} signals...`);
    
    if (signals.length === 0) {
      return {
        summary: "No signals provided for analysis.",
        riskFactors: [],
        opportunities: [],
        sentimentScore: 0
      };
    }

    // Call the external LLM wrapper
    const insight = await HackClubAiClient.generateInsight(signals);
    
    // Additional domain logic could go here (e.g. saving to a database)
    logger.info('Insight generation completed successfully.');
    
    return insight;
  }
}
