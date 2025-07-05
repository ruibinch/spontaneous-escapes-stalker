'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Layout } from '../layout/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    // HeroUI Link component will use nextjs' router for navigation
    <HeroUIProvider navigate={router.push}>
      <ThemeProvider defaultTheme="light" attribute="class" enableSystem>
        <Layout>{children}</Layout>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
