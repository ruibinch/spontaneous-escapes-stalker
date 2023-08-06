import fs from 'fs';
import path from 'path';
import { Redemption } from './models/Redemption';

type City = string;
type Month = string;
type FlightClassCode = string;
type RedemptionAnalysisResult = Record<
  City,
  Record<Month, Record<FlightClassCode, boolean>>
>;

// to fix any casing/naming discrepancies
const destinationMap: Record<string, string> = {
  'Ho Chi Minh': 'Ho Chi Minh City',
  'Kuala lumpur': 'Kuala Lumpur',
};
const flightClassToCodeMap = {
  Economy: 'Y',
  'Premium Economy': 'PY',
  Business: 'J',
};

const flattenDeep = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? arr.reduce((a, b) => a.concat(flattenDeep(b)), [])
    : [arr];
const formatValue = (value: boolean) => (value ? 'X' : '');

(() => {
  const redemptionsFiles = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));
  const months = redemptionsFiles.map((filename) => filename.split('-')[0]);
  const flightClassCodes = Object.values(flightClassToCodeMap);

  const result: RedemptionAnalysisResult = {};

  // create result dict from data
  redemptionsFiles.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsString = fs.readFileSync(filepath).toString();
    const redemptions = JSON.parse(redemptionsString) as Redemption[];

    const outboundRedemptions = redemptions.filter(
      (redemption) => redemption.origin === 'Singapore',
    );
    outboundRedemptions.forEach((redemption) => {
      const destination =
        destinationMap[redemption.destination] ?? redemption.destination;
      // @ts-expect-error "First" is intentionally excluded as it's not applicable for spontaneous escapes
      const flightClassCode = flightClassToCodeMap[redemption.flightClass];

      result[destination] = {
        ...result[destination],
        [month]: {
          ...result[destination]?.[month],
          [flightClassCode]: true,
        },
      };
    });
  });

  // format the result dict a little better:
  // 1. sort cities in alphabetical order
  // 2. add false to all missing entries in the dict
  const resultFormatted = Object.keys(result)
    .sort()
    .reduce((_result: RedemptionAnalysisResult, city) => {
      const details = result[city];
      const detailsUpdated: Record<
        Month,
        Record<FlightClassCode, boolean>
      > = {};

      // iterate through full list of months
      months.forEach((month) => {
        const flightClassDetailsForMonth = details[month];
        detailsUpdated[month] = {
          Y: false,
          PY: false,
          J: false,
          ...flightClassDetailsForMonth,
        };
      });

      _result[city] = detailsUpdated;
      return _result;
    }, {});

  // consolidate results by flight class
  let results: Record<'all' | 'Y' | 'PY' | 'J', string[]> = {
    all: [],
    Y: [],
    PY: [],
    J: [],
  };

  Object.entries(resultFormatted).forEach(([city, details]) => {
    const detailsForMonths = Object.values(details);
    const detailsCsvAll = detailsForMonths.map((detailsForMonth) =>
      Object.values(detailsForMonth).map(formatValue),
    );
    const detailsCsvY = detailsForMonths.map((detailsForMonth) =>
      formatValue(detailsForMonth['Y']),
    );
    const detailsCsvPY = detailsForMonths.map((detailsForMonth) =>
      formatValue(detailsForMonth['PY']),
    );
    const detailsCsvJ = detailsForMonths.map((detailsForMonth) =>
      formatValue(detailsForMonth['J']),
    );

    results.all.push([city, ...flattenDeep(detailsCsvAll)].join(','));
    results.Y.push([city, ...detailsCsvY].join(','));
    results.PY.push([city, ...detailsCsvPY].join(','));
    results.J.push([city, ...detailsCsvJ].join(','));
  });

  // save results
  const headerAll = flattenDeep([
    'City',
    months.map((month) => flightClassCodes.map((code) => `${month}_${code}`)),
  ]);
  const headerIndividual = ['City', ...months.map((month) => `${month}`)];
  const csvAll = [headerAll, ...results.all].join('\r\n');
  const csvY = [headerIndividual, ...results.Y].join('\r\n');
  const csvPY = [headerIndividual, ...results.PY].join('\r\n');
  const csvJ = [headerIndividual, ...results.J].join('\r\n');
  fs.writeFileSync('data/analysis-all.csv', csvAll);
  fs.writeFileSync('data/analysis-Y.csv', csvY);
  fs.writeFileSync('data/analysis-PY.csv', csvPY);
  fs.writeFileSync('data/analysis-J.csv', csvJ);
})();
