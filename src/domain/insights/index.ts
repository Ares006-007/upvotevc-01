import { AgentOrchestrator } from './agents/orchestrator';
import { SignalDTO, VentureOpportunityDTO } from '../../dto/schemas';
import { logger } from '../../utils/logger';

export class InsightService {
  /**
   * Orchestrates generating AI opportunity reports from a batch of signals via the Multi-Agent engine.
   */
  static async generateInsightFromSignals(signals: SignalDTO[]): Promise<VentureOpportunityDTO[]> {
    logger.info(`Routing ${signals.length} signals to the Multi-Agent Research Pipeline...`);
    
    if (signals.length === 0) {
      return [];
    }

    const opportunities = await AgentOrchestrator.runResearchPipeline(signals);
    
    logger.info('Insight generation completed successfully.');
    
    return opportunities;
  }
}
