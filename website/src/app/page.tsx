'use client';
import { PlaygroundContent } from '@/components/playground/content';
import { Suspense } from 'react';

export default function Playground() {
  return (
    <Suspense>
      <PlaygroundContent />;
    </Suspense>
  );
}
