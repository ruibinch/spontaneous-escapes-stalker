import { HTMLElement } from 'node-html-parser';
import { log } from '../utils/log';
import { FlightClass, RedemptionTableInfo } from '../utils/types';
import { toNumber } from '../utils';
import { POSSIBLE_DASHES, parseBlackoutPeriod } from './parseBlackoutPeriod';
import { formatCity } from './parseRedemptionTablesV1';

const ECONOMY_AND_BUSINESS_SECTION_COLUMNS = [
  'FROM',
  'MILES REQUIRED FOR ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
  'MILES REQUIRED FOR BUSINESS CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
];
const PREMIUM_ECONOMY_SECTION_COLUMNS = [
  'FROM',
  'MILES REQUIRED FOR PREMIUM ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
];

/**
 * The page layout was changed on 2024-12-17, so redemptions from 202501 onwards are scraped using this method.
 */
export function parseRedemptionTablesV2(
  root: HTMLElement,
): RedemptionTableInfo[] | null {
  const tables = root.getElementsByTagName('table');

  const redemptions = tables.reduce(
    (_redemptions: RedemptionTableInfo[], table) => {
      const redemptionsTableInfo = parseRedemptionTableV2(table);
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
 *
 * V2 cells no longer contain any `<div class="data-title"></div>` elements, so we just check the length of each row to deteremine the
 * table type and the corresponding flight class.
 */
function parseRedemptionTableV2(table: HTMLElement): RedemptionTableInfo[] {
  const bodyElements = table.getElementsByTagName('tbody');
  // In the new layout from 2024-12-17, there are some <tbody> elements that contain a <th> element inside a <tbody><tr> element
  // We thus need to filter out these invalid elements
  const body = bodyElements.find((e) => {
    const rows = e.getElementsByTagName('tr');
    const hasRowHeader = rows.some(
      (row) => row.getElementsByTagName('th').length > 0,
    );
    return !hasRowHeader;
  });
  if (!body) {
    log('Unable to find body element in table', true);
    return [];
  }

  const rows = body.getElementsByTagName('tr');
  const redemptions: RedemptionTableInfo[] = [];

  rows.forEach((row) => {
    const cells = row.getElementsByTagName('td');

    if (cells.length === ECONOMY_AND_BUSINESS_SECTION_COLUMNS.length) {
      const economyRedemption = parseSingleEntry({
        from: cleanCellContent(cells[0].text),
        flightClass: FlightClass.ECONOMY,
        milesRequiredText: cleanCellContent(cells[1].text),
        flightNo: cleanCellContent(cells[2].text),
        blackoutPeriodText: cleanCellContent(cells[3].text),
      });
      if (economyRedemption) {
        redemptions.push(economyRedemption);
      }

      const businessRedemption = parseSingleEntry({
        from: cleanCellContent(cells[0].text),
        flightClass: FlightClass.BUSINESS,
        milesRequiredText: cleanCellContent(cells[4].text),
        flightNo: cleanCellContent(cells[5].text),
        blackoutPeriodText: cleanCellContent(cells[6].text),
      });
      if (businessRedemption) {
        redemptions.push(businessRedemption);
      }
    } else if (cells.length === PREMIUM_ECONOMY_SECTION_COLUMNS.length) {
      const premiumEconomyRedemption = parseSingleEntry({
        from: cleanCellContent(cells[0].text),
        flightClass: FlightClass.PREMIUM_ECONOMY,
        milesRequiredText: cleanCellContent(cells[1].text),
        flightNo: cleanCellContent(cells[2].text),
        blackoutPeriodText: cleanCellContent(cells[3].text),
      });
      if (premiumEconomyRedemption) {
        redemptions.push(premiumEconomyRedemption);
      }
    } else {
      log(
        `Unexpected number of cells in row (${cells.length}), unable to parse`,
        true,
      );
    }
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
    log(`Unable to obtain origin/destination from "${from}"`, true);
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

/**
 * Strips any surrounding whitespace, and replaces non-breaking spaces (Unicode \xa0) with regular spaces.
 */
function cleanCellContent(content: string) {
  return content.trim().replace(/\xa0/g, ' ');
}
