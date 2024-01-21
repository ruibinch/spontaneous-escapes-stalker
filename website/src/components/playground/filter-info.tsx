import { getMonthsList } from '@/common/get-months-list';
import { RouteAnalysisEntry } from '@/index';
import { filterApplicableMonthsList } from './helpers/filter-applicable-months-list';

export function FilterInfo({
  routeAnalysisList,
  routeAnalysisListFiltered,
  startDate,
  endDate,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
  routeAnalysisListFiltered: RouteAnalysisEntry[];
  startDate: Date;
  endDate: Date;
}) {
  const monthsList = getMonthsList();
  const applicableMonths = filterApplicableMonthsList({
    startDate,
    endDate,
  });

  const routesFilteredText =
    routeAnalysisList.length !== routeAnalysisListFiltered.length
      ? `${routeAnalysisListFiltered.length} of ${routeAnalysisList.length} routes`
      : null;

  const numFilteredMonths = applicableMonths.length;
  const monthsFilteredText =
    monthsList.length !== numFilteredMonths
      ? `${numFilteredMonths} of ${monthsList.length} months`
      : null;

  if (!routesFilteredText && !monthsFilteredText) {
    return null;
  }

  return (
    <div className="pt-2">
      <span>Showing </span>
      <span className="font-bold">{routesFilteredText}</span>
      {routesFilteredText && monthsFilteredText && <span> and </span>}
      <span className="font-bold">{monthsFilteredText}</span>
    </div>
  );
}
