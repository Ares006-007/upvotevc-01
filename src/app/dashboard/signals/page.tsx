'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Hash } from 'lucide-react';

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const res = await fetch('/api/signals');
        const data = await res.json();
        setSignals(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg">Signal Explorer</h1>
          <p className="body-md text-muted mt-sm">Raw data streams from Reddit, News, and Market indicators.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col gap-md">
          {[1, 2, 3].map(i => (
            <div key={i} className="feature-card animate-pulse" style={{ height: '140px', backgroundColor: 'var(--color-surface-strong)' }}></div>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="p-xl bg-canvas-soft text-center body-md text-muted" style={{ borderRadius: 'var(--rounded-lg)', border: '1px dashed var(--color-hairline-strong)' }}>
          No signals found in the database.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {signals.map((signal) => (
            <div key={signal.id} className="feature-card flex flex-col justify-between" style={{ border: '1px solid var(--color-hairline-soft)' }}>
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Badge variant="outline">{signal.source}</Badge>
                  <span className="caption-uppercase text-muted-soft">{new Date(signal.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="title-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>{signal.title}</h2>
                <p className="body-sm text-body" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {signal.text}
                </p>
              </div>
              
              <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-hairline)' }}>
                <div className="flex gap-xs overflow-hidden">
                  {signal.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="flex items-center caption text-muted">
                      <Hash size={12} style={{ marginRight: '2px' }} />
                      {tag}
                    </span>
                  ))}
                  {signal.tags.length > 2 && <span className="caption text-muted-soft">+{signal.tags.length - 2}</span>}
                </div>
                {signal.url && (
                  <a href={signal.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink transition-colors">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
