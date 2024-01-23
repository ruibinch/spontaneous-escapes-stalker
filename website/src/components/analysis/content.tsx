import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { DistributionByFlightClassChart } from './distribution-by-flight-class-chart';
import { DistributionByRegionChart } from './distribution-by-region-chart';
import { getMonthsList } from '@/common/get-data-time-range';
import { MONTHS_WITH_MISSING_DATA } from '@/common/months-with-missing-data';

const monthSummaryAnalysis =
  monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

export function AnalysisContent() {
  const months = (() => {
    const _months = [...getMonthsList(), ...MONTHS_WITH_MISSING_DATA];
    return [..._months].sort((a, b) => a.localeCompare(b));
  })();

  const monthSummaryAnalysisDict = monthSummaryAnalysis.reduce(
    (_monthSummaryAnalysisDict, entry) => {
      const { month, ...restProps } = entry;
      _monthSummaryAnalysisDict[month] = restProps;
      return _monthSummaryAnalysisDict;
    },
    {} as Record<string, Omit<MonthSummaryAnalysisEntry, 'month'>>,
  );

  return (
    <div className=" flex flex-col w-full gap-16">
      <div className="h-full flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Distribution by flight class</h3>
        <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
          <DistributionByFlightClassChart
            monthSummaryAnalysisDict={monthSummaryAnalysisDict}
            months={months}
          />
        </div>
      </div>

      <div className="h-full flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Distribution by region</h3>
        <div className="w-full bg-default-50 shadow-md p-6 rounded-lg">
          <DistributionByRegionChart
            monthSummaryAnalysisDict={monthSummaryAnalysisDict}
            months={months}
          />
        </div>
      </div>
    </div>
  );
}
