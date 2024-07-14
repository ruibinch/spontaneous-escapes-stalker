import { isYearMatch } from '@/components/common/filters/year-filter';
import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';

export function getMonthsWithRouteNetworkData(years?: string[]) {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

  const monthsWithRouteNetworkDataSet = new Set<string>();
  monthSummaryAnalysisList.forEach((entry) => {
    if (
      entry.byUniqueRoutes.routeNetworkSize.total !== undefined &&
      entry.byUniqueRoutes.routeNetworkSize.sia !== undefined &&
      (years
        ? isYearMatch({ yearsFiltered: years, year: entry.month.slice(0, 4) })
        : true)
    ) {
      monthsWithRouteNetworkDataSet.add(entry.month);
    }
  });

  return monthsWithRouteNetworkDataSet;
}
