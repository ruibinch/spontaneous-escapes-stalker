import { AnalyticsScript } from '@/analytics';
import type { Metadata } from 'next';
import { Providers } from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'KrisFlyer Spontaneous Escapes Analysis',
  description: 'Analysis of past KrisFlyer Spontaneous Escapes redemptions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AnalyticsScript />

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
