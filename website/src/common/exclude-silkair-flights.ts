import { RedemptionEntry, RedemptionInfoSingle, RouteAnalysisEntry } from '..';

/**
 * Excludes Silkair-only routes and Silkair flights from the route-analysis.json list.
 */
export function excludeSilkairFlightsFromRouteAnalysis(
  routeAnalysisList: RouteAnalysisEntry[],
): RouteAnalysisEntry[] {
  return routeAnalysisList
    .filter((entry) => !entry.isSilkairOnlyRoute)
    .map((entry) => {
      return {
        ...entry,
        details: entry.details.map((detail) => {
          return {
            ...detail,
            redemptionDetails: {
              Y: excludeSilkairFlightsFromRedemptionInfo(
                detail.redemptionDetails.Y,
              ),
              W: excludeSilkairFlightsFromRedemptionInfo(
                detail.redemptionDetails.W,
              ),
              J: excludeSilkairFlightsFromRedemptionInfo(
                detail.redemptionDetails.J,
              ),
            },
          };
        }),
      };
    });
}

export function excludeSilkairFlightsFromMonthRedemptionList(
  redemptions: RedemptionEntry[],
): RedemptionEntry[] {
  return redemptions
    .map((redemption) => ({
      ...redemption,
      flightNos: redemption.flightNos.filter((flightNo) =>
        flightNo.startsWith('SQ'),
      ),
    }))
    .filter((redemption) => redemption.flightNos.length > 0);
}

const excludeSilkairFlightsFromRedemptionInfo = (
  redemptionInfo: RedemptionInfoSingle | null,
) => {
  if (!redemptionInfo) return null;
  const siaOnlyFlights = redemptionInfo.flightNos.filter((flightNo) =>
    flightNo.startsWith('SQ'),
  );
  // if all flights are Silkair flights, remove redemptionInfo
  if (siaOnlyFlights.length === 0) return null;

  return {
    ...redemptionInfo,
    flightNos: siaOnlyFlights,
  };
};
