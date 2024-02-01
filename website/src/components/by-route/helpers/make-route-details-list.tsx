import { RouteAnalysisEntry, SingleRedemptionInfo } from '@/index';

export type RouteDetailDatum = SingleRedemptionInfo & {
  flightClass: string;
  month: string;
};

export type RouteAnalysisEntryWithDetailsList = RouteAnalysisEntry & {
  detailsList: RouteDetailDatum[];
};

/**
 * Converts the details object into a details list for easier manipulation.
 */
export function makeRouteDetailsList(routeAnalysisEntry: RouteAnalysisEntry) {
  const routeDetailsList: RouteDetailDatum[] = [];

  Object.entries(routeAnalysisEntry.details).forEach(([month, detailsInfo]) => {
    Object.entries(detailsInfo).forEach(([flightClass, redemptionInfo]) => {
      if (redemptionInfo) {
        routeDetailsList.push({
          ...redemptionInfo,
          flightClass,
          month,
        });
      }
    });
  });

  return {
    ...routeAnalysisEntry,
    detailsList: routeDetailsList,
  };
}
