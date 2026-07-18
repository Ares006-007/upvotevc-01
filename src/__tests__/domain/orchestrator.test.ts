import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentOrchestrator } from '../../domain/insights/agents/orchestrator';
import { HackClubAiClient } from '../../clients/hackclubAi';
import { SignalDTO } from '../../dto/schemas';

// Mock the AI client
vi.mock('../../clients/hackclubAi', () => {
  return {
    HackClubAiClient: {
      completion: vi.fn(),
    },
  };
});

describe('AgentOrchestrator', () => {
  const mockSignals: SignalDTO[] = [
    {
      id: '1',
      source: 'reddit',
      assetType: 'startup',
      tags: ['pain-point'],
      createdAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
      title: 'Dev tooling is broken',
      text: 'I can never find a good AI tool that actually works seamlessly.'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if no signals are provided', async () => {
    const result = await AgentOrchestrator.runResearchPipeline([]);
    expect(result).toEqual([]);
    expect(HackClubAiClient.completion).not.toHaveBeenCalled();
  });

  it('should successfully parse a valid full AI response and map to VentureOpportunityDTO', async () => {
    const mockValidJson = JSON.stringify({
      painPointTitle: 'AI Tooling Fragmentation',
      sourceCluster: 'r/startups',
      severityScore: 8,
      confidenceScore: 90,
      evidenceQuotes: ['I can never find a good AI tool'],
      sourceUrls: ['https://reddit.com/123'],
      rootCause: 'Too many disconnected tools',
      realCustomer: 'Software Developers',
      customerSegment: 'B2B SMBs',
      willingnessToPay: 'High',
      failedAttempts: 'Tool XYZ',
      hiddenInsight: 'Developers want unified IDE integration',
      whyNow: 'AI models are fast enough',
      soloFounderRisk: 'High execution risk',
      marketType: 'Tools',
      opportunityScore: 85
    });

    vi.mocked(HackClubAiClient.completion)
      .mockResolvedValueOnce('Thread Reader output')
      .mockResolvedValueOnce('Emotion output')
      .mockResolvedValueOnce('Pain Point output')
      .mockResolvedValueOnce('Market Research output')
      .mockResolvedValueOnce('Pitch output')
      .mockResolvedValueOnce('Reach output')
      .mockResolvedValueOnce('Risk output')
      .mockResolvedValueOnce(`\`\`\`json\n${mockValidJson}\n\`\`\``); // Synthesizer output with markdown

    const result = await AgentOrchestrator.runResearchPipeline(mockSignals);
    
    expect(result).toHaveLength(1);
    expect(result[0].painPointTitle).toBe('AI Tooling Fragmentation');
    expect(result[0].severityScore).toBe(8);
    // Formatted text should be generated
    expect(result[0].formattedText).toContain('PAIN POINT — r/startups');
    expect(result[0].formattedText).toContain('AI Tooling Fragmentation');
    expect(result[0].formattedText).toContain('Severity: 8/10');
  });

  it('should trigger fallback behavior when Synthesizer returns invalid JSON', async () => {
    vi.mocked(HackClubAiClient.completion)
      .mockResolvedValueOnce('Thread output')
      .mockResolvedValueOnce('Emotion output')
      .mockResolvedValueOnce('Pain output')
      .mockResolvedValueOnce('Market output')
      .mockResolvedValueOnce('Pitch output')
      .mockResolvedValueOnce('Reach output')
      .mockResolvedValueOnce('Risk output')
      .mockResolvedValueOnce('I am sorry, as an AI I cannot do that.'); // Invalid JSON

    const result = await AgentOrchestrator.runResearchPipeline(mockSignals);
    
    expect(result).toHaveLength(1);
    expect(result[0].painPointTitle).toBe('Failed to generate deep insights');
    expect(result[0].opportunityScore).toBe(0);
    expect(result[0].severityScore).toBe(1);
  });

  it('should trigger fallback behavior when API call fails', async () => {
    vi.mocked(HackClubAiClient.completion).mockRejectedValueOnce(new Error('Network error'));

    const result = await AgentOrchestrator.runResearchPipeline(mockSignals);
    
    expect(result).toHaveLength(1);
    expect(result[0].painPointTitle).toBe('Failed to generate deep insights');
    expect(result[0].opportunityScore).toBe(0);
  });
});
