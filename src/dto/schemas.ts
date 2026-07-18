import { z } from 'zod';

export const SignalSourceSchema = z.enum(['reddit', 'news', 'market']);
export const AssetTypeSchema = z.enum(['stock', 'forex', 'startup', 'sector', 'macro']);

export const SignalSchema = z.object({
  id: z.string(),
  source: SignalSourceSchema,
  assetType: AssetTypeSchema,
  symbol: z.string().optional(),
  companyName: z.string().optional(),
  subreddit: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
  raw: z.unknown().optional(),
  sentiment: z.number().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  ingestedAt: z.string(),
});

export const InsightSummarySchema = z.object({
  summary: z.string(),
  riskFactors: z.array(z.string()),
  opportunities: z.array(z.string()),
  sentimentScore: z.number(),
});

export type SignalDTO = z.infer<typeof SignalSchema>;
export type InsightSummaryDTO = z.infer<typeof InsightSummarySchema>;
