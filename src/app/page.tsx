import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-canvas">
      {/* Atmospheric Gradient Orbs */}
      <div className="orb-bg orb-mint" style={{ top: '-100px', left: '-100px' }}></div>
      <div className="orb-bg orb-peach" style={{ bottom: '-100px', right: '-100px' }}></div>

      <nav className="flex items-center justify-between relative z-10" style={{ height: '64px', padding: '0 var(--spacing-xl)' }}>
        <div className="title-md">Upvote VC</div>
        <div>
          <Link href="/dashboard/signals" className="button-outline">Sign In</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center section relative z-10" style={{ padding: '96px var(--spacing-xl)' }}>
        <h1 className="display-mega" style={{ maxWidth: '800px', marginBottom: 'var(--spacing-md)' }}>
          Investor intelligence, beautifully distilled.
        </h1>
        <p className="body-md" style={{ maxWidth: '600px', marginBottom: 'var(--spacing-xl)' }}>
          Track signals across Reddit, news, and markets. Leverage Hack Club AI to generate structured insights from public opinion and market activity.
        </p>
        <div className="flex items-center gap-sm">
          <Link href="/dashboard/signals" className="button-primary">Enter Dashboard</Link>
          <a href="#" className="button-outline">Read the Docs</a>
        </div>
      </main>

      <footer className="bg-canvas relative z-10" style={{ padding: '64px 48px', borderTop: '1px solid var(--color-hairline)' }}>
        <div className="container flex justify-between">
          <div className="body-sm text-muted">© 2024 Upvote VC. All rights reserved.</div>
          <div className="flex gap-lg">
            <a href="#" className="body-sm text-muted">Privacy</a>
            <a href="#" className="body-sm text-muted">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
