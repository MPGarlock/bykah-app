import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Buy Your Kids A House — App',
  description: 'Track your Forever Number. Build generational wealth, one expense at a time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
