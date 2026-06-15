'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UpgradeClient({ currentPlan }: { currentPlan: string }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [proLoading, setProLoading] = useState(false);
  const [ultimateLoading, setUltimateLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFree = currentPlan === 'free' || !currentPlan;
  const isPro = currentPlan === 'pro';
  const isUltimate = currentPlan === 'ultimate';
  const isPaid = isPro || isUltimate;

  const proPlanKey = billing === 'monthly' ? 'pro_monthly' : 'pro_annual';
  const ultimatePlanKey = billing === 'monthly' ? 'ultimate_monthly' : 'ultimate_annual';
  const proPrice = billing === 'monthly' ? '$9' : '$87';
  const ultimatePrice = billing === 'monthly' ? '$15' : '$144';
  const period = billing === 'monthly' ? '/mo' : '/yr';
  const proSavings = billing === 'annual' ? 'Save $21/yr' : '';
  const ultimateSavings = billing === 'annual' ? 'Save $36/yr' : '';

  async function handleCheckout(planKey: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
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

  async function handleManageMembership() {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
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
      setPortalLoading(false);
    }
  }

  const heading = isUltimate ? 'Your Membership' : isPro ? 'Your Membership' : 'Choose Your Plan';
  const subheading = isUltimate
    ? 'Manage your BYKAH Ultimate membership'
    : isPro
    ? 'Manage your BYKAH Pro membership'
    : 'Unlock the full BYKAH experience';

  return (
    <div style={{ backgroundColor: '#0A1628', minHeight: '100vh', padding: '3rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ color: '#C9973A', fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>{heading}</h1>
        <p style={{ color: '#CBD5E8', textAlign: 'center', marginBottom: '2rem' }}>{subheading}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <button onClick={() => setBilling('monthly')} style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: '1px solid #C9973A', backgroundColor: billing === 'monthly' ? '#C9973A' : 'transparent', color: billing === 'monthly' ? '#0A1628' : '#C9973A', fontWeight: 600, cursor: 'pointer' }}>Monthly</button>
          <button onClick={() => setBilling('annual')} style={{ padding: '0.5rem 1.5rem', borderRadius: '9999px', border: '1px solid #C9973A', backgroundColor: billing === 'annual' ? '#C9973A' : 'transparent', color: billing === 'annual' ? '#0A1628' : '#C9973A', fontWeight: 600, cursor: 'pointer' }}>Annual — Save more</button>
        </div>
        {error && (
          <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', backgroundColor: '#1a0a0a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ef4444' }}>{error}</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>

          {/* FREE */}
          <div style={{ backgroundColor: '#0f1e38', border: '1px solid #2a3a5c', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ color: '#CBD5E8', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Free</h2>
            <p style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>$0</p>
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2', marginBottom: '1.5rem' }}>
              <li>✓ Dashboard overview</li>
              <li>✓ Forever Fund (basic)</li>
              <li>✓ Budget Tracker</li>
              <li>✓ 50/30/20 Plan</li>
              <li>✓ Kids House Fund</li>
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1px solid #CBD5E8', borderRadius: '0.5rem', color: '#CBD5E8', textDecoration: 'none' }}>
                {isFree ? 'Current Plan' : 'Included'}
              </Link>
            </div>
          </div>

          {/* PRO */}
          <div style={{ backgroundColor: '#0f1e38', border: isPro ? '2px solid #C9973A' : '1px solid #2a3a5c', borderRadius: '1rem', padding: '2rem', position: 'relative' }}>
            {(isPro || (!isPaid)) && (
              <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#C9973A', color: '#0A1628', padding: '0.25rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                {isPro ? 'YOUR PLAN' : 'MOST POPULAR'}
              </div>
            )}
            <h2 style={{ color: '#C9973A', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Pro</h2>
            <p style={{ marginBottom: '0.25rem' }}><span style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700 }}>{proPrice}</span><span style={{ color: '#CBD5E8' }}>{period}</span></p>
            {proSavings && <p style={{ color: '#C9973A', fontWeight: 600, marginBottom: '1rem' }}>{proSavings}</p>}
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2', marginBottom: '1.5rem' }}>
              <li>✓ Everything in Free</li>
              <li>✓ Forever Fund full projection</li>
              <li>✓ Retirement Goal planner</li>
              <li>✓ Can I Afford It? calculator</li>
              <li>✓ Travel Points Calculator</li>
              <li>✓ Subscription Tracker</li>
              <li>✓ CSV bank import</li>
            </ul>
            {isPro ? (
              <>
                <div style={{ width: '100%', padding: '0.75rem', textAlign: 'center', border: '1px solid #C9973A', borderRadius: '0.5rem', color: '#C9973A', fontWeight: 700, marginBottom: '0.75rem' }}>Current Plan</div>
                <button onClick={handleManageMembership} disabled={portalLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: portalLoading ? '#8a6b29' : '#C9973A', color: '#0A1628', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: portalLoading ? 'wait' : 'pointer', fontSize: '1rem' }}>
                  {portalLoading ? 'Loading...' : 'Manage Membership'}
                </button>
              </>
            ) : isUltimate ? (
              <div style={{ width: '100%', padding: '0.75rem', textAlign: 'center', border: '1px solid #2a3a5c', borderRadius: '0.5rem', color: '#CBD5E8' }}>Included in Ultimate</div>
            ) : (
              <button onClick={() => handleCheckout(proPlanKey, setProLoading)} disabled={proLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: proLoading ? '#8a6b29' : '#C9973A', color: '#0A1628', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: proLoading ? 'wait' : 'pointer', fontSize: '1rem' }}>
                {proLoading ? 'Redirecting...' : 'Upgrade to Pro →'}
              </button>
            )}
          </div>

          {/* ULTIMATE */}
          <div style={{ backgroundColor: '#0f1e38', border: isUltimate ? '2px solid #C9973A' : '1px solid #2a3a5c', borderRadius: '1rem', padding: '2rem', position: 'relative' }}>
            {isUltimate && (
              <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#C9973A', color: '#0A1628', padding: '0.25rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>YOUR PLAN</div>
            )}
            <h2 style={{ color: '#C9973A', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.25rem' }}>Ultimate</h2>
            <p style={{ marginBottom: '0.25rem' }}><span style={{ color: '#C9973A', fontSize: '2.5rem', fontWeight: 700 }}>{ultimatePrice}</span><span style={{ color: '#CBD5E8' }}>{period}</span></p>
            {ultimateSavings && <p style={{ color: '#C9973A', fontWeight: 600, marginBottom: '1rem' }}>{ultimateSavings}</p>}
            <ul style={{ listStyle: 'none', padding: 0, color: '#CBD5E8', lineHeight: '2', marginBottom: '1.5rem' }}>
              <li>✓ Everything in Pro</li>
              <li>✓ Plaid live bank sync</li>
              <li>✓ Auto-categorized transactions</li>
              <li>✓ Debt payoff tracker</li>
              <li>✓ Net worth tracker</li>
              <li>✓ 12 months of history</li>
            </ul>
            {isUltimate ? (
              <>
                <div style={{ width: '100%', padding: '0.75rem', textAlign: 'center', border: '1px solid #C9973A', borderRadius: '0.5rem', color: '#C9973A', fontWeight: 700, marginBottom: '0.75rem' }}>Current Plan</div>
                <button onClick={handleManageMembership} disabled={portalLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: portalLoading ? '#8a6b29' : '#C9973A', color: '#0A1628', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: portalLoading ? 'wait' : 'pointer', fontSize: '1rem' }}>
                  {portalLoading ? 'Loading...' : 'Manage Membership'}
                </button>
              </>
            ) : (
              <button onClick={() => handleCheckout(ultimatePlanKey, setUltimateLoading)} disabled={ultimateLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: ultimateLoading ? '#8a6b29' : '#C9973A', color: '#0A1628', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: ultimateLoading ? 'wait' : 'pointer', fontSize: '1rem' }}>
                {ultimateLoading ? 'Redirecting...' : 'Upgrade to Ultimate →'}
              </button>
            )}
          </div>

        </div>
        <p style={{ color: '#CBD5E8', textAlign: 'center', marginTop: '2rem', opacity: 0.6 }}>
          <Link href="/dashboard" style={{ color: '#CBD5E8' }}>Back to dashboard</Link>
        </p>
      </div>
    </div>
  );
}
