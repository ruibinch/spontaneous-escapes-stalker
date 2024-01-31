import { promises as fs } from 'fs';
import path from 'path';
import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { ByMonthContent } from '@/components/by-month/content';
import patienceMyYoungPadawanImg from '@/static/patience-my-young-padawan.jpg';
import { RedemptionEntry } from '@/index';
import { isAfter } from 'date-fns';
import Image from 'next/image';

const MONTHS_WITH_MISSING_DATA = ['201709', '201710'];

export default async function ByMonth({
  params: { month },
}: {
  params: { month: string };
}) {
  const monthsList = getMonthsList();
  if (!monthsList.includes(month)) {
    const monthDate = yyyymmToDate(month);
    const isMonthInFuture = isAfter(monthDate, new Date());

    return (
      <div className="pt-12 px-4">
        {isMonthInFuture ? (
          <div className="flex justify-center">
            <Image
              src={patienceMyYoungPadawanImg}
              alt="Patience my young padawan"
            />
          </div>
        ) : (
          <h1 className="text-2xl font-semibold">
            {MONTHS_WITH_MISSING_DATA.includes(month)
              ? 'Missing data for this month'
              : 'No Spontaneous Escapes redemption for this month'}
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

  return <ByMonthContent redemptions={redemptions} month={month} />;
}
