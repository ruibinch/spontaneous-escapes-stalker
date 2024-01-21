import fs from 'fs';
import { toNumber } from '../utils';
import { POSSIBLE_DASHES, parseBlackoutPeriod } from './parseBlackoutPeriod';
import { Redemption, RedemptionInputProps } from '../models/Redemption';
import { FlightClass, RedemptionJson } from '../utils/types';
import { subDays } from 'date-fns';
import { formatCity } from './parseRedemptionTables';

process.env.TZ = 'UTC';

// Should be in the format `data/YYYYMM-content.tsv`
const TSV_FILEPATH = process.env['TSV_FILEPATH'];
const TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS = [
  'REGION',
  'FROM',
  'MILES REQUIRED FOR ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
  'MILES REQUIRED FOR BUSINESS CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
];
const TSV_PREMIUM_ECONOMY_SECTION_COLUMNS = [
  'REGION',
  'FROM',
  'MILES REQUIRED FOR PREMIUM ECONOMY CLASS',
  'FLIGHT NO.',
  'BLACKOUT PERIOD',
];

/**
 * Parses from a TSV file that mirrors the structure of the table in the SE page.
 * The TSV file can contain up to 2 header rows in the formats defined in the above 2 arrays.
 * NOTE: the Business/Economy section must be above the Premium Economy section in the TSV file.
 *
 * This function is closely similar to the parseRedemptionTable function, where both share the parsing logic but operate on different eleement types.
 *
 * Then adds the parsed redemptions to a new/existing redemptions JSON file.
 */
function parseFromTsvFile() {
  if (!TSV_FILEPATH) {
    throw new Error('Specify a TSV_FILEPATH variable when running this script');
  }
  const redemptionPeriod = TSV_FILEPATH.match(/\d{6}/)?.[0];
  if (!redemptionPeriod) {
    throw new Error(
      'Ensure that TSV_FILEPATH variable is in the format `data/YYYYMM-content.tsv`',
    );
  }
  const redemptionPeriodStart = new Date(
    `${redemptionPeriod.slice(0, 4)}-${redemptionPeriod.slice(4, 6)}-01`,
  );
  const redemptionEndDate = new Date(
    subDays(redemptionPeriodStart, 1).toISOString().split('T')[0],
  );

  const tsvFileContent = fs.readFileSync(TSV_FILEPATH).toString().split('\r\n');
  const businessAndEconomyClassHeaderRowIdx = getHeaderRowIdx(
    tsvFileContent,
    TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS,
  );
  const premiumEconomyClassHeaderRowIdx = getHeaderRowIdx(
    tsvFileContent,
    TSV_PREMIUM_ECONOMY_SECTION_COLUMNS,
  );

  const businessAndEconomyClassSectionRows =
    businessAndEconomyClassHeaderRowIdx !== undefined
      ? tsvFileContent.slice(
          businessAndEconomyClassHeaderRowIdx,
          premiumEconomyClassHeaderRowIdx,
        )
      : [];
  const premiumEconomyClassSectionRows =
    premiumEconomyClassHeaderRowIdx !== undefined
      ? tsvFileContent.slice(premiumEconomyClassHeaderRowIdx)
      : [];

  const redemptionsData = [
    ...parseSection(businessAndEconomyClassSectionRows, 'J/Y'),
    ...parseSection(premiumEconomyClassSectionRows, 'PY'),
  ].map((redemption) => ({
    ...redemption,
    redemptionEndDate,
  }));

  createOrUpdateRedemptionsFile({ redemptionPeriod, redemptionsData });
}

/**
 * Parses an individual "section" of the TSV corresponding to either the Business/Economy Class section or Premium Economy class section.
 * First row is the header row.
 */
function parseSection(rows: string[], flightClassCategory: 'J/Y' | 'PY') {
  const redemptions: Omit<RedemptionInputProps, 'redemptionEndDate'>[] = [];

  // skip the header row
  rows.slice(1).forEach((row) => {
    // only consider filled cells
    const cells = row.split('\t').filter((cell) => cell !== '');
    // skip empty rows
    if (cells.length === 0) {
      return;
    }

    if (flightClassCategory === 'J/Y') {
      if (cells.length !== TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS.length) {
        throw new Error(
          `Mismatch in number of cells for J/Y section - expected ${TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS.length} but received ${cells.length} (${cells})`,
        );
      }

      const economyRedemption = parseSingleEntry({
        region: cells[0],
        from: cells[1],
        flightClass: FlightClass.ECONOMY,
        milesRequiredText: cells[2],
        flightNo: cells[3],
        blackoutPeriodText: cells[4],
      });
      const businessRedemption = parseSingleEntry({
        region: cells[0],
        from: cells[1],
        flightClass: FlightClass.BUSINESS,
        milesRequiredText: cells[5],
        flightNo: cells[6],
        blackoutPeriodText: cells[7],
      });
      if (economyRedemption) {
        redemptions.push(economyRedemption);
      }
      if (businessRedemption) {
        redemptions.push(businessRedemption);
      }
    }

    if (flightClassCategory === 'PY') {
      if (cells.length !== TSV_PREMIUM_ECONOMY_SECTION_COLUMNS.length) {
        throw new Error(
          `Mismatch in number of cells for PY section - expected ${TSV_PREMIUM_ECONOMY_SECTION_COLUMNS.length} but received ${cells.length}`,
        );
      }

      const premiumEconomyRedemption = parseSingleEntry({
        region: cells[0],
        from: cells[1],
        flightClass: FlightClass.PREMIUM_ECONOMY,
        milesRequiredText: cells[2],
        flightNo: cells[3],
        blackoutPeriodText: cells[4],
      });
      if (premiumEconomyRedemption) {
        redemptions.push(premiumEconomyRedemption);
      }
    }
  });

  return redemptions;
}

function parseSingleEntry({
  region,
  from,
  flightClass,
  milesRequiredText,
  flightNo,
  blackoutPeriodText,
}: {
  region: string;
  from: string;
  flightClass: FlightClass;
  milesRequiredText: string;
  flightNo: string;
  blackoutPeriodText: string;
}): Omit<RedemptionInputProps, 'redemptionEndDate'> | null {
  const [origin, destination] = from.split(' to ');
  if (!origin || !destination) {
    throw new Error(`Unable to obtain origin/destination from "${from}"`);
  }

  const milesRequired = toNumber(milesRequiredText);
  const blackoutPeriod = parseBlackoutPeriod(blackoutPeriodText);

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
    region,
  };
}

/**
 * Finds the row number in fileContent that matches the columns in headerCols
 *
 * @param fileContent An array of rows, where each row is tab-separated.
 * @param headerCols
 */
function getHeaderRowIdx(fileContent: string[], headerCols: string[]) {
  const index = fileContent.findIndex((row) => {
    const rowCells = row.split('\t');
    return headerCols.every((headerCol, idx) => headerCol === rowCells[idx]);
  });
  return index === -1 ? undefined : index;
}

function createOrUpdateRedemptionsFile({
  redemptionPeriod,
  redemptionsData,
}: {
  redemptionPeriod: string;
  redemptionsData: RedemptionInputProps[];
}) {
  const redemptions = redemptionsData.map((redemptionInfo) =>
    Redemption.create(redemptionInfo),
  );
  const redemptionsFilepath = `data/${redemptionPeriod}-redemptions.json`;
  const redemptionsExisting = (() => {
    if (!fs.existsSync(redemptionsFilepath)) return [];

    const redemptionsString = fs.readFileSync(redemptionsFilepath).toString();
    return JSON.parse(redemptionsString) as RedemptionJson[];
  })();

  const redemptionsUpdated = [...redemptionsExisting, ...redemptions];
  fs.writeFileSync(
    redemptionsFilepath,
    JSON.stringify(redemptionsUpdated, null, 2),
  );
}

if (require.main === module) {
  parseFromTsvFile();
}
