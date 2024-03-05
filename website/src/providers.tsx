'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';
import { Layout } from './layout/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <ThemeProvider defaultTheme="light">
        <Layout>{children}</Layout>
      </ThemeProvider>
    </NextUIProvider>
  );
}
