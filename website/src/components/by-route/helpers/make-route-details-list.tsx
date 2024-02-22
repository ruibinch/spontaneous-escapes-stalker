import { RouteAnalysisEntry, RedemptionInfoSingle } from '@/index';

export type RouteDetailDatum = RedemptionInfoSingle & {
  flightClass: string;
  month: string;
};

export type RouteAnalysisEntryWithDetailsList = RouteAnalysisEntry & {
  detailsList: RouteDetailDatum[];
};

/**
 * Populates a details list, where each entry represents a per-flight-class-per-route redemption.
 */
export function makeRouteDetailsList(routeAnalysisEntry: RouteAnalysisEntry) {
  const routeDetailsList: RouteDetailDatum[] = [];

  routeAnalysisEntry.details.forEach((detail) => {
    const { month, redemptionDetails } = detail;
    Object.entries(redemptionDetails).forEach(
      ([flightClass, redemptionInfo]) => {
        if (redemptionInfo) {
          routeDetailsList.push({
            ...redemptionInfo,
            flightClass,
            month,
          });
        }
      },
    );
  });

  return {
    ...routeAnalysisEntry,
    detailsList: routeDetailsList,
  };
}
