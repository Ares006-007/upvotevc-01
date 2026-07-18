'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/lib/types';

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
        <h1 className="display-lg">Market Signals</h1>
        <button className="button-primary">Refresh Feed</button>
      </div>
      
      {loading ? (
        <div className="body-md">Loading signals...</div>
      ) : (
        <div className="flex flex-col gap-md">
          {signals.map((signal) => (
            <div key={signal.id} className="feature-card flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <span className="badge-pill">{signal.source}</span>
                <span className="caption">{new Date(signal.createdAt).toLocaleDateString()}</span>
              </div>
              <h2 className="title-md">{signal.title}</h2>
              <p className="body-md">{signal.text}</p>
              <div className="flex gap-xs" style={{ marginTop: 'var(--spacing-xs)' }}>
                {signal.tags.map(tag => (
                  <span key={tag} className="caption" style={{ color: 'var(--color-muted)' }}>#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
