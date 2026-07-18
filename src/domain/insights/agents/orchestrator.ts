import { HackClubAiClient } from '../../../clients/hackclubAi';
import { SignalDTO, VentureOpportunityDTO, VentureOpportunitySchema } from '../../../dto/schemas';
import { logger } from '../../../utils/logger';

export class AgentOrchestrator {
  /**
   * Runs the multi-agent pipeline:
   * Thread Reader -> Emotion & Impact -> Pain Point -> 
   * (Market Research & Opportunity/Pitch & Market Reach & Risk) -> Synthesizer
   */
  static async runResearchPipeline(signals: SignalDTO[]): Promise<VentureOpportunityDTO[]> {
    if (!signals.length) return [];

    logger.info(`Starting 8-Agent Research Pipeline with ${signals.length} signals...`);
    const rawDataStr = JSON.stringify(signals.map(s => ({
      source: s.source,
      title: s.title,
      text: s.text,
      tags: s.tags,
      url: s.url
    })));

    try {
      // 1. Thread Reader Agent
      logger.info('Agent 1/8: Thread Reader running...');
      const threadReaderOutput = await HackClubAiClient.completion(
        "You are the Thread Reader Agent. Read the provided Reddit post/comments or news signals. Identify the main complaint, who is affected, the context, and extract notable exact quotes.",
        `Analyze these signals:\n\n${rawDataStr}`
      );

      // 2. Emotion & Impact Agent
      logger.info('Agent 2/8: Emotion & Impact running...');
      const emotionOutput = await HackClubAiClient.completion(
        "You are the Emotion & Impact Agent. Based on the Thread Reader's report, detect emotion type, emotion intensity, urgency, and whether the pain is personal, recurring, or broad. Judge if it is costly in time, money, stress, or status.",
        `Thread Reader's report:\n\n${threadReaderOutput}`
      );

      // 3. Pain Point Agent
      logger.info('Agent 3/8: Pain Point running...');
      const painPointOutput = await HackClubAiClient.completion(
        "You are the Pain Point Agent. Convert the previous reports into a core pain statement, problem category, and a severity score (1-10). Provide an evidence-backed explanation.",
        `Thread Reader's report:\n\n${threadReaderOutput}\n\nEmotion & Impact report:\n\n${emotionOutput}`
      );

      // 4-7. Parallel Agents (Market Research, Pitch, Reach, Risk)
      logger.info('Agents 4-7/8: Parallel analysis running...');
      
      const [marketOutput, pitchOutput, reachOutput, riskOutput] = await Promise.all([
        HackClubAiClient.completion(
          "You are the Market Research Agent. Expand the signal into market context, comparable solutions, possible substitutes, broader demand pattern, and relevant market observations.",
          `Pain Point report:\n\n${painPointOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Opportunity / Pitch Agent. Frame the output like a startup or VC brief: problem, customer, solution direction, wedge, monetization logic, and why now.",
          `Pain Point report:\n\n${painPointOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Market Reach & Monetization Agent. Estimate who the real customer is, how many people may face the problem, local vs broad reach, willingness to pay, and what kind of startup this could become.",
          `Pain Point report:\n\n${painPointOutput}`
        ),
        HackClubAiClient.completion(
          "You are the Risk Agent. Analyze founder risk, execution risk, regulatory risk, data risk, and whether the opportunity is too weak or too speculative.",
          `Pain Point report:\n\n${painPointOutput}`
        )
      ]);

      // 8. Synthesizer Agent
      logger.info('Agent 8/8: Synthesizer running...');
      const synthesizerPrompt = `
You are the Insight Synthesizer Agent. Your job is to combine the outputs of the 7 previous specialized AI agents into a SINGLE highly-structured JSON object matching exactly this schema:

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
- Never leave fields blank. If you lack evidence, infer intelligently or write "Low confidence: [Reason]".
- Extract the best quote from the Thread Reader.
- Integrate the Pitch Agent's wedge/monetization logic into 'hiddenInsight' and 'rootCause'.
- Integrate the Reach Agent's sizing into 'customerSegment'.
- Do not output Markdown formatting outside of the JSON payload.
- Return ONLY valid JSON.

Here is the input from the agents:
Thread Reader: ${threadReaderOutput}
Emotion/Impact: ${emotionOutput}
Pain Point: ${painPointOutput}
Market Research: ${marketOutput}
Pitch/Opportunity: ${pitchOutput}
Market Reach: ${reachOutput}
Risk: ${riskOutput}
      `;

      let synthResponse = await HackClubAiClient.completion("You are a rigorous data synthesis engine. Output JSON only.", synthesizerPrompt);
      
      // Clean potential markdown blocks
      if (synthResponse.startsWith('```json')) {
        synthResponse = synthResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (synthResponse.startsWith('```')) {
        synthResponse = synthResponse.replace(/```/g, '').trim();
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

      // Generate the exact text format required by the user
      const finalObj = validated.data;
      
      // Ensure sourceUrls contains the real URLs from the original signals if missing
      const realUrls = signals.map(s => s.url).filter(Boolean) as string[];
      if (finalObj.sourceUrls.length === 0 && realUrls.length > 0) {
        finalObj.sourceUrls = realUrls;
      }

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
      // Fallback object to satisfy schema gracefully
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
        hiddenInsight: "Unknown",
        whyNow: "Unknown",
        soloFounderRisk: "Unknown",
        marketType: "Unknown",
        opportunityScore: 0,
        formattedText: "Pipeline failed to generate the report. Please try again later."
      }];
    }
  }
}
