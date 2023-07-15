import { HTMLElement } from 'node-html-parser';
import {
  FlightClass,
  RedemptionTableInfo,
  RedemptionTableInfoWithRegion,
} from '../types';
import { isAllDefined, toNumber } from '../utils';

const ACCORDIONS_CLASS_NAME = '.block-2.accordion';
const BUSINESS_AND_ECONOMY_CLASS_SECTION_NAME =
  'Business and Economy Class Redemptions';
const PREMIUM_ECONOMY_CLASS_SECTION_NAME = 'Premium Economy Class Redemptions';

export function parseRedemptionTables(root: HTMLElement) {
  const accordions = root.querySelectorAll(ACCORDIONS_CLASS_NAME);
  const businessAndEconomyClassRedemptionsSection = accordions.find((e) =>
    e.toString().match(BUSINESS_AND_ECONOMY_CLASS_SECTION_NAME),
  );
  const premiumEconomyClassRedemptionsSection = accordions.find((e) =>
    e.toString().match(PREMIUM_ECONOMY_CLASS_SECTION_NAME),
  );

  if (!businessAndEconomyClassRedemptionsSection) {
    throw new Error('Business and Economy class redemption section not found');
  }
  if (!premiumEconomyClassRedemptionsSection) {
    throw new Error('Premium Economy class redemption section not found');
  }

  const redemptionsForBusinessAndEconomyClass = parseSection(
    businessAndEconomyClassRedemptionsSection,
  );
  const redemptionsForPremiumEconomyClass = parseSection(
    premiumEconomyClassRedemptionsSection,
  );

  return [
    ...redemptionsForBusinessAndEconomyClass,
    ...redemptionsForPremiumEconomyClass,
  ];
}

/**
 * Parses a section of the HTML page; it is usually split into multiple accordions with
 * Business/Economy class in one table and Premium Economy class in another.
 */
function parseSection(section: HTMLElement): RedemptionTableInfoWithRegion[] {
  const regions = section.getElementsByTagName('h3');
  const tables = section.getElementsByTagName('table');
  if (regions.length !== tables.length) {
    throw new Error('Number of regions does not match number of tables');
  }

  const redemptions = tables.reduce(
    (_redemptions: RedemptionTableInfoWithRegion[], table, idx) => {
      const redemptionsTableInfo = parseRedemptionsTable(table);
      const region = regions[idx].text;
      const redemptionsTableInfoWithRegion = redemptionsTableInfo.map((r) => ({
        ...r,
        region,
      }));

      _redemptions.push(...redemptionsTableInfoWithRegion);
      return _redemptions;
    },
    [],
  );
  return redemptions;
}

/**
 * Parses the redemption table info into an array of RedemptionTableInfo objects.
 * Each redemption table contains the details for a single region.
 *
 * Headers (for Business and Economy Class Redemptions table):
 * - FROM
 * - MILES REQUIRED FOR ECONOMY CLASS
 * - FLIGHT NO.
 * - BLACKOUT PERIOD
 * - MILES REQUIRED FOR BUSINESS CLASS
 * - FLIGHT NO.
 * - BLACKOUT PERIOD
 *
 * Headers (for Premium Economy Class Redemptions table):
 * - FROM
 * - MILES REQUIRED FOR PREMIUM ECONOMY CLASS
 * - FLIGHT NO.
 * - BLACKOUT PERIOD
 */
function parseRedemptionsTable(table: HTMLElement) {
  const body = table.getElementsByTagName('tbody')[0];
  const rows = body.getElementsByTagName('tr');

  const redemptions: RedemptionTableInfo[] = [];

  rows.forEach((row) => {
    const cells = row.getElementsByTagName('td');

    // Assumption: "From" is always the first column
    const fromColumnDetails = extractCellDetails(cells[0]);
    const [origin, destination] = fromColumnDetails.split(' to ');
    if (!origin || !destination) {
      throw new Error('Unable to obtain origin/destination');
    }

    let flightClass: FlightClass | undefined;
    let milesRequired: number | undefined;
    let flightNo: string | undefined;
    let blackoutPeriod: string | undefined;

    cells.slice(1).forEach((cell) => {
      const hasKeyword = isCellContaining(cell);

      if (hasKeyword('PREMIUM ECONOMY')) {
        flightClass = FlightClass.PREMIUM_ECONOMY;
      } else if (hasKeyword('ECONOMY')) {
        flightClass = FlightClass.ECONOMY;
      } else if (hasKeyword('BUSINESS')) {
        flightClass = FlightClass.BUSINESS;
      }
      if (hasKeyword('MILES REQUIRED')) {
        const milesRequiredDetail = extractCellDetails(cell);
        milesRequired = toNumber(milesRequiredDetail);
      }
      if (hasKeyword('FLIGHT NO')) {
        flightNo = extractCellDetails(cell);
      }
      if (hasKeyword('BLACKOUT')) {
        blackoutPeriod = extractCellDetails(cell);
      }

      // Assumption: all relevant details are contiguous entries in a single row
      // This method is more resistant to changes in table structure
      if (isAllDefined(flightClass, milesRequired, flightNo, blackoutPeriod)) {
        const isRedemptionDetailsValid =
          flightClass &&
          milesRequired &&
          milesRequired > 0 &&
          flightNo &&
          flightNo !== '-';

        if (isRedemptionDetailsValid) {
          redemptions.push({
            origin,
            destination,
            // @ts-expect-error value ascertained to be defined
            flightClass,
            // @ts-expect-error value ascertained to be defined
            milesRequired,
            // @ts-expect-error value ascertained to be defined
            flightNo,
            // @ts-expect-error value ascertained to be defined
            blackoutPeriod,
          });
        }

        // reset values
        flightClass = undefined;
        milesRequired = undefined;
        flightNo = undefined;
        blackoutPeriod = undefined;
      }
    });
  });

  return redemptions;
}

const extractCellDetails = (cell: HTMLElement) => {
  const cellInfo = cell.text.split('\n').filter(Boolean);
  return cellInfo[cellInfo.length - 1];
};

const isCellContaining = (cell: HTMLElement) => (keyword: string) => {
  return new RegExp(keyword).test(cell.text);
};
