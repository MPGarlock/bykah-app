'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLUS_MONTHLY_PRICE_ID = 'price_1TcCsU0y3NTRtq23PhFw8pe2';
const PLUS_ANNUAL_PRICE_ID = 'price_1TcCsU0y3NTRtq23r7Fj1Utz';

export default function UpgradePage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const priceId = billing === 'monthly' ? PLUS_MONTHLY_PRICE_ID : PLUS_ANNUAL_PRICE_ID;
  const price = billing === 'monthly' ? '$9' : '$85';
  const period = billing === 'monthly' ? '/mo' : '/yr';
  const savings = billing === 'annual' ? 'Save $23/yr' : '';

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ backgroundColor: '#0A1628', minHeight: '100vh', padding: '3rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
