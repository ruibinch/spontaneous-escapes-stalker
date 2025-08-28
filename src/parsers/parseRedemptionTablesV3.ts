import { HTMLElement } from 'node-html-parser';
import { toNumber } from '../utils';
import { log, logParserError } from '../utils/log';
import { FlightClass, RedemptionTableInfo } from '../utils/types';
import { POSSIBLE_DASHES, parseBlackoutPeriod } from './parseBlackoutPeriod';
import { formatCity } from './parseRedemptionTablesV1';

const ECONOMY_SECTION_COLUMNS = [
  'FROM',
  '40% OFF MILES REQUIRED FOR ECONOMY CLASS',
  '30% OFF MILES REQUIRED FOR ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
]
const BUSINESS_SECTION_COLUMNS = [
  'FROM',
  '40% OFF MILES REQUIRED FOR BUSINESS CLASS',
  '30% OFF MILES REQUIRED FOR BUSINESS CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
]
const PREMIUM_ECONOMY_SECTION_COLUMNS = [
  'FROM',
  '40% OFF MILES REQUIRED FOR PREMIUM ECONOMY CLASS',
  '30% OFF MILES REQUIRED FOR PREMIUM ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
]

/**
 * The page layout was updated for the 2025-09 redemptions as part of the SG60 promotion initiative,
 * and the set of table columns is a one-off event.
 *
 * To monitor if this similar page layout (where each flight class has its own section and tables)
 * is continued to be used in future months.
 */
export function parseRedemptionTablesV3(
  root: HTMLElement,
): RedemptionTableInfo[] | null {
  const tables = root.getElementsByTagName('table');

  const redemptions = tables.reduce(
    (_redemptions: RedemptionTableInfo[], table) => {
      const redemptionsTableInfo = parseRedemptionTableV3(table);
      _redemptions.push(...redemptionsTableInfo);
      return _redemptions;
    },
    [],
  );

  if (redemptions.length === 0) {
    return null;
  }

  log(
    `⛏️ Scraped ${redemptions.length} redemptions from ${tables.length} tables`,
  );
  return redemptions;
}

/**
 * Parses the redemption table info into an array of RedemptionTableInfo objects.
 *
 * In this layout, each flight class has its own table.
 * Thus, the table headers are used to determine the flight class.
 */
function parseRedemptionTableV3(table: HTMLElement): RedemptionTableInfo[] {
  const head = table.getElementsByTagName('thead')[0];
  const body = table.getElementsByTagName('tbody')[0];
  if (!head || !body) {
    logParserError('Unable to find head or body element in table');
    return [];
  }

  const headers = head
    .getElementsByTagName('p')
    .map((e) => cleanCellContent(e.text));

  // Determine the flight class from the table header
  const flightClass = (() => {
    if (headers.length === 0) {
      return null;
    }
    if (isEqualArray(headers, ECONOMY_SECTION_COLUMNS)) {
      return FlightClass.ECONOMY;
    } else if (isEqualArray(headers, BUSINESS_SECTION_COLUMNS)) {
      return FlightClass.BUSINESS;
    } else if (isEqualArray(headers, PREMIUM_ECONOMY_SECTION_COLUMNS)) {
      return FlightClass.PREMIUM_ECONOMY;
    }
    return null;
  })();

  if (!flightClass) {
    logParserError(`Unable to determine flight class from table headers: ${headers.join(',')}`);
    return [];
  }

  const rows = body.getElementsByTagName('tr');
  const redemptions: RedemptionTableInfo[] = [];

  rows.forEach((row) => {
    const cellTexts = row
      .getElementsByTagName('td')
      .map((e) => cleanCellContent(e.text));

    const redemption = parseSingleEntry({
      from: cellTexts[0],
      flightClass,
      milesRequiredText: cellTexts[2],
      flightNo: cellTexts[3],
      blackoutPeriodText: cellTexts[4],
    });
    if (!redemption) {
      log(
        `Unable to parse redemption from row: ${cellTexts.join(',')}`,
        true,
      );
      return;
    }

    redemptions.push(redemption);
  });

  return redemptions;
}

function parseSingleEntry({
  from,
  flightClass,
  milesRequiredText,
  flightNo,
  blackoutPeriodText,
}: {
  from: string;
  flightClass: FlightClass;
  milesRequiredText: string;
  flightNo: string;
  blackoutPeriodText: string;
}): RedemptionTableInfo | null {
  const [origin, destination] = from.split(' to ');
  if (!origin || !destination) {
    logParserError(`Unable to obtain origin/destination from "${from}"`);
    return null;
  }

  const milesRequired = toNumber(milesRequiredText);
  const blackoutPeriod = parseBlackoutPeriod(blackoutPeriodText, {
    origin,
    destination,
    flightClass,
  });

  const isRedemptionDetailsValid =
    milesRequired > 0 && POSSIBLE_DASHES.every((dash) => flightNo !== dash);
  if (!isRedemptionDetailsValid) {
    return null;
  }

  const formatCityForFlightNo = formatCity(flightNo);

  return {
    origin: formatCityForFlightNo(origin),
    destination: formatCityForFlightNo(destination),
    flightClass,
    flightNo,
    milesRequired,
    blackoutPeriod,
  };
}

function isEqualArray(arr: string[], templateArr: string[]) {
  return arr.length === templateArr.length && arr.every((e, idx) => e.startsWith(templateArr[idx]));
}

/**
 * Cleans the cell content by:
 * - Strips any surrounding whitespace
 * - Replaces non-breaking spaces (Unicode \xa0) with regular spaces
 * - Replaces &nbsp; with regular spaces
 */
function cleanCellContent(content: string) {
  return content.replace(/\xa0/g, ' ').replace(/&nbsp;/g, ' ').trim();
}
