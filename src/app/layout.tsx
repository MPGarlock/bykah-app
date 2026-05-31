import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallBanner from '@/components/InstallBanner';

export const viewport: Viewport = {
  themeColor: '#0A1628',
};

export const metadata: Metadata = {
  title: {
    default: 'BYKAH App | Buy Your Kids A House',
    template: '%s | BYKAH',
  },
  description: 'Track your Forever Fund, budget with 50/30/20, run house and car calculators, and build generational wealth. Free tools from the Buy Your Kids A House podcast.',
  keywords: ['generational wealth', 'forever fund', '50/30/20 budget', 'buy your kids a house', 'financial planning'],
  authors: [{ name: 'Matt Garlock' }, { name: 'Andrew Higgins' }],
  metadataBase: new URL('https://app.buyyourkidsahouse.com'),
  openGraph: {
    type: 'website',
    url: 'https://app.buyyourkidsahouse.com',
    title: 'BYKAH App | Buy Your Kids A House',
    description: 'Track your Forever Fund, budget with 50/30/20, and build generational wealth.',
    siteName: 'BYKAH App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BYKAH App | Buy Your Kids A House',
    description: 'Track your Forever Fund, budget with 50/30/20, and build generational wealth.',
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BYKAH',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body>
        <InstallBanner />
        {children}
      </body>
    </html>
  );
}
