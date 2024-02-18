import { iata } from '../lib/iata/iata';
import { OagDataAnalysisEntry } from '../scripts/generateOagData';
import { FlightClass, RedemptionJsonPostprocessed } from '../utils/types';
import { sortRoutesList } from './helpers/sortRoutesList';
import { FlightClassCode, Month, Route } from './types';

type SingleRedemptionInfo = {
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string[];
};
type DetailsForMonth = Record<
  Month,
  {
    redemptionDetails: Partial<
      Record<FlightClassCode, SingleRedemptionInfo | null>
    >;
    flightDetails?: boolean; // TODO: to include flight number etc if there's a use case
  }
>;
type RouteAnalysis = Record<Route, DetailsForMonth>;

export function generateRouteAnalysis({
  redemptions,
  months,
  oagDataAnalysis,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  months: string[];
  oagDataAnalysis: OagDataAnalysisEntry[];
}) {
  const routeAnalysisDict: RouteAnalysis = {};
  const routeIataToFullnameMap: Record<string, string> = {};
  const routeToRegionMap: Record<string, string> = {};

  // create routeAnalysisDict from redemptions data
  redemptions.forEach((redemption) => {
    const route = `${redemption.origin}-${redemption.destination}`;
    const routeIata = `${redemption.originIata}-${redemption.destinationIata}`;
    routeIataToFullnameMap[routeIata] = route;
    const flightClassCode = getFlightClassCode(redemption.flightClass);

    routeAnalysisDict[route] = {
      ...routeAnalysisDict[route],
      [redemption.redemptionMonth]: {
        ...routeAnalysisDict[route]?.[redemption.redemptionMonth],
        redemptionDetails: {
          ...routeAnalysisDict[route]?.[redemption.redemptionMonth]
            ?.redemptionDetails,
          [flightClassCode]: {
            flightNo: redemption.flightNo,
            milesRequired: redemption.milesRequired,
            blackoutPeriod: redemption.blackoutPeriod,
          },
        },
      },
    };
    routeToRegionMap[route] = redemption.region;
  });

  // add OAG data to routeAnalysisDict
  oagDataAnalysis.forEach(({ month, routes }) => {
    routes.forEach((routeEntry) => {});
  });

  // format the result dict a little better:
  // 1. sort order
  //   a. SG outbound flights
  //   b. SG inbound flights
  //   c. all other flights
  // 2. add null to all missing entries in the dict
  const routesSorted = sortRoutesList(Object.keys(routeAnalysisDict));
  const resultFormatted = routesSorted.reduce(
    (_result: RouteAnalysis, route) => {
      const details = routeAnalysisDict[route];
      const detailsUpdated: DetailsForMonth = {};

      // iterate through full list of months
      months.forEach((month) => {
        const existingRedemptionDetailsForMonth =
          details[month]?.redemptionDetails;
        detailsUpdated[month] = {
          ...detailsUpdated[month],
          redemptionDetails: {
            Y: null,
            W: null,
            J: null,
            ...existingRedemptionDetailsForMonth,
          },
        };
      });

      _result[route] = detailsUpdated;
      return _result;
    },
    {},
  );

  const routeAnalysis = Object.entries(resultFormatted).map(
    ([route, details]) => {
      const [from, to] = route.split('-');
      const [fromIata, toIata] = getRouteIata(route).split('-');
      const region = routeToRegionMap[route];

      return {
        from,
        to,
        fromIata,
        toIata,
        region,
        details,
      };
    },
  );
  return routeAnalysis;
}

// FlightClass.FIRST is excluded from the mapping as it is never released on SE
const getFlightClassCode = (flightClass: FlightClass): FlightClassCode => {
  if (flightClass === FlightClass.ECONOMY) {
    return 'Y';
  }
  if (flightClass === FlightClass.PREMIUM_ECONOMY) {
    return 'W';
  }
  if (flightClass === FlightClass.BUSINESS) {
    return 'J';
  }
  throw new Error(`Invalid flightClass value: ${flightClass}`);
};

const getRouteIata = (route: string) => {
  const [origin, destination] = route.split('-');
  return `${iata(origin)}-${iata(destination)}`;
};
