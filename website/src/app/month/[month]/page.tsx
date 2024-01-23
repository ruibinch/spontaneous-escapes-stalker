import { promises as fs } from 'fs';
import path from 'path';

import { getMonthsList } from '@/common/get-data-time-range';
import { MONTHS_WITH_MISSING_DATA } from '@/common/months-with-missing-data';
import { InfoIcon } from '@/components/icons/info';
import { MonthDisplayContent } from '@/components/month-display/content';
import { RedemptionEntry } from '@/index';
import { Card, CardBody } from '@nextui-org/react';

export default async function ByMonth({
  params: { month },
}: {
  params: { month: string };
}) {
  const monthsList = getMonthsList();
  if (!monthsList.includes(month)) {
    return (
      <div className="pt-12 px-4">
        {MONTHS_WITH_MISSING_DATA.includes(month) ? (
          <Card>
            <CardBody className="flex flex-row gap-2">
              <InfoIcon />
              <span>Missing data for this month</span>
            </CardBody>
          </Card>
        ) : (
          <h1 className="text-2xl font-bold">
            No Spontaneous Escapes redemption for this month
          </h1>
        )}
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

  return <MonthDisplayContent redemptions={redemptions} month={month} />;
}
