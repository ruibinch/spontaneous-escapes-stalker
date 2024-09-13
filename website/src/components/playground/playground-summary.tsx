import { getMonthsList } from '@/common/get-data-time-range';
import { RouteAnalysisEntry } from '@/index';
import { SummaryEntryCard } from '../common/summary-entry-card';
import { isApplicableMonth } from './helpers/is-applicable-month';

export function PlaygroundSummary({
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
  const numRoutes = countRoutes(routeAnalysisList);
  const numFilteredRoutes = countRoutes(routeAnalysisListFiltered);
  const numMonths = monthsList.length;
  const numFilteredMonths = applicableMonths.length;

  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      <SummaryEntryCard
        header="Redemptions"
        content={numFilteredRedemptions}
        subcontent={`out of ${numRedemptions}`}
      />
      <SummaryEntryCard
        header="Routes"
        content={numFilteredRoutes}
        subcontent={`out of ${numRoutes}`}
      />
      <SummaryEntryCard
        header="Months"
        content={numFilteredMonths}
        subcontent={`out of ${numMonths}`}
      />
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

  routeAnalysisList.forEach(({ details }) => {
    let hasRedemptionForRoute = false;

    Object.values(details).forEach((detailsInfo) => {
      const hasRedemption =
        Object.values(detailsInfo.redemptionDetails).filter(Boolean).length > 0;
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
