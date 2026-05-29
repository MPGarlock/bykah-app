import type { Metadata, Viewport } from 'next';
import './globals.css';
import InstallBanner from '@/components/InstallBanner';

export const viewport: Viewport = {
  themeColor: '#0A1628',
};

export const metadata: Metadata = {
  title: 'Buy Your Kids A House — App',
  description: 'Track your Forever Number. Build generational wealth, one expense at a time.',
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
