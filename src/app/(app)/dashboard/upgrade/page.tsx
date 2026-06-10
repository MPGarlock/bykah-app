'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UpgradePage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send plan name to server — price IDs are resolved from env vars server-side
  const plan = billing === 'monthly' ? 'pro_monthly' : 'pro_annual';
  const proPrice = billing === 'monthly' ? '$9' : '$87';
  const ultimatePrice = billing === 'monthly' ? '$15' : '$144';
  const period = billing === 'monthly' ? '/mo' : '/yr';
  const proSavings = billing === 'annual' ? 'Save $21/yr' : '';
  const ultimateSavings = billing === 'annual' ? 'Save $36/yr' : '';

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#0A1628', minHeight: '100vh', padding: '3rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ color: '#C9973A', fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>Choose Your Plan</h1>
        <p style={{ color: '#CBD5E8', textAlign: 'center', marginBottom: '2rem' }}>Unlock the full BYKAH experience with Pro</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <button onClick={() => setBilling('monthly')} style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: '1px solid #C9973A', backgroundColor: billing === 'monthly' ? '#C9973A' : 'transparent', color: billing === 'monthly' ? '#0A1628' : '#C9973A', fontWeight: 600, cursor: 'pointer' }}>Monthly</button>
          <button onClick={() => setBilling('annual')} style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: '1px solid #C9973A', backgroundColor: billing === 'annual' ? '#C9973A' : 'transparent', color: billing === 'annual' ? '#0A1628' : '#C9973A', fontWeight: 600, cursor: 'pointer' }}>Annual - Save more</button>
        </div>
        {error && (
          <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', backgroundColor: '#1a0a0a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ef4444' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f1e38', border: '1px solid #2a3a5c', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ color: '#CBD5E8', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Free</h2>
            <p style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>$0</p>
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2' }}>
              <li>- Dashboard overview</li>
              <li>- Forever Fund (basic view)</li>
              <li>- Budget Tracker (categories)</li>
              <li>- 50/30/20 Plan</li>
            </ul>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1px solid #CBD5E8', borderRadius: '0.5rem', color: '#CBD5E8', textDecoration: 'none' }}>Current Plan</Link>
            </div>
          </div>
          <div style={{ backgroundColor: '#0f1e38', border: '2px solid #C9973A', borderRadius: '1rem', padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#C9973A', color: '#0A1628', padding: '0.25rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>MOST POPULAR</div>
            <h2 style={{ color: '#C9973A', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Pro</h2>
            <p style={{ marginBottom: '0.25rem' }}><span style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700 }}>{proPrice}</span><span style={{ color: '#CBD5E8' }}>{period}</span></p>
            {proSavings && <p style={{ color: '#C9973A', fontWeight: 600, marginBottom: '1rem' }}>{proSavings}</p>}
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2', marginBottom: '1.5rem' }}>
              <li>- Everything in Free</li>
              <li>- Forever Fund full projection</li>
              <li>- Budget Tracker + subscriptions</li>
              <li>- Investment Tracker</li>
              <li>- Retirement Goal planner</li>
              <li>- Can I Afford It? calculator</li>
              <li>- All future Pro features</li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#8a6b29' : '#C9973A', color: '#0A1628', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '1rem' }}
            >
              {loading ? 'Redirecting to Stripe...' : 'Upgrade to Pro →'}
            </button>
          </div>
          <div style={{ backgroundColor: '#0f1e38', border: '1px solid #2a3a5c', borderRadius: '1rem', padding: '2rem', position: 'relative', opacity: 0.85 }}>
            <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2a3a5c', color: '#CBD5E8', padding: '0.25rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>COMING SOON</div>
            <h2 style={{ color: '#CBD5E8', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Ultimate</h2>
            <p style={{ marginBottom: '0.25rem' }}><span style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700 }}>{ultimatePrice}</span><span style={{ color: '#CBD5E8' }}>{period}</span></p>
            {ultimateSavings && <p style={{ color: '#C9973A', fontWeight: 600, marginBottom: '1rem' }}>{ultimateSavings}</p>}
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2', marginBottom: '1.5rem' }}>
              <li>- Everything in Pro</li>
              <li>- Automatic bank sync (Plaid)</li>
              <li>- Real-time net worth tracking</li>
              <li>- Priority support</li>
            </ul>
            <button
              disabled
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#CBD5E8', fontWeight: 700, borderRadius: '0.5rem', border: '1px solid #2a3a5c', cursor: 'not-allowed', fontSize: '1rem' }}
            >
              Coming Soon
            </button>
          </div>
        </div>
        <p style={{ color: '#CBD5E8', textAlign: 'center', marginTop: '2rem', opacity: 0.6 }}><Link href="/dashboard" style={{ color: '#CBD5E8' }}>Back to dashboard</Link></p>
      </div>
    </div>
  );
}
