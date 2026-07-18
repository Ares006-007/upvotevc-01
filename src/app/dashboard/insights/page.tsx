'use client';

import { useEffect, useState } from 'react';
import { InsightSummary } from '@/lib/types';

export default function InsightsPage() {
  const [insight, setInsight] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function generateInsights() {
    setGenerating(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signals: [] }) // mock payload
      });
      const data = await res.json();
      setInsight(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    generateInsights();
  }, []);

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex items-center justify-between">
        <h1 className="display-lg">AI Insights</h1>
        <button 
          className="button-primary" 
          onClick={generateInsights} 
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Regenerate Analysis'}
        </button>
      </div>

      {loading || generating ? (
        <div className="body-md">Analyzing signals with Hack Club AI...</div>
      ) : insight ? (
        <div className="flex flex-col gap-lg">
          <div className="feature-card" style={{ borderTop: '4px solid var(--color-ink)' }}>
            <h2 className="title-md" style={{ marginBottom: 'var(--spacing-sm)' }}>Executive Summary</h2>
            <p className="display-sm" style={{ color: 'var(--color-ink)' }}>{insight.summary}</p>
          </div>
          
          <div className="flex gap-lg" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="feature-card flex flex-col gap-sm">
              <h3 className="title-md" style={{ color: 'var(--color-semantic-success)' }}>Opportunities</h3>
              <ul className="flex flex-col gap-xs" style={{ paddingLeft: 'var(--spacing-md)' }}>
                {insight.opportunities.map((opp, i) => (
                  <li key={i} className="body-md" style={{ listStyleType: 'disc' }}>{opp}</li>
                ))}
              </ul>
            </div>

            <div className="feature-card flex flex-col gap-sm">
              <h3 className="title-md" style={{ color: 'var(--color-semantic-error)' }}>Risk Factors</h3>
              <ul className="flex flex-col gap-xs" style={{ paddingLeft: 'var(--spacing-md)' }}>
                {insight.riskFactors.map((risk, i) => (
                  <li key={i} className="body-md" style={{ listStyleType: 'disc' }}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="feature-card flex items-center justify-between">
            <span className="title-md">Overall Sentiment Score</span>
            <span className="display-md" style={{ color: insight.sentimentScore > 0 ? 'var(--color-semantic-success)' : 'var(--color-semantic-error)' }}>
              {insight.sentimentScore > 0 ? '+' : ''}{insight.sentimentScore}
            </span>
          </div>
        </div>
      ) : (
        <div className="body-md text-muted">No insights generated yet.</div>
      )}
    </div>
  );
}
