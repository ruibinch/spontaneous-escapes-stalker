import { isYearMatch } from '@/components/common/filters/year-filter';
import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';

/**
 * Returns a list of months in YYYYMM format.
 */
export function getMonthsList({
  years,
  includeOnlyMonthsPresentInOagDataset,
}: {
  years?: string[];
  includeOnlyMonthsPresentInOagDataset?: boolean;
}): string[] {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

  const monthsWithRouteNetworkDataSet = new Set<string>();
  monthSummaryAnalysisList.forEach((entry) => {
    if (
      (includeOnlyMonthsPresentInOagDataset
        ? entry.byUniqueRoutes.routeNetworkSize.total !== undefined &&
          entry.byUniqueRoutes.routeNetworkSize.sia !== undefined
        : true) &&
      (years
        ? isYearMatch({ yearsFiltered: years, year: entry.month.slice(0, 4) })
        : true)
    ) {
      monthsWithRouteNetworkDataSet.add(entry.month);
    }
  });

  return Array.from(monthsWithRouteNetworkDataSet);
}
