import fs from 'fs';
import { toNumber } from '../utils';

type Route = `${string}-${string}`;
type FlightNo = `${'SQ' | 'MI'}${string}`;
type AircraftType = {
  aircraftModel: string;
  totalSeats: number;
  frequency: number;
};
type FlightNoToAircraftTypesMap = Record<FlightNo, AircraftType[]>;
type RouteToFlightNoToAircraftTypesMap = Record<
  Route,
  FlightNoToAircraftTypesMap
>;

export interface OagDataAnalysisEntry {
  month: string;
  routes: Array<{
    route: string;
    flightNos: Array<{
      flightNo: string;
      details: AircraftType[];
    }>;
  }>;
}

const airlineIataMap: Record<string, 'SQ' | 'MI'> = {
  'Singapore Airlines': 'SQ',
  SilkAir: 'MI',
};

// Some cities have old and new airports, in which case we map the old IATA to the new IATA
const iataMap: Record<string, string> = {
  REP: 'SAI', // Siem Reap
  JOG: 'YIA', // Yogyakarta
  CTU: 'TFU', // All Chengdu airports are standardised to TFU for now; TODO: to improve
  HND: 'NRT', // All Tokyo airports are standardised to NRT for now; TODO: to improve
};

export function generateOagDataAnalysis() {
  const oagDataFileContent = fs
    .readFileSync('data/oag-data.tsv')
    .toString()
    .split('\r\n');
  const seRoutesList = getSERoutesList();

  const monthToRoutesMap: Record<string, RouteToFlightNoToAircraftTypesMap> =
    {};

  console.log(`🔍 ${oagDataFileContent.length} entries found in OAG dataset`);
  console.log(`🔧 Filtering out non-SIA/SilkAir flights`);
  console.log(`🔧 Filtering out codeshare flights`);
  const oagDataFileContentFiltered = oagDataFileContent
    .slice(1)
    .filter((row) => {
      const cells = row.split('\t');
      const carrierName = cells[0];
      const flightNo = cells[1];

      const siaOrSilkAirFlightsOnly =
        Object.keys(airlineIataMap).includes(carrierName);
      const nonCodeshareFlightsOnly = flightNo.length <= 3;

      return siaOrSilkAirFlightsOnly && nonCodeshareFlightsOnly;
    });
  console.log(
    `💿 Processing ${oagDataFileContentFiltered.length}/${oagDataFileContent.length} entries\n`,
  );

  oagDataFileContentFiltered.forEach((row) => {
    const cells = row.split('\t');
    const carrierName = cells[0];
    const flightNo = `${airlineIataMap[carrierName]}${cells[1]}` as const;
    const originIata = iataMap[cells[2]] ?? cells[2];
    const destinationIata = iataMap[cells[3]] ?? cells[3];
    const aircraftModel = cells[4];
    const totalSeats = toNumber(cells[5]);
    const frequency = toNumber(cells[6]);
    const month = cells[7].replace('-', '');
    const routeIata = `${originIata}-${destinationIata}` as const;

    // Get routes associated with this row entry
    // Most of the time it's a 1:1 mapping, however there are some exceptions for round-trip flights with multiple stops
    // e.g. SQ906 flies SIN-DVO-CEB-SIN, so the DVO-CEB leg maps to both SIN-CEB and DVO-SIN routes
    const routesForRow: Route[] = (() => {
      if (
        originIata !== 'SIN' &&
        destinationIata !== 'SIN' &&
        !seRoutesList.includes(routeIata)
      ) {
        const routeIataOverride = getRouteOverrideForNonSgFlights({
          routeIata,
          flightNo,
        });
        // Flag if there is a route that is not covered in the routeOverrideMap
        if (!routeIataOverride) {
          console.log(
            `🚨 Skipping ${originIata}-${destinationIata}/${flightNo} in ${month}`,
          );
          return [];
        }

        return routeIataOverride;
      }

      return [routeIata];
    })();

    const routesForMonth = monthToRoutesMap[month] ?? [];

    routesForRow.forEach((routeEntry) => {
      const routeForMonth = routesForMonth[routeEntry] ?? {};
      const flightNoForRouteForMonth = routeForMonth?.[flightNo] ?? [];

      const flightNoDetailsForRouteForMonthCombined = [
        ...flightNoForRouteForMonth,
        {
          aircraftModel,
          totalSeats,
          frequency,
        },
      ];

      routeForMonth[flightNo] = flightNoDetailsForRouteForMonthCombined;
      routesForMonth[routeEntry] = routeForMonth;
      monthToRoutesMap[month] = routesForMonth;
    });
  });

  // restructure to array for a better representation of the data
  const oagDataAnalysis = Object.entries(monthToRoutesMap).map(
    ([month, routes]) => {
      const routesList = Object.entries(routes).reduce(
        (
          _routesList: OagDataAnalysisEntry['routes'],
          [route, flightNosForRoutes],
        ) => {
          const flightNosList = Object.entries(flightNosForRoutes).reduce(
            (
              _flightNosList: OagDataAnalysisEntry['routes'][0]['flightNos'],
              [flightNo, flightNoDetails],
            ) => {
              _flightNosList.push({ flightNo, details: flightNoDetails });
              return _flightNosList;
            },
            [],
          );

          _routesList.push({ route, flightNos: flightNosList });
          return _routesList;
        },
        [],
      );

      return {
        month,
        routes: routesList,
      };
    },
  );
  oagDataAnalysis.sort((a, b) => a.month.localeCompare(b.month));

  fs.writeFileSync(
    'data/oag-data.json',
    JSON.stringify(oagDataAnalysis, null, 2),
  );
}

/**
 * route-analysis.json contains all of the routes that have been featured on SE.
 */
function getSERoutesList(): string[] {
  const routesAnalysisFilepath = 'data/route-analysis.json';
  const routesAnalysisFileString = fs
    .readFileSync(routesAnalysisFilepath)
    .toString();
  const routesAnalysis = JSON.parse(routesAnalysisFileString) as Array<{
    fromIata: string;
    toIata: string;
  }>;

  return routesAnalysis.map((entry) => `${entry.fromIata}-${entry.toIata}`);
}

/**
 * There are some routes that do not have SIN as an origin/destination.
 *
 * Some of these are fifth freedom flights, where tickets are purchasable/redeemable, e.g. FRA-JFK.
 * Others are multi-leg flights which stop briefly in a city before continuing on to another city, but the individual legs are not purchasable/redeemable.
 *
 * These legs are treated as a standalone route in the OAG dataset, e.g. SIN-JNB, JNB-CPT for the SIN-JNB-CPT flight.
 * In the SE dataset however, such entries omit the transit city in the middle, e.g. SIN-JNB, SIN-CPT for the same flight.
 *
 * Hence, we modify the OAG entry such that the origin/destination for such routes will always be SIN.
 */
function getRouteOverrideForNonSgFlights({
  routeIata,
  flightNo,
}: {
  routeIata: Route;
  flightNo: FlightNo;
}) {
  const routeOverrideMap: Record<`${Route}/${FlightNo}`, Route[]> = {
    'ARN-DME/SQ361': ['SIN-DME'], // Singapore-Stockholm-Moscow
    'DME-ARN/SQ362': ['DME-SIN'], // Moscow-Stockholm-Singapore
    'MXP-BCN/SQ378': ['SIN-BCN'], // Singapore-Milan-Barcelona
    'BCN-MXP/SQ377': ['BCN-SIN'], // Barcelona-Milan-Singapore
    'CBR-WLG/SQ291': ['SIN-WLG'], // Singapore-Canberra-Wellington
    'WLG-CBR/SQ292': ['WLG-SIN'], // Wellington-Canberra-Singapore
    'CEB-DVO/MI562': ['SIN-DVO'], // Singapore-Cebu-Davao
    'CEB-DVO/MI566': ['SIN-DVO'], // Singapore-Cebu-Davao
    'CEB-DVO/MI588': ['SIN-DVO'], // Singapore-Cebu-Davao
    'DVO-CEB/MI561': ['DVO-SIN'], // Davao-Cebu-Singapore
    'DVO-CEB/MI562': ['DVO-SIN'], // Davao-Cebu-Singapore
    'DVO-CEB/MI582': ['DVO-SIN'], // Davao-Cebu-Singapore
    'DVO-CEB/MI588': ['DVO-SIN'], // Davao-Cebu-Singapore
    'DVO-CEB/SQ906': ['SIN-CEB', 'DVO-SIN'], // Singapore-Davao-Cebu-Singapore
    'CEB-KLO/MI577': ['SIN-KLO'], // Singapore-Cebu-Kalibo
    'KLO-CEB/MI599': ['KLO-SIN'], // Kalibo-Cebu-Singapore
    'CPH-FCO/SQ352': ['SIN-FCO'], // Singapore-Copenhagen-Rome
    'FCO-CPH/SQ351': ['FCO-SIN'], // Rome-Copenhagen-Singapore
    'DAD-SAI/MI636': ['DAD-SIN'], // Singapore-Siem Reap-Da Nang
    'SAI-DAD/MI633': ['SIN-DAD'], // Da Nang-Siem Reap-Singapore
    'ICN-LAX/SQ8': ['SIN-LAX'], // Singapore-Incheon-Los Angeles
    'LAX-ICN/SQ7': ['LAX-SIN'], // Los Angeles-Incheon-Singapore
    'JNB-CPT/SQ478': ['SIN-CPT'], // Singapore-Johannesburg-Cape Town
    'CPT-JNB/SQ479': ['CPT-SIN'], // Cape Town-Joahnnesburg-Singapore
    'LPQ-VTE/MI787': ['SIN-VTE', 'LPQ-SIN'], // Singapore-Luang Prabang-Vientiane-Singapore
    'VTE-LPQ/MI788': ['SIN-LPQ', 'VTE-SIN'], // Singapore-Vientiane-Luang Prabang-Singapore (https://aviability.com/flight-number/flight-mi788-silkair)
    'MEL-WLG/SQ247': ['SIN-WLG'], // Singapore-Melbourne-Wellington
    'WLG-MEL/SQ248': ['WLG-SIN'], // Wellington-Melbourne-Singapore
    'RGN-MDL/MI533': ['SIN-MDL'], // Singapore-Yangon-Mandalay
    'MDL-RGN/MI522': ['MDL-SIN'], // Mandalay-Yangon-Singapore
    'SEA-YVR/SQ27': ['SEA-SIN'], // Seattle-Vancouver-Singapore
    'YVR-SEA/SQ28': ['SIN-SEA'], // Singapore-Vancouver-Seattle
    'SYD-CBR/SQ288': ['SIN-CBR', 'SYD-SIN'], // Singapore-Sydney-Canberra-Singapore
  };

  const routeIataWithFlightNo = `${routeIata}/${flightNo}` as const;
  const routeIataOverride = routeOverrideMap[routeIataWithFlightNo] as
    | Route[]
    | undefined;
  return routeIataOverride;
}

if (require.main === module) {
  generateOagDataAnalysis();
}
