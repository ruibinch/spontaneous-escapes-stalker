import { MonthSummaryAnalysis } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { DistributionByFlightClassChart } from './distribution-by-flight-class-chart';
import { DistributionByRegionChart } from './distribution-by-region-chart';

const monthSummaryAnalysis = monthSummaryAnalysisFile as MonthSummaryAnalysis;

// Define this list manually first as there are missing months of data
const SE_MONTHS_LIST_WITH_MISSING_DATA_MONTHS = [
  '201709', // missing data
  '201710', // missing data
  '201711',
  '201712',
  '201801',
  '201802', // missing data
  '201803',
  '201804',
  '201805',
  '201806',
  '201807',
  '201808', // missing data
  '201809', // missing data
];

export function AnalysisContent() {
  const months = (() => {
    const monthsSet = new Set(SE_MONTHS_LIST_WITH_MISSING_DATA_MONTHS);
    Object.keys(monthSummaryAnalysis).forEach((month) => {
      monthsSet.add(month);
    });
    return Array.from(monthsSet);
  })();

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center pt-12 pb-12 px-4 lg:px-0 flex-wrap xl:flex-nowrap max-w-[90rem] mx-auto w-full">
        <div className="gap-16 flex flex-col w-full">
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">
              Distribution by flight class
            </h3>
            <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
              <DistributionByFlightClassChart
                monthSummaryAnalysis={monthSummaryAnalysis}
                months={months}
              />
            </div>
          </div>

          <div className="h-full flex flex-col gap-2">
            <h3 className="text-xl font-semibold">Distribution by region</h3>
            <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
              <DistributionByRegionChart
                monthSummaryAnalysis={monthSummaryAnalysis}
                months={months}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
