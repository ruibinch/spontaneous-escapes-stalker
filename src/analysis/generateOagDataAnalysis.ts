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

export function generateOagDataAnalysis() {
  const oagDataFileContent = fs
    .readFileSync('data/oag-data.tsv')
    .toString()
    .split('\r\n');

  const monthToRoutesDict: Record<string, OagDataAnalysisEntry['routes']> = {};

  oagDataFileContent
    .slice(1)
    .filter((row) => {
      const [carrierName] = row.split('\t');
      return Object.keys(airlineIataMap).includes(carrierName);
    })
    .forEach((row) => {
      const cells = row.split('\t');
      const carrierName = cells[0];
      const flightNo = `${airlineIataMap[carrierName]}${cells[1]}`;
      const originIata = cells[2];
      const destinationIata = cells[3];
      const aircraftModel = cells[4];
      const totalSeats = toNumber(cells[5]);
      const frequency = toNumber(cells[6]);
      const month = cells[7].replace('-', '');

      const routesForMonth = monthToRoutesDict[month] ?? [];
      const similarRouteForMonth = routesForMonth.find(
        (route) =>
          route.originIata === originIata &&
          route.destinationIata === destinationIata,
      );

      const flightsForSimilarRouteForMonth =
        similarRouteForMonth?.flights ?? [];
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

if (require.main === module) {
  generateOagDataAnalysis();
}
