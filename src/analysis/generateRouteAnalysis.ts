import fs from 'fs';
import path from 'path';
import { iata } from '../lib/iata/iataCodes';
import { Redemption } from '../models/Redemption';
import { FlightClass } from '../utils/types';
import { cleanupCityFields } from './helpers/cleanupCityFields';
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

export function generateRouteAnalysis(redemptionsFilenames: string[]) {
  const months = redemptionsFilenames.map((filename) => filename.split('-')[0]);
  const result: RouteAnalysis = {};

  // create result dict from data
  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsString = fs.readFileSync(filepath).toString();
    const redemptionsPrecleaned = JSON.parse(redemptionsString) as Redemption[];
    const redemptions = cleanupCityFields(redemptionsPrecleaned);

    redemptions.forEach((redemption) => {
      const route = `${redemption.origin}-${redemption.destination}`;
      const flightClassCode = getFlightClassCode(redemption.flightClass);

      result[route] = {
        ...result[route],
        [month]: {
          ...result[route]?.[month],
          [flightClassCode]: {
            flightNo: redemption.flightNo,
            milesRequired: redemption.milesRequired,
            blackoutPeriod: redemption.blackoutPeriod,
          },
        },
      };
    });
  });

  // format the result dict a little better:
  // 1. sort order
  //   a. SG outbound flights
  //   b. SG inbound flights
  //   c. all other flights
  // 2. add null to all missing entries in the dict
  const routesSorted = sortRoutesList(Object.keys(result));
  const resultFormatted = routesSorted.reduce(
    (_result: RouteAnalysis, route) => {
      const details = result[route];
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

      return {
        from,
        to,
        fromIata,
        toIata,
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
    return 'Y';
  }
  throw new Error(`Invalid flightClass value: ${flightClass}`);
};

const getRouteIata = (route: string) => {
  const [origin, destination] = route.split('-');
  return `${iata(origin)}-${iata(destination)}`;
};
