import { iata } from '../lib/iata/iata';
import { FlightClass, RedemptionJsonPostprocessed } from '../utils/types';
import { sortRoutesList } from './helpers/sortRoutesList';
import { FlightClassCode, Month, Route } from './types';

type SingleRedemptionInfo = {
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string[];
};
type RouteAnalysis = Record<
  Route,
  Record<Month, Partial<Record<FlightClassCode, SingleRedemptionInfo | null>>>
>;

export function generateRouteAnalysis({
  redemptions,
  months,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  months: string[];
}) {
  const routeToMonthsMap: RouteAnalysis = {};
  const routeToRegionMap: Record<string, string> = {};

  // create routeToMonthsMap dict from data
  redemptions.forEach((redemption) => {
    const route = `${redemption.origin}-${redemption.destination}`;
    const flightClassCode = getFlightClassCode(redemption.flightClass);

    routeToMonthsMap[route] = {
      ...routeToMonthsMap[route],
      [redemption.redemptionMonth]: {
        ...routeToMonthsMap[route]?.[redemption.redemptionMonth],
        [flightClassCode]: {
          flightNo: redemption.flightNo,
          milesRequired: redemption.milesRequired,
          blackoutPeriod: redemption.blackoutPeriod,
        },
      },
    };
    routeToRegionMap[route] = redemption.region;
  });

  // format the result dict a little better:
  // 1. sort order
  //   a. SG outbound flights
  //   b. SG inbound flights
  //   c. all other flights
  // 2. add null to all missing entries in the dict
  const routesSorted = sortRoutesList(Object.keys(routeToMonthsMap));
  const resultFormatted = routesSorted.reduce(
    (_result: RouteAnalysis, route) => {
      const details = routeToMonthsMap[route];
      const detailsUpdated: Record<
        Month,
        Record<FlightClassCode, SingleRedemptionInfo | null>
      > = {};

      // iterate through full list of months
      months.forEach((month) => {
        const flightClassDetailsForMonth = details[month];
        detailsUpdated[month] = {
          Y: null,
          PY: null,
          J: null,
          ...flightClassDetailsForMonth,
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
    return 'PY';
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
