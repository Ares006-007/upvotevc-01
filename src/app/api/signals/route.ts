import { NextResponse } from 'next/server';
import { Signal } from '@/lib/types';

export async function GET() {
  const mockSignals: Signal[] = [
    {
      id: 'sig-1',
      source: 'reddit',
      assetType: 'stock',
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      subreddit: 'wallstreetbets',
      title: 'AAPL launching new AI feature',
      text: 'Huge sentiment on Apple’s recent AI announcement.',
      url: 'https://reddit.com/r/wallstreetbets/example1',
      raw: {},
      sentiment: 0.8,
      tags: ['AI', 'Tech', 'Bullish'],
      createdAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
    },
    {
      id: 'sig-2',
      source: 'news',
      assetType: 'macro',
      title: 'Fed signals rate cuts could be delayed',
      text: 'Inflation data came in hotter than expected, causing markets to pull back.',
      url: 'https://newsapi.org/example',
      raw: {},
      sentiment: -0.6,
      tags: ['Macro', 'Rates', 'Inflation'],
      createdAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
    },
    {
      id: 'sig-3',
      source: 'market',
      assetType: 'startup',
      companyName: 'Hack Club AI',
      title: 'New funding round closed',
      text: 'Massive adoption leading to a successful Series A.',
      raw: {},
      sentiment: 0.9,
      tags: ['Venture', 'AI', 'Growth'],
      createdAt: new Date().toISOString(),
      ingestedAt: new Date().toISOString(),
    }
  ];

  return NextResponse.json(mockSignals);
}
