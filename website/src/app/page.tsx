import { PlaygroundContent } from '@/components/playground/content';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';

export default function Playground() {
  const latestRedemptionAtFilepath = path.join(
    process.cwd(),
    'src',
    'static',
    '.latest-redemption-at',
  );
  const latestRedemptionAt = fs.readFileSync(
    latestRedemptionAtFilepath,
    'utf8',
  );

  return (
    <Suspense>
      <PlaygroundContent latestRedemptionAt={new Date(latestRedemptionAt)} />;
    </Suspense>
  );
}
