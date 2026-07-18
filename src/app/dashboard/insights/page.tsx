'use client';

import { useState } from 'react';
import { VentureOpportunityDTO } from '@/dto/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Radar, ChevronDown, ChevronUp, Users, FileWarning } from 'lucide-react';

export default function InsightsPage() {
  const [opportunities, setOpportunities] = useState<VentureOpportunityDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'autofind' | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function fetchInsights(runMode: 'search' | 'autofind') {
    setLoading(true);
    setMode(runMode);
    setErrorMsg('');
    setOpportunities([]);
    setExpandedId(null);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: runMode, query: runMode === 'search' ? query : undefined })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      
      if (Array.isArray(data) && data.length > 0) {
        // Filter out completely failed ones if they just say 'Failed to generate deep insights'
        // unless that's all we have.
        const valid = data.filter(d => d.opportunityScore > 0 || d.severityScore > 1);
        setOpportunities(valid.length > 0 ? valid : data);
      } else {
        setOpportunities([]);
        setErrorMsg('No opportunities found for this criteria.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Source unavailable or pipeline failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-md" style={{ borderBottom: '1px solid var(--color-hairline)', paddingBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 className="display-lg">Discover venture-scale problems from live community signals</h1>
          <p className="body-md text-muted mt-sm">Search for specific markets, or let the AI automatically find emerging pain points.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-sm mt-md">
          <div className="flex-1" style={{ position: 'relative' }}>
            <Search size={20} className="text-muted" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="e.g. 'student housing india', 'r/bangalore traffic'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && fetchInsights('search')}
              style={{
                width: '100%', padding: 'var(--spacing-md) var(--spacing-xl) var(--spacing-md) 48px',
                borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline-strong)',
                backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)'
              }}
              className="body-md"
            />
          </div>
          <button 
            className="button-primary flex items-center justify-center gap-sm whitespace-nowrap"
            onClick={() => fetchInsights('search')}
            disabled={loading || !query}
          >
            <Search size={18} /> Search Research
          </button>
          <button 
            className="flex items-center justify-center gap-sm whitespace-nowrap"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--rounded-md)',
              backgroundColor: 'var(--color-surface-strong)', color: 'var(--color-ink)',
              border: '1px solid var(--color-hairline-strong)', fontWeight: 500
            }}
            onClick={() => fetchInsights('autofind')}
            disabled={loading}
          >
            <Radar size={18} /> Auto Find Opportunities
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-lg items-center justify-center py-xxl text-center">
          <div className="orb-bg orb-lavender" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', opacity: 0.5 }}></div>
          <div className="title-md mt-md">
            {mode === 'search' ? `Researching "${query}"...` : 'Scanning live community signals...'}
          </div>
          <p className="body-sm text-muted">Running 7-Agent Research Pipeline (Scout → Analyst → Market → Validation → Historian → Risk → Synthesizer)</p>
        </div>
      ) : errorMsg ? (
        <div className="p-xl bg-canvas-soft text-center body-md text-muted" style={{ borderRadius: 'var(--rounded-lg)', border: '1px dashed var(--color-hairline-strong)' }}>
          <FileWarning size={24} className="mx-auto mb-sm" />
          {errorMsg}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="flex flex-col gap-md">
          {opportunities.map((opp, idx) => {
            const isExpanded = expandedId === idx;
            return (
              <div key={idx} className="feature-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-hairline-soft)' }}>
                {/* Collapsed Header Area */}
                <div 
                  className="p-lg cursor-pointer hover:bg-canvas-soft transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex-1 flex flex-col gap-xs">
                      <div className="flex items-center gap-sm">
                        <Badge variant="outline">{opp.sourceCluster}</Badge>
                        <Badge variant={opp.severityScore >= 8 ? 'error' : opp.severityScore >= 5 ? 'default' : 'success'}>
                          Severity: {opp.severityScore}/10
                        </Badge>
                        <Badge variant="outline" style={{ borderStyle: 'dashed' }}>
                          Confidence: {opp.confidenceScore}%
                        </Badge>
                      </div>
                      <h2 className="title-md mt-xs">{opp.painPointTitle}</h2>
                      
                      {opp.evidenceQuotes?.[0] && (
                        <p className="body-sm text-body italic mt-xs" style={{ borderLeft: '2px solid var(--color-hairline-strong)', paddingLeft: 'var(--spacing-sm)' }}>
                          "{opp.evidenceQuotes[0]}"
                        </p>
                      )}
                      
                      {opp.sourceUrls?.[0] && (
                        <a href={opp.sourceUrls[0]} target="_blank" rel="noreferrer" className="caption text-muted hover:underline mt-xs inline-block" onClick={e => e.stopPropagation()}>
                          View Source ↗
                        </a>
                      )}
                    </div>
                    <div className="text-muted p-sm rounded-full bg-surface-strong">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Deep Analysis Area */}
                {isExpanded && (
                  <div className="p-lg bg-surface-strong" style={{ borderTop: '1px solid var(--color-hairline)' }}>
                    <div className="grid md:grid-cols-2 gap-xl">
                      <div className="flex flex-col gap-sm">
                        <h3 className="title-sm flex items-center gap-xs"><Users size={16} /> Market & Customer</h3>
                        <div className="flex flex-col gap-xs body-sm">
                          <p><span className="font-semibold">Root Cause:</span> {opp.rootCause}</p>
                          <p><span className="font-semibold">Real Customer:</span> {opp.realCustomer}</p>
                          <p><span className="font-semibold">Segment:</span> {opp.customerSegment}</p>
                          <p><span className="font-semibold">Will They Pay:</span> {opp.willingnessToPay}</p>
                          <p><span className="font-semibold">Why Now:</span> {opp.whyNow}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-sm">
                        <h3 className="title-sm flex items-center gap-xs"><FileWarning size={16} /> Risks & History</h3>
                        <div className="flex flex-col gap-xs body-sm">
                          <p><span className="font-semibold">Failed Attempts:</span> {opp.failedAttempts}</p>
                          <p><span className="font-semibold">Solo Founder Risk:</span> {opp.soloFounderRisk}</p>
                          <p><span className="font-semibold">Hidden Insight:</span> {opp.hiddenInsight}</p>
                        </div>
                      </div>
                    </div>
                    
                    {opp.evidenceQuotes.length > 1 && (
                      <div className="mt-md pt-md" style={{ borderTop: '1px solid var(--color-hairline-soft)' }}>
                        <h3 className="caption-uppercase text-muted mb-sm">Additional Evidence</h3>
                        <ul className="flex flex-col gap-xs body-sm">
                          {opp.evidenceQuotes.slice(1).map((quote, i) => (
                            <li key={i} className="text-body italic">"{quote}"</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
