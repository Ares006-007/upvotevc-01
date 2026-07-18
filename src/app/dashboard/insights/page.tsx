'use client';

import { useEffect, useState } from 'react';
import { VentureOpportunityDTO } from '@/dto/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Brain, AlertTriangle, Lightbulb, Users, FileWarning } from 'lucide-react';

export default function InsightsPage() {
  const [opportunities, setOpportunities] = useState<VentureOpportunityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function generateInsights() {
    setGenerating(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signals: [] }) // Handled internally
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOpportunities(data);
      } else {
        setOpportunities([]);
      }
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
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-hairline)', paddingBottom: 'var(--spacing-md)' }}>
        <div>
          <h1 className="display-lg">Venture Research Report</h1>
          <p className="body-md text-muted mt-sm">AI multi-agent synthesis from live market signals.</p>
        </div>
        <button 
          className="button-primary flex items-center gap-sm" 
          onClick={generateInsights} 
          disabled={generating}
        >
          <Brain size={18} />
          {generating ? 'Synthesizing Pipeline...' : 'Run Pipeline'}
        </button>
      </div>

      {loading || generating ? (
        <div className="flex flex-col gap-lg items-center justify-center py-xxl text-center">
          <div className="orb-bg orb-lavender" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', opacity: 0.5 }}></div>
          <div className="title-md mt-md">Running 7-Agent Research Pipeline...</div>
          <p className="body-sm text-muted">Scout → Analyst → Market → Validation → Historian → Risk → Synthesizer</p>
        </div>
      ) : opportunities.length > 0 ? (
        <div className="flex flex-col gap-xxl">
          {opportunities.map((opp, idx) => (
            <div key={idx} className="flex flex-col gap-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" style={{ marginBottom: 'var(--spacing-xs)', display: 'inline-block' }}>{opp.sourceCluster}</Badge>
                  <h2 className="display-md" style={{ color: 'var(--color-ink)' }}>{opp.painPointTitle}</h2>
                </div>
                <div className="flex gap-sm">
                  <div className="flex flex-col items-end">
                    <span className="caption-uppercase text-muted">Severity</span>
                    <span className="title-md" style={{ color: opp.severityScore >= 8 ? 'var(--color-semantic-error)' : 'var(--color-ink)' }}>{opp.severityScore}/10</span>
                  </div>
                  <div className="flex flex-col items-end ml-md">
                    <span className="caption-uppercase text-muted">Confidence</span>
                    <span className="title-md">{opp.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="flex flex-col gap-md">
                  <Card style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)' }}>
                    <CardHeader>
                      <CardTitle className="text-body-strong flex items-center gap-sm"><Users size={18} /> Market & Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-sm">
                      <div><span className="body-strong">Real Customer:</span> {opp.realCustomer}</div>
                      <div><span className="body-strong">Segment:</span> {opp.customerSegment}</div>
                      <div><span className="body-strong">Root Cause:</span> {opp.rootCause}</div>
                      <div><span className="body-strong">Will They Pay:</span> {opp.willingnessToPay}</div>
                      <div><span className="body-strong">Why Now:</span> {opp.whyNow}</div>
                    </CardContent>
                  </Card>

                  <Card style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-hairline)' }}>
                    <CardHeader>
                      <CardTitle className="text-body-strong flex items-center gap-sm"><FileWarning size={18} /> Risks & History</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-sm">
                      <div><span className="body-strong">Failed Attempts:</span> {opp.failedAttempts}</div>
                      <div><span className="body-strong">Solo Founder Risk:</span> {opp.soloFounderRisk}</div>
                      <div><span className="body-strong">Hidden Insight:</span> {opp.hiddenInsight}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-col gap-md">
                  <Card style={{ backgroundColor: 'var(--color-surface-strong)', height: '100%' }}>
                    <CardHeader>
                      <CardTitle className="text-body-strong">Evidence & Quotes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="flex flex-col gap-md">
                        {opp.evidenceQuotes.map((quote, i) => (
                          <li key={i} className="body-sm text-body italic pl-sm" style={{ borderLeft: '3px solid var(--color-hairline-strong)' }}>
                            "{quote}"
                          </li>
                        ))}
                      </ul>
                      {opp.sourceUrls.length > 0 && (
                        <div className="mt-md pt-sm" style={{ borderTop: '1px solid var(--color-hairline)' }}>
                          <span className="caption-uppercase text-muted">Sources: </span>
                          {opp.sourceUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="caption ml-xs hover:underline">Link {i+1}</a>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {opp.formattedText && (
                <div className="p-md" style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-surface)', borderRadius: 'var(--rounded-lg)', overflowX: 'auto' }}>
                  <pre className="body-sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                    {opp.formattedText}
                  </pre>
                </div>
              )}
              
            </div>
          ))}
        </div>
      ) : (
        <div className="p-xl bg-canvas-soft text-center body-md text-muted" style={{ borderRadius: 'var(--rounded-lg)', border: '1px dashed var(--color-hairline-strong)' }}>
          Failed to load insights. Please try regenerating.
        </div>
      )}
    </div>
  );
}
