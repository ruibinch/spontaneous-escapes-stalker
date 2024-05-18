import { getCountryFromCity } from '../lib/iata/getCountryFromCity';
import { iata } from '../lib/iata/iata';
import { iataMappings } from '../lib/iata/mappings';
import { OagDataAnalysisEntry } from '../scripts/generateOagData';
import {
  BlackoutPeriod,
  FlightClass,
  RedemptionJsonPostprocessed,
} from '../utils/types';
import { sortRoutesList } from './helpers/sortRoutesList';
import { FlightClassCode, Month, Route } from './types';

type RedemptionInfoSingle = {
  flightNos: string[];
  milesRequired: number;
  blackoutPeriod: BlackoutPeriod[];
  blackoutPct: number;
};
type RedemptionByFlightClass = Record<
  FlightClassCode,
  RedemptionInfoSingle | null
>;
type Details = {
  redemptionDetails?: Partial<RedemptionByFlightClass>;
  flightDetails?: {
    sia: boolean;
    silkair: boolean;
  };
};

type DetailsForMonth = Details & { month: Month };
type RouteAnalysisDict = Record<Route, Record<Month, Details>>;
type RouteAnalysisEntry = {
  from: string;
  to: string;
  fromIata: string;
  toIata: string;
  fromCountry: string;
  toCountry: string;
  region: string;
  details: DetailsForMonth[];
};

export function generateRouteAnalysis({
  redemptions,
  months,
  oagDataAnalysis,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  months: string[];
  oagDataAnalysis: OagDataAnalysisEntry[];
}): RouteAnalysisEntry[] {
  const routeAnalysisDict: RouteAnalysisDict = {};
  const routeToRegionMap: Record<string, string> = {};

  // create routeAnalysisDict from redemptions data
  redemptions.forEach((redemption) => {
    const route = `${redemption.origin}-${redemption.destination}`;
    const flightClassCode = getFlightClassCode(redemption.flightClass);

    const redemptionInfoForFlightClass: RedemptionInfoSingle = {
      flightNos: redemption.flightNos,
      milesRequired: redemption.milesRequired,
      blackoutPeriod: redemption.blackoutPeriod,
      blackoutPct: redemption.blackoutPct,
    };
    // prettier-ignore
    routeAnalysisDict[route] = {
      ...routeAnalysisDict[route],
      [redemption.redemptionMonth]: {
        ...routeAnalysisDict[route]?.[redemption.redemptionMonth],
        redemptionDetails: {
          ...routeAnalysisDict[route]?.[redemption.redemptionMonth]?.redemptionDetails,
          [flightClassCode]: redemptionInfoForFlightClass,
        },
      },
    };
    routeToRegionMap[route] = redemption.region;
  });

  // add OAG data to routeAnalysisDict
  oagDataAnalysis.forEach(({ month, routes }) => {
    routes.forEach((routeEntry) => {
      const [fromIata, toIata] = routeEntry.route.split('-');
      const from = iataMappings[fromIata];
      const to = iataMappings[toIata];
      if (!from || !to) {
        throw new Error(
          `from=(${from}, ${fromIata})/to=(${to}, ${toIata}) does not exist in iataMappings`,
        );
      }
      const routeFullname = `${from}-${to}`;

      const hasSiaFlights = routeEntry.flightNos.some(({ flightNo }) =>
        flightNo.startsWith('SQ'),
      );
      const hasSilkairFlights = routeEntry.flightNos.some(({ flightNo }) =>
        flightNo.startsWith('MI'),
      );

      routeAnalysisDict[routeFullname] = {
        ...routeAnalysisDict[routeFullname],
        [month]: {
          ...routeAnalysisDict[routeFullname]?.[month],
          flightDetails: {
            sia: hasSiaFlights,
            silkair: hasSilkairFlights,
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
  // 2. add null to redemptionDetails object
  const routesSorted = sortRoutesList(Object.keys(routeAnalysisDict));
  const resultFormatted = routesSorted.reduce(
    (_result: RouteAnalysisDict, route) => {
      const details = routeAnalysisDict[route];
      const detailsUpdated: Record<Month, Details> = {};

      // iterate through full list of months
      months.forEach((month) => {
        detailsUpdated[month] = {
          ...details[month],
          redemptionDetails: {
            Y: null,
            W: null,
            J: null,
            ...details[month]?.redemptionDetails,
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
      const fromCountry = getCountryFromCity(from);
      const toCountry = getCountryFromCity(to);

      const detailsList = Object.entries(details).reduce(
        (_detailsList: DetailsForMonth[], [month, detailsInfo]) => {
          _detailsList.push({
            month,
            ...detailsInfo,
          });
          return _detailsList;
        },
        [],
      );

      const routeAnalysisEntry: RouteAnalysisEntry = {
        from,
        to,
        fromIata,
        toIata,
        fromCountry,
        toCountry,
        region,
        details: detailsList,
      };
      return routeAnalysisEntry;
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
