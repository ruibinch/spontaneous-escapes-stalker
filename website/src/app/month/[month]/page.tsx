import { getMonthsList } from '@/common/get-data-time-range';
import { MONTHS_WITH_MISSING_DATA } from '@/common/months-data-info';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { ByMonthContent } from '@/components/by-month/content';
import { NoDataIllustration } from '@/components/icons/no-data';
import { MonthSummaryAnalysisEntry, RedemptionEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import patienceMyYoungPadawanImg from '@/static/patience-my-young-padawan.jpg';
import { isAfter, isBefore } from 'date-fns';
import { promises as fs } from 'fs';
import Image from 'next/image';
import path from 'path';

export default async function ByMonth({
  params: { month },
}: {
  params: { month: string };
}) {
  const monthsList = getMonthsList();

  if (!monthsList.includes(month)) {
    const isMonthValid = new RegExp('^\\d{6}$').test(month);
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
          <div className="flex flex-col gap-16 items-center justify-center">
            <NoDataIllustration className="w-1/2 h-1/2" />

            <h1 className="text-2xl font-semibold">
              {(() => {
                if (!isMonthValid) {
                  return 'Invalid month';
                }
                if (MONTHS_WITH_MISSING_DATA.includes(month)) {
                  return 'Missing data for this month';
                }
                if (isBefore(monthDate, yyyymmToDate(monthsList[0]))) {
                  return 'Pre-Spontaneous Escapes era';
                }
                return 'No Spontaneous Escapes redemption for this month';
              })()}
            </h1>
          </div>
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

  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];
  const monthSummaryAnalysisEntry = monthSummaryAnalysisList.find(
    (entry) => entry.month === month,
  ) as MonthSummaryAnalysisEntry;

  return (
    <ByMonthContent
      month={month}
      redemptions={redemptions}
      monthSummaryAnalysisEntry={monthSummaryAnalysisEntry}
    />
  );
}
