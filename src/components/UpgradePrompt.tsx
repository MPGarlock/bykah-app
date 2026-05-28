import Link from 'next/link';

interface UpgradePromptProps {
  featureName?: string;
}

export function UpgradePrompt({ featureName = 'This feature' }: UpgradePromptProps) {
  return (
    <div style={{
      backgroundColor: '#0f1e38',
      border: '2px solid #C9973A',
      borderRadius: '1rem',
      padding: '2.5rem',
      textAlign: 'center',
      maxWidth: '480px',
      margin: '4rem auto',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
      <h3 style={{
        color: '#C9973A',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
      }}>
        {featureName} is available on BYKAH Plus
      </h3>
      <p style={{ color: '#CBD5E8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Upgrade to Plus to unlock this feature and everything else BYKAH has to offer.
      </p>
      <Link href="/dashboard/upgrade" style={{
        display: 'inline-block',
        backgroundColor: '#C9973A',
        color: '#0A1628',
        fontWeight: 700,
        padding: '0.75rem 2rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        fontSize: '1rem',
      }}
      >
        Upgrade to Plus →
      </Link>
    </div>
  );
}

export default UpgradePrompt;
