'use client';

import { NextUIProvider } from '@nextui-org/react';
import { Layout } from './layout/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <Layout>{children}</Layout>
    </NextUIProvider>
  );
}
