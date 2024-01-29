import { promises as fs } from 'fs';
import path from 'path';

import { getMonthsList } from '@/common/get-data-time-range';
import { ByMonthContent } from '@/components/by-month/content';
import { RedemptionEntry } from '@/index';

export default async function ByMonth({
  params: { month },
}: {
  params: { month: string };
}) {
  const monthsList = getMonthsList();
  if (!monthsList.includes(month)) {
    return (
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-semibold">
          No Spontaneous Escapes redemption for this month
        </h1>
      </div>
    );
  }

  const redemptionsFilepath = path.join(
    process.cwd(),
    'src',
    'static',
    `${month}-redemptions-postprocessed.json`,
  );
  const redemptionsFile = await fs.readFile(redemptionsFilepath, 'utf8');
  const redemptions = JSON.parse(redemptionsFile) as RedemptionEntry[];

  return <ByMonthContent redemptions={redemptions} month={month} />;
}
