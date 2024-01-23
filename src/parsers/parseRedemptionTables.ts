import { HTMLElement } from 'node-html-parser';
import {
  BlackoutPeriod,
  FlightClass,
  RedemptionTableInfo,
  RedemptionTableInfoWithRegion,
} from '../utils/types';
import { isAllDefined, toNumber } from '../utils';
import { POSSIBLE_DASHES, parseBlackoutPeriod } from './parseBlackoutPeriod';
import { dedupeRedemptions } from './dedupeRedemptions';

const ACCORDIONS_CLASS_NAME = '.block-2.accordion';
const BUSINESS_AND_ECONOMY_CLASS_SECTION_NAME =
  />Business and Economy Class Redemptions</i;
const PREMIUM_ECONOMY_CLASS_SECTION_NAME =
  />Premium Economy Class Redemptions</i;
const SINGAPORE_AIRLINES_DESTINATIONS_SECTION_NAME =
  />Singapore Airlines Destinations</i;
const SINGAPORE_AIRLINES_SECTION_NAME = />Singapore Airlines</i;
const SILKAIR_DESTINATIONS_SECTION_NAME = />SilkAir Destinations</i;

/**
 * Extracts the relevant sections based on accordion style for further parsing.
 *
 * The list of accordions in the post-Covid layout is:
 *   - Business and Economy Class Redemptions
 *   - Premium Economy Class Redemptions
 *   - How to Redeem
 *   - Terms and Conditions,
 * from which we extract the first 2 accordions.
 *
 * The list of accordions in the pre-Covid and post-Jun 2019 layout is:
 *   - Singapore Airlines Destinations
 *   - SilkAir Destinations
 *   - Premium Economy Class Redemptions
 *   - How to Redeem
 *   - Terms and Conditions,
 * from which we extract the first 3 accordions.
 *
 * The list of accordions in the pre-Covid and pre-Jun 2019 layout is:
 *   - Singapore Airlines
 *   - SilkAir
 *   - Terms and Conditions,
 * from which we extract the first 2 accordions.
 *
 * @param root
 * @returns
 */
export function parseRedemptionTables(root: HTMLElement) {
  const accordions = root.querySelectorAll(ACCORDIONS_CLASS_NAME);
  const businessAndEconomyClassRedemptionsSection = accordions.find((e) =>
    e.toString().match(BUSINESS_AND_ECONOMY_CLASS_SECTION_NAME),
  );
  const premiumEconomyClassRedemptionsSection = accordions.find((e) =>
    e.toString().match(PREMIUM_ECONOMY_CLASS_SECTION_NAME),
  );
  const singaporeAirlinesDestinationsSection = accordions.find((e) =>
    e.toString().match(SINGAPORE_AIRLINES_DESTINATIONS_SECTION_NAME),
  );
  const silkairDestinationsSection = accordions.find((e) =>
    e.toString().match(SILKAIR_DESTINATIONS_SECTION_NAME),
  );
  const singaporeAirlinesSection = accordions.find((e) =>
    e.toString().match(SINGAPORE_AIRLINES_SECTION_NAME),
  );

  const redemptionsForBusinessAndEconomyClassSection = parseSection(
    businessAndEconomyClassRedemptionsSection,
  );
  const redemptionsForSingaporeAirlinesDestinationsSection = parseSection(
    singaporeAirlinesDestinationsSection,
  );
  const redemptionsForSingaporeAirlinesSection = parseSection(
    singaporeAirlinesSection,
  );
  const redemptionsForPremiumEconomyClassSection = parseSection(
    premiumEconomyClassRedemptionsSection,
  );
  const redemptionsForSilkairDestinationsSection = parseSection(
    silkairDestinationsSection,
  );

  console.log(
    [
      '⛏️ Number of redemptions scraped from each section',
      `  • Business and Economy Class Redemptions: ${redemptionsForBusinessAndEconomyClassSection.length}`,
      `  • Premium Economy Class Redemptions: ${redemptionsForPremiumEconomyClassSection.length}`,
      `  • Singapore Airlines Destinations: ${redemptionsForSingaporeAirlinesDestinationsSection.length}`,
      `  • SilkAir Destinations: ${redemptionsForSilkairDestinationsSection.length}`,
      `  • Singapore Airlines: ${redemptionsForSingaporeAirlinesSection.length}\n`,
    ].join('\n'),
  );

  const redemptionsCombined = [
    ...redemptionsForBusinessAndEconomyClassSection,
    ...redemptionsForSingaporeAirlinesDestinationsSection,
    ...redemptionsForSingaporeAirlinesSection,
    ...redemptionsForPremiumEconomyClassSection,
    ...redemptionsForSilkairDestinationsSection,
  ];
  const redemptionsDeduped = dedupeRedemptions(redemptionsCombined);
  console.log(
    `🧹 Deduplicated ${redemptionsCombined.length} redemptions to ${redemptionsDeduped.length} redemptions\n`,
  );
  return redemptionsDeduped;
}

/**
 * Parses a section of the HTML page; it is usually split into multiple accordions with
 * Business/Economy class in one table and Premium Economy class in another.
 */
function parseSection(
  section: HTMLElement | undefined,
): RedemptionTableInfoWithRegion[] {
  if (!section) return [];

  const regions = section.getElementsByTagName('h3');
  const tables = section.getElementsByTagName('table');
  if (regions.length !== tables.length) {
    throw new Error('Number of regions does not match number of tables');
  }

  const redemptions = tables.reduce(
    (_redemptions: RedemptionTableInfoWithRegion[], table, idx) => {
      const redemptionsTableInfo = parseRedemptionTable(table);
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
function parseRedemptionTable(table: HTMLElement) {
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
    let blackoutPeriod: BlackoutPeriod[] | undefined;

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
      // some old pages use "FLIGHT NUMBER" instead of "FLIGHT NO"
      if (hasKeyword('FLIGHT NO') || hasKeyword('FLIGHT NUMBER')) {
        flightNo = extractCellDetails(cell);
      }
      // some old pages use "BLACK OUT PERIOD" instead of "BLACKOUT PERIOD"
      if (hasKeyword('BLACKOUT') || hasKeyword('BLACK OUT')) {
        const blackoutPeriodRaw = extractCellDetails(cell);
        blackoutPeriod = parseBlackoutPeriod(blackoutPeriodRaw);
      }

      // Assumption: all relevant details are contiguous entries in a single row
      // This method is more resistant to changes in table structure
      if (isAllDefined(flightClass, milesRequired, flightNo, blackoutPeriod)) {
        const isRedemptionDetailsValid =
          flightClass &&
          milesRequired &&
          milesRequired > 0 &&
          flightNo &&
          POSSIBLE_DASHES.every((dash) => flightNo !== dash);

        // @ts-expect-error value ascertained to be defined
        const formatCityForFlightNo = formatCity(flightNo);

        if (isRedemptionDetailsValid) {
          redemptions.push({
            origin: formatCityForFlightNo(origin),
            destination: formatCityForFlightNo(destination),
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

/**
 * Some cities have multiple international airports, so we require the flight number to determine the specific airport to be added as a suffix.
 */
export const formatCity = (flightNo: string) => (city: string) => {
  const cityToAirportMapping: Record<string, Record<string, string>> = {
    Tokyo: {
      SQ11: 'Narita',
      SQ12: 'Narita',
      SQ631: 'Haneda',
      SQ634: 'Haneda',
      SQ635: 'Haneda',
      SQ636: 'Haneda',
      SQ637: 'Narita',
      SQ638: 'Narita',
    },
  };

  const cityAirport = cityToAirportMapping[city]?.[flightNo];
  return cityAirport ? `${city} (${cityAirport})` : city;
};

const extractCellDetails = (cell: HTMLElement) => {
  const cellInfo = cell.text.split('\n').filter(Boolean);
  return cellInfo[cellInfo.length - 1];
};

const isCellContaining = (cell: HTMLElement) => (keyword: string) => {
  return new RegExp(keyword).test(cell.text);
};
