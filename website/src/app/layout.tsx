import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Providers } from '../providers';

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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
