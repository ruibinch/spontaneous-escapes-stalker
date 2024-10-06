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
export function makeRouteDetailsList(
  routeAnalysisEntry: RouteAnalysisEntry | undefined,
) {
  if (!routeAnalysisEntry) return [];

  const detailsList = routeAnalysisEntry.details.reduce(
    (_detailsList: RouteDetailDatum[], detail) => {
      const { month, redemptionDetails } = detail;
      Object.entries(redemptionDetails).forEach(
        ([flightClass, redemptionInfo]) => {
          if (redemptionInfo) {
            _detailsList.push({
              ...redemptionInfo,
              flightClass,
              month,
            });
          }
        },
      );
      return _detailsList;
    },
    [],
  );

  return detailsList;
}
