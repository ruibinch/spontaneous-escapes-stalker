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

  const numRedemptions = countRedemptions(routeAnalysisList);
  const numFilteredRedemptions = countRedemptions(routeAnalysisListFiltered);
  const numRoutes = routeAnalysisList.length;
  const numFilteredRoutes = countRoutes(routeAnalysisListFiltered);
  const numMonths = monthsList.length;
  const numFilteredMonths = applicableMonths.length;

  const redemptionsText = `${numFilteredRedemptions}/${numRedemptions} redemptions`;
  const routesText = `${numFilteredRoutes}/${numRoutes} routes`;
  const monthsText = `${numFilteredMonths}/${numMonths} months`;

  return (
    <div className="pt-2">
      <span>Showing </span>
      <span className="font-bold">{redemptionsText}</span>
      <span> for </span>
      <span className="font-bold">{routesText}</span>
      <span> in </span>
      <span className="font-bold">{monthsText}</span>
    </div>
  );
}

function countRedemptions(routeAnalysisList: RouteAnalysisEntry[]) {
  let redemptionsCount = 0;

  routeAnalysisList.forEach(({ details }) => {
    details.forEach((detail) => {
      const numRedemptionsForMonth = Object.values(
        detail.redemptionDetails,
      ).filter(Boolean).length;
      redemptionsCount += numRedemptionsForMonth;
    });
  });

  return redemptionsCount;
}

function countRoutes(routeAnalysisList: RouteAnalysisEntry[]) {
  let routesCount = 0;

  routeAnalysisList.forEach(({ region, details }) => {
    let hasRedemptionForRoute = false;

    Object.values(details).forEach((detailsInfo) => {
      const hasRedemption =
        Object.values(detailsInfo).filter(Boolean).length > 0;
      if (hasRedemption) {
        hasRedemptionForRoute = true;
      }
    });

    if (hasRedemptionForRoute) {
      routesCount += 1;
    }
  });

  return routesCount;
}
