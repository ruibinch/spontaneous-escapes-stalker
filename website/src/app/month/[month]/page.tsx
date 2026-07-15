import { excludeSilkairFlightsFromMonthRedemptionList } from '@/common/exclude-silkair-flights';
import { getMonthsList } from '@/common/get-data-time-range';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { MONTHS_WITH_MISSING_DATA } from '@/common/months-data-info';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { ByMonthContent } from '@/components/by-month/content';
import { NoDataIllustration } from '@/components/icons/no-data';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { fetchMonthRedemptions } from '@/lib/fetchMonthRedemptions';
import { isAfter, isBefore } from 'date-fns';
import Image from 'next/image';
import { Suspense } from 'react';

type ByMonthParams = Promise<{ month: string }>;

export default async function ByMonth({ params }: { params: ByMonthParams }) {
  const { month } = await params;
  const monthsList = getMonthsList();

  if (!monthsList.includes(month)) {
    return <MissingMonthData monthsList={monthsList} month={month} />;
  }

  const redemptionsFull = await fetchMonthRedemptions(month);
  const redemptionsSiaOnly =
    excludeSilkairFlightsFromMonthRedemptionList(redemptionsFull);
  const monthSummaryAnalysisList = getStaticFileContent<
    MonthSummaryAnalysisEntry[]
  >({ filename: 'month-summary-analysis.json' });
  const routeAnalysisList = getStaticFileContent<RouteAnalysisEntry[]>({
    filename: 'route-analysis.json',
  });

  const monthSummaryAnalysisEntry = monthSummaryAnalysisList.find(
    (entry) => entry.month === month,
  ) as MonthSummaryAnalysisEntry;

  return (
    <Suspense>
      <ByMonthContent
        month={month}
        redemptionsFull={redemptionsFull}
        redemptionsSiaOnly={redemptionsSiaOnly}
        monthSummaryAnalysisEntry={monthSummaryAnalysisEntry}
        routeAnalysisList={routeAnalysisList}
        totalMonths={monthsList.length}
      />
    </Suspense>
  );
}

function MissingMonthData({
  monthsList,
  month,
}: {
  monthsList: string[];
  month: string;
}) {
  const isMonthValid = new RegExp('^\\d{6}$').test(month);
  const monthDate = yyyymmToDate(month);
  const isMonthInFuture = isAfter(monthDate, new Date());

  return (
    <div className="pt-12 px-4">
      {isMonthInFuture ? (
        <div className="flex justify-center">
          <Image
            src="/patience-my-young-padawan.jpg"
            alt="Patience my young padawan"
            height="900"
            width="442"
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
