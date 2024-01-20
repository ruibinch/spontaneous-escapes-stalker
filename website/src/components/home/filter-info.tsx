import { RouteAnalysisEntry } from '@/index';

export function FilterInfo({
  routeAnalysisList,
  routeAnalysisListFiltered,
  monthsList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
  routeAnalysisListFiltered: RouteAnalysisEntry[];
  monthsList: string[];
}) {
  const routesFilteredText =
    routeAnalysisList.length !== routeAnalysisListFiltered.length
      ? `${routeAnalysisListFiltered.length} of ${routeAnalysisList.length} routes`
      : null;

  const numFilteredMonths = Object.keys(
    routeAnalysisListFiltered[0].details,
  ).length;
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
