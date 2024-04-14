import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import Script from 'next/script';
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
      <Script
        src="/stats/script.js"
        data-website-id="72c90a3b-768b-4f5e-af4e-87b45cb0d3ce"
      />

      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
