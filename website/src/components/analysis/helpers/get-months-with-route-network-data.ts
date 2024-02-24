import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';

export function getMonthsWithRouteNetworkData() {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

  const monthsWithRouteNetworkDataSet = new Set<string>();
  monthSummaryAnalysisList.forEach((entry) => {
    if (
      entry.byUniqueRoutes.routeNetworkSize.total !== undefined &&
      entry.byUniqueRoutes.routeNetworkSize.sia !== undefined
    ) {
      monthsWithRouteNetworkDataSet.add(entry.month);
    }
  });

  return monthsWithRouteNetworkDataSet;
}
