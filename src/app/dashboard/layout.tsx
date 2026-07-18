import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <nav className="flex items-center justify-between" style={{ height: '64px', padding: '0 var(--spacing-xl)', borderBottom: '1px solid var(--color-hairline)' }}>
        <div className="flex items-center gap-md">
          <Link href="/" className="title-md">Upvote VC</Link>
          <div className="flex items-center gap-sm" style={{ marginLeft: 'var(--spacing-xl)' }}>
            <Link href="/dashboard/signals" className="body-md" style={{ fontWeight: 500 }}>Signals</Link>
            <Link href="/dashboard/insights" className="body-md" style={{ fontWeight: 500 }}>Insights</Link>
          </div>
        </div>
        <div>
          <button className="button-outline">Account</button>
        </div>
      </nav>
      <main className="flex-1 container section">
        {children}
      </main>
    </div>
  );
}
