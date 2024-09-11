import { PlaygroundContent } from '@/components/playground/content';
import { differenceInCalendarDays } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';

const NEW_REDEMPTION_WITHIN_NUM_DAYS = 5;

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
  const isNewRedemption =
    differenceInCalendarDays(new Date(), new Date(latestRedemptionAt)) <=
    NEW_REDEMPTION_WITHIN_NUM_DAYS;

  return (
    <Suspense>
      <PlaygroundContent isNewRedemption={isNewRedemption} />;
    </Suspense>
  );
}
