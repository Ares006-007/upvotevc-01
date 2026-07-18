'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardOverview() {
  const [health, setHealth] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, signalsRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/signals')
        ]);
        const healthData = await healthRes.json();
        const signalsData = await signalsRes.json();
        setHealth(healthData);
        setSignals(signalsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSourceMix = () => {
    const counts = signals.reduce((acc: any, curr) => {
      acc[curr.source] = (acc[curr.source] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key]
    }));
  };

  const COLORS = ['#a7e5d3', '#f4c5a8', '#c8b8e0', '#a8c8e8'];

  if (loading) {
    return <div className="body-md p-xl">Loading overview...</div>;
  }

  return (
    <div className="flex flex-col gap-xl">
      <div>
        <h1 className="display-lg" style={{ marginBottom: 'var(--spacing-xs)' }}>Overview</h1>
        <p className="body-md text-muted">A summary of active integrations and recent signal activity.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Activity size={20} />
              Provider Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            {health?.integrations && Object.entries(health.integrations).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between" style={{ paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-hairline)' }}>
                <span className="body-strong capitalize">{key}</span>
                {value.status === 'ok' ? (
                  <Badge variant="success">Operational</Badge>
                ) : value.status === 'limited' ? (
                  <Badge variant="outline" style={{ color: 'var(--color-muted)' }}>{value.reason || 'Limited'}</Badge>
                ) : (
                  <Badge variant="error">Down</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Radio size={20} />
              Signal Distribution
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: '200px' }}>
            {signals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSourceMix()}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getSourceMix().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-on-dark)', borderRadius: 'var(--rounded-md)', border: 'none' }}
                    itemStyle={{ color: 'var(--color-on-dark)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted body-sm">
                No signals captured yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="title-md" style={{ marginBottom: 'var(--spacing-md)' }}>Recent Activity</h2>
        {signals.length > 0 ? (
          <div className="flex flex-col gap-sm">
            {signals.slice(0, 3).map((sig, i) => (
              <div key={i} className="flex flex-col gap-xs p-md bg-canvas-soft" style={{ borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline-soft)' }}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{sig.source}</Badge>
                  <span className="caption text-muted-soft">{new Date(sig.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="body-strong">{sig.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-xl bg-canvas-soft text-center body-md text-muted" style={{ borderRadius: 'var(--rounded-lg)', border: '1px dashed var(--color-hairline-strong)' }}>
            <AlertTriangle size={24} className="mx-auto" style={{ marginBottom: 'var(--spacing-sm)' }} />
            The ingestion engine hasn't pulled data yet.
          </div>
        )}
      </div>
    </div>
  );
}
