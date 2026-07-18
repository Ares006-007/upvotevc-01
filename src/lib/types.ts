export type SignalSource = 'reddit' | 'news' | 'market';
export type AssetType = 'stock' | 'forex' | 'startup' | 'sector' | 'macro';

export interface Signal {
  id: string;
  source: SignalSource;
  assetType: AssetType;
  symbol?: string;
  companyName?: string;
  subreddit?: string;
  title?: string;
  text?: string;
  url?: string;
  raw: unknown;
  sentiment?: number;
  tags: string[];
  createdAt: string;
  ingestedAt: string;
}

export interface InsightSummary {
  summary: string;
  riskFactors: string[];
  opportunities: string[];
  sentimentScore: number;
}
