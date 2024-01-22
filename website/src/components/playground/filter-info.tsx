import { getMonthsList } from '@/common/get-data-time-range';
import { RouteAnalysisEntry } from '@/index';
import { isApplicableMonth } from './helpers/is-applicable-month';

export function FilterInfo({
  routeAnalysisList,
  routeAnalysisListFiltered,
  startDate,
  endDate,
  months,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
  routeAnalysisListFiltered: RouteAnalysisEntry[];
  startDate: Date;
  endDate: Date;
  months: string[];
}) {
  const monthsList = getMonthsList();
  const applicableMonths = monthsList.filter((month) =>
    isApplicableMonth({
      month,
      filters: {
        startDate,
        endDate,
        months,
      },
    }),
  );

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
