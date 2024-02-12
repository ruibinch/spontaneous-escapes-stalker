import fs from 'fs';
import { toNumber } from '../utils';

interface OagDataAnalysisEntry {
  month: string;
  routes: Array<{
    originIata: string;
    destinationIata: string;
    flights: Array<{
      flightNo: string;
      aircraftTypes: Array<{
        aircraftModel: string;
        totalSeats: number;
        frequency: number;
      }>;
    }>;
  }>;
}

const airlineIataMap: Record<string, string> = {
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

  const monthToRoutesDict: Record<string, OagDataAnalysisEntry['routes']> = {};

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
    const flightNo = `${airlineIataMap[carrierName]}${cells[1]}`;
    const originIataRaw = iataMap[cells[2]] ?? cells[2];
    const destinationIataRaw = iataMap[cells[3]] ?? cells[3];
    const aircraftModel = cells[4];
    const totalSeats = toNumber(cells[5]);
    const frequency = toNumber(cells[6]);
    const month = cells[7].replace('-', '');

    let originIata = originIataRaw;
    let destinationIata = destinationIataRaw;
    if (
      originIataRaw !== 'SIN' &&
      destinationIataRaw !== 'SIN' &&
      !seRoutesList.includes(`${originIataRaw}-${destinationIataRaw}`)
    ) {
      const routeIataOverride = overrideCityForMultiLegFlights({
        originIata,
        destinationIata,
        flightNo,
      });
      // Flag if there is a non-SIN origin/destination route that is not covered in the routeOverrideMap
      if (!routeIataOverride) {
        console.log(
          `🚨 Skipping ${originIata}-${destinationIata}/${flightNo} in ${month}`,
        );
        return;
      }

      originIata = routeIataOverride.originIata;
      destinationIata = routeIataOverride.destinationIata;
    }

    const routesForMonth = monthToRoutesDict[month] ?? [];
    const similarRouteForMonth = routesForMonth.find(
      (route) =>
        route.originIata === originIata &&
        route.destinationIata === destinationIata,
    );

    const flightsForSimilarRouteForMonth = similarRouteForMonth?.flights ?? [];
    const similarFlightForSimilarRouteForMonth =
      flightsForSimilarRouteForMonth.find(
        (flight) => flight.flightNo === flightNo,
      );

    const aircraftTypesForSimilarFlightForSimilarRouteForMonth =
      similarFlightForSimilarRouteForMonth?.aircraftTypes ?? [];
    const aircraftTypesForSimilarFlightForSimilarRouteForMonthCombined = [
      ...aircraftTypesForSimilarFlightForSimilarRouteForMonth,
      {
        aircraftModel,
        totalSeats,
        frequency,
      },
    ];

    const flightsForRouteForMonthCombined = [
      ...flightsForSimilarRouteForMonth,
      {
        flightNo,
        aircraftTypes:
          aircraftTypesForSimilarFlightForSimilarRouteForMonthCombined,
      },
    ];

    monthToRoutesDict[month] = [
      ...routesForMonth,
      {
        originIata,
        destinationIata,
        flights: flightsForRouteForMonthCombined,
      },
    ];
  });

  const oagDataAnalysis = Object.entries(monthToRoutesDict).map(
    ([month, routes]) => ({
      month,
      routes,
    }),
  );
  oagDataAnalysis.sort((a, b) => a.month.localeCompare(b.month));

  fs.writeFileSync(
    'data/oag-data-analysis.json',
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
 * OAG dataset treats each leg in a multi-leg flight as a standalone route, e.g. SIN-JNB, JNB-CPT for the SIN-JNB-CPT flight.
 * In the SE dataset, such entries omit the transit city in the middle, e.g. SIN-JNB, SIN-CPT for the same flight.
 *
 * Hence, we modify the OAG entry such that the origin/destination for such routes will always be SIN.
 *
 * This is only applicable to routes where the secondary leg is non-purchasable, so it excludes fifth freedom flights like FRA-JFK.
 */
function overrideCityForMultiLegFlights({
  originIata,
  destinationIata,
  flightNo,
}: {
  originIata: string;
  destinationIata: string;
  flightNo: string;
}) {
  const routeOverrideMap: Record<string, string> = {
    'ARN-DME/SQ361': 'SIN-DME', // Singapore-Stockholm-Moscow
    'DME-ARN/SQ362': 'DME-SIN', // Moscow-Stockholm-Singapore
    'MXP-BCN/SQ378': 'SIN-BCN', // Singapore-Milan-Barcelona
    'BCN-MXP/SQ377': 'BCN-SIN', // Barcelona-Milan-Singapore
    'CBR-WLG/SQ291': 'SIN-WLG', // Singapore-Canberra-Wellington
    'WLG-CBR/SQ292': 'WLG-SIN', // Wellington-Canberra-Singapore
    'CEB-DVO/MI562': 'SIN-DVO', // Singapore-Cebu-Davao
    'CEB-DVO/MI566': 'SIN-DVO', // Singapore-Cebu-Davao
    'CEB-DVO/MI588': 'SIN-DVO', // Singapore-Cebu-Davao
    'DVO-CEB/MI561': 'DVO-SIN', // Davao-Cebu-Singapore
    'DVO-CEB/MI562': 'DVO-SIN', // Davao-Cebu-Singapore
    'DVO-CEB/MI582': 'DVO-SIN', // Davao-Cebu-Singapore
    'DVO-CEB/MI588': 'DVO-SIN', // Davao-Cebu-Singapore
    'DVO-CEB/SQ906': 'SIN-CEB', // Singapore-Davao-Cebu-Singapore
    'CEB-KLO/MI577': 'SIN-KLO', // Singapore-Cebu-Kalibo
    'KLO-CEB/MI599': 'KLO-SIN', // Kalibo-Cebu-Singapore
    'CPH-FCO/SQ352': 'SIN-FCO', // Singapore-Copenhagen-Rome
    'FCO-CPH/SQ351': 'FCO-SIN', // Rome-Copenhagen-Singapore
    'DAD-SAI/MI636': 'DAD-SIN', // Singapore-Siem Reap-Da Nang
    'SAI-DAD/MI633': 'SIN-DAD', // Da Nang-Siem Reap-Singapore
    'ICN-LAX/SQ8': 'SIN-LAX', // Singapore-Incheon-Los Angeles
    'LAX-ICN/SQ7': 'LAX-SIN', // Los Angeles-Incheon-Singapore
    'JNB-CPT/SQ478': 'SIN-CPT', // Singapore-Johannesburg-Cape Town
    'CPT-JNB/SQ479': 'CPT-SIN', // Cape Town-Joahnnesburg-Singapore
    'LPQ-VTE/MI787': 'SIN-VTE', // Singapore-Luang Prabang-Vientiane
    'VTE-LPQ/MI788': 'VTE-SIN', // Vientiane-Luang Prabang-Singapore
    'MEL-WLG/SQ247': 'SIN-WLG', // Singapore-Melbourne-Wellington
    'WLG-MEL/SQ248': 'WLG-SIN', // Wellington-Melbourne-Singapore
    'RGN-MDL/MI533': 'SIN-MDL', // Singapore-Yangon-Mandalay
    'MDL-RGN/MI522': 'MDL-SIN', // Mandalay-Yangon-Singapore
    'SEA-YVR/SQ27': 'SEA-SIN', // Seattle-Vancouver-Singapore
    'YVR-SEA/SQ28': 'SIN-SEA', // Singapore-Vancouver-Seattle
    'SYD-CBR/SQ288': 'SIN-CBR', // Singapore-Sydney-Canberra-Singapore
  };

  const routeIataWithFlightNo = `${originIata}-${destinationIata}/${flightNo}`;
  const routeIataOverride = routeOverrideMap[routeIataWithFlightNo];

  if (!routeIataOverride) return null;

  return {
    originIata: routeIataOverride.split('-')[0],
    destinationIata: routeIataOverride.split('-')[1],
  };
}

if (require.main === module) {
  generateOagDataAnalysis();
}
