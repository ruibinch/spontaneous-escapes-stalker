'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { Layout } from '../layout/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider defaultTheme="light" attribute="class" enableSystem>
        <Layout>{children}</Layout>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
