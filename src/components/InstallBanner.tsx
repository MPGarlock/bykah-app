'use client';

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isStandalone && !dismissed && isMobile) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#0A1628',
        borderTop: '1px solid rgba(201,151,58,0.3)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/icons/icon.svg" alt="BYKAH" style={{ width: 36, height: 36, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8D5A3', fontFamily: 'DM Sans, sans-serif' }}>
            Add BYKAH to your home screen
          </div>
          <div style={{ fontSize: 11, color: '#5A6B85', fontFamily: 'DM Sans, sans-serif' }}>
            Tap the share icon then &ldquo;Add to Home Screen&rdquo;
          </div>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: '1px solid rgba(201,151,58,0.4)',
          color: '#C9973A',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'DM Sans, sans-serif',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
