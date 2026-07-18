import { HackClubAiClient } from '../../../clients/hackclubAi';
import { SignalDTO, VentureOpportunityDTO, VentureOpportunitySchema } from '../../../dto/schemas';
import { logger } from '../../../utils/logger';

export class AgentOrchestrator {
  /**
   * Runs the multi-agent pipeline:
   * Scout -> Analyst -> (Market & Validation & Historian & Risk) -> Synthesizer
   */
  static async runResearchPipeline(signals: SignalDTO[]): Promise<VentureOpportunityDTO[]> {
    if (!signals.length) return [];

    logger.info(`Starting Multi-Agent Research Pipeline with ${signals.length} signals...`);
    const rawDataStr = JSON.stringify(signals.map(s => ({
      source: s.source,
      title: s.title,
      text: s.text,
      tags: s.tags
    })));

    try {
      // 1. Scout Agent
      logger.info('Agent 1/7: Scout running...');
      const scoutOutput = await HackClubAiClient.completion(
        "You are the Scout Agent. Your job is to read raw signals and extract the 1-2 most painful recurring themes and exact verbatim quotes that prove the pain. Output only the core themes and quotes.",
        `Analyze these signals:\n\n${rawDataStr}`
      );

      // 2. Analyst Agent
      logger.info('Agent 2/7: Analyst running...');
      const analystOutput = await HackClubAiClient.completion(
        "You are the Pattern Analyst Agent. Given the Scout's extracted pain points, you must cluster them and score the severity (1-10) based on emotional intensity and frequency. Output your analysis clearly.",
        `Scout's report:\n\n${scoutOutput}`
      );

      // 3-6. Parallel Agents (Market, Validation, Historian, Risk)
      logger.info('Agents 3-6/7: Parallel analysis running (Market, Validation, Historian, Risk)...');
      
      const [marketOutput, validationOutput, historianOutput, riskOutput] = await Promise.all([
        HackClubAiClient.completion(
          "You are the Market Analyst Agent. Estimate the target customer segment, urgency, and whether the issue is local or global based on the analyst's report.",
          `Analyst's report:\n\n${analystOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Validation Agent. Answer: Is this a real problem? Will they pay? Find willingness-to-pay clues.",
          `Analyst's report:\n\n${analystOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Failure Historian Agent. Brainstorm similar startups or tools that tried to solve this and failed. Explain why they likely failed.",
          `Analyst's report:\n\n${analystOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Risk Agent. Highlight legal, GTM, technical, or solo-founder risks associated with solving this pain point.",
          `Analyst's report:\n\n${analystOutput}`
        )
      ]);

      // 7. Synthesizer Agent
      logger.info('Agent 7/7: Synthesizer running...');
      const synthesizerPrompt = `
You are the Insight Synthesizer Agent. Your job is to combine the outputs of the previous 6 specialized AI agents into a SINGLE highly-structured JSON object matching exactly this schema:

{
  "painPointTitle": string,
  "sourceCluster": string,
  "severityScore": number (1-10),
  "confidenceScore": number (1-100),
  "evidenceQuotes": string[],
  "sourceUrls": string[],
  "rootCause": string,
  "realCustomer": string,
  "customerSegment": string,
  "willingnessToPay": string,
  "failedAttempts": string,
  "hiddenInsight": string,
  "whyNow": string,
  "soloFounderRisk": string,
  "marketType": string,
  "opportunityScore": number (1-100)
}

RULES:
- Never leave fields blank. If you lack evidence, write "Low confidence: [Reason]".
- Do not output Markdown formatting outside of the JSON payload.
- Return ONLY valid JSON.

Here is the input from the agents:
Scout: ${scoutOutput}
Analyst: ${analystOutput}
Market: ${marketOutput}
Validation: ${validationOutput}
Historian: ${historianOutput}
Risk: ${riskOutput}
      `;

      let synthResponse = await HackClubAiClient.completion("You are a rigorous data synthesis engine. Output JSON only.", synthesizerPrompt);
      
      // Clean potential markdown blocks
      if (synthResponse.startsWith('```json')) {
        synthResponse = synthResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(synthResponse);
      } catch (e) {
        logger.warn("Synthesizer returned invalid JSON. Attempting fallback.");
        throw new Error("Invalid JSON from Synthesizer");
      }

      const validated = VentureOpportunitySchema.safeParse(parsedData);
      
      if (!validated.success) {
        throw new Error(`Schema mismatch: ${validated.error.message}`);
      }

      // Generate the text format required by the user
      const finalObj = validated.data;
      const formattedText = `PAIN POINT — ${finalObj.sourceCluster}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${finalObj.painPointTitle}
Severity: ${finalObj.severityScore}/10
${finalObj.evidenceQuotes.map(q => `"${q}"`).join('\n')}
Source URLs: ${finalObj.sourceUrls.join(', ') || 'N/A'}

DEEP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Root Cause: ${finalObj.rootCause}
Real Customer: ${finalObj.realCustomer}
Will They Pay? ${finalObj.willingnessToPay}
What Failed Before: ${finalObj.failedAttempts}
Hidden Insight: ${finalObj.hiddenInsight}
Why Now: ${finalObj.whyNow}
Solo Founder Risk: ${finalObj.soloFounderRisk}`;

      finalObj.formattedText = formattedText;

      return [finalObj];

    } catch (err: any) {
      logger.error('Research pipeline failed', err);
      // Fallback object to satisfy schema
      return [{
        painPointTitle: "Failed to generate deep insights",
        sourceCluster: "Unknown",
        severityScore: 1,
        confidenceScore: 0,
        evidenceQuotes: ["No evidence parsed."],
        sourceUrls: [],
        rootCause: "Pipeline timeout or API failure.",
        realCustomer: "Unknown",
        customerSegment: "Unknown",
        willingnessToPay: "Unknown",
        failedAttempts: "Unknown",
        hiddenInsight: "None",
        whyNow: "Unknown",
        soloFounderRisk: "Unknown",
        marketType: "Unknown",
        opportunityScore: 0,
        formattedText: "Pipeline failed to generate the report. Please try again later."
      }];
    }
  }
}
