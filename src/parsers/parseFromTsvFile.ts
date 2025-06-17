import fs from 'fs';
import { toNumber } from '../utils';
import { POSSIBLE_DASHES, parseBlackoutPeriod } from './parseBlackoutPeriod';
import { Redemption, RedemptionInputProps } from '../models/Redemption';
import {
  FlightClass,
  RedemptionJson,
  RedemptionTableInfoWithRegion,
} from '../utils/types';
import { subDays } from 'date-fns';
import { formatCity } from './parseRedemptionTablesV1';
import { dedupeRedemptions } from './dedupeRedemptions';

process.env.TZ = 'UTC';

// Should be in the format `data/YYYYMM-content.tsv`
const TSV_FILEPATH = process.env['TSV_FILEPATH'];
// Optional output filepath to write to
const OUTPUT_FILEPATH = process.env['OUTPUT_FILEPATH'];

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
 * The TSV file can contain multiple header rows in the formats defined in the above 2 arrays (to cater for the SIA/SilkAir split in the past).
 *
 * This function is closely similar to the parseRedemptionTable function, where both share the parsing logic but operate on different eleement types.
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

  console.log(`📖 Reading from ${TSV_FILEPATH}\n`);
  const tsvFileContent = fs.readFileSync(TSV_FILEPATH).toString().split('\r\n');
  const headerRowsIdxs = getHeaderRowsIdxs({
    fileContent: tsvFileContent,
    headers: [
      TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS,
      TSV_PREMIUM_ECONOMY_SECTION_COLUMNS,
    ],
  });

  const redemptionsCombined = headerRowsIdxs.reduce(
    (_redemptions: RedemptionTableInfoWithRegion[], headerRowIdx, idx) => {
      const rowsForSection = tsvFileContent.slice(
        headerRowIdx,
        headerRowsIdxs[idx + 1],
      );
      const flightClassCategory = (() => {
        const headerRowCells = tsvFileContent[headerRowIdx].split('\t');
        if (
          isHeaderRow(headerRowCells, TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS)
        ) {
          return 'Y/J';
        }
        if (isHeaderRow(headerRowCells, TSV_PREMIUM_ECONOMY_SECTION_COLUMNS)) {
          return 'W';
        }
        throw new Error(`Invalid header row - ${headerRowCells.join(',')}`);
      })();

      const redemptionsForSection = parseSection(
        rowsForSection,
        flightClassCategory,
      );
      console.log(
        `⛏️ Scraped ${
          redemptionsForSection.length
        } redemptions from rows ${headerRowIdx}-${
          headerRowsIdxs[idx + 1] ?? 'end'
        }`,
      );

      _redemptions.push(...redemptionsForSection);
      return _redemptions;
    },
    [],
  );

  const redemptionsDeduped = dedupeRedemptions(redemptionsCombined);
  console.log(
    `🧹 Deduplicated ${redemptionsCombined.length} redemptions to ${redemptionsDeduped.length} redemptions\n`,
  );

  const redemptions = redemptionsDeduped.map((redemption) => ({
    ...redemption,
    redemptionEndDate,
  }));

  createRedemptionsOutputFile({
    redemptionPeriod,
    redemptionsData: redemptions,
  });
}

/**
 * Parses an individual "section" of the TSV corresponding to either the Business/Economy Class section or Premium Economy class section.
 * First row is the header row.
 */
function parseSection(rows: string[], flightClassCategory: 'Y/J' | 'W') {
  const redemptions: RedemptionTableInfoWithRegion[] = [];

  // skip the header row
  rows.slice(1).forEach((row) => {
    // only consider filled cells
    const cells = row.split('\t').filter((cell) => cell !== '');
    // skip empty rows
    if (cells.length === 0) {
      return;
    }

    if (flightClassCategory === 'Y/J') {
      if (cells.length !== TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS.length) {
        throw new Error(
          `Mismatch in number of cells for Y/J section - expected ${TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS.length} but received ${cells.length} (${cells})`,
        );
      }

      const economyRedemption = parseSingleEntry({
        region: cells[0],
        from: cleanCellContent(
          cells[1],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[1],
        ),
        flightClass: FlightClass.ECONOMY,
        milesRequiredText: cleanCellContent(
          cells[2],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[2],
        ),
        flightNo: cleanCellContent(
          cells[3],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[3],
        ),
        blackoutPeriodText: cleanCellContent(
          cells[4],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[4],
        ),
      });
      const businessRedemption = parseSingleEntry({
        region: cells[0],
        from: cleanCellContent(
          cells[1],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[1],
        ),
        flightClass: FlightClass.BUSINESS,
        milesRequiredText: cleanCellContent(
          cells[5],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[5],
        ),
        flightNo: cleanCellContent(
          cells[6],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[6],
        ),
        blackoutPeriodText: cleanCellContent(
          cells[7],
          TSV_BUSINESS_AND_ECONOMY_SECTION_COLUMNS[7],
        ),
      });
      if (economyRedemption) {
        redemptions.push(economyRedemption);
      }
      if (businessRedemption) {
        redemptions.push(businessRedemption);
      }
    }

    if (flightClassCategory === 'W') {
      if (cells.length !== TSV_PREMIUM_ECONOMY_SECTION_COLUMNS.length) {
        throw new Error(
          `Mismatch in number of cells for W section - expected ${TSV_PREMIUM_ECONOMY_SECTION_COLUMNS.length} but received ${cells.length}`,
        );
      }

      const premiumEconomyRedemption = parseSingleEntry({
        region: cells[0],
        from: cleanCellContent(
          cells[1],
          TSV_PREMIUM_ECONOMY_SECTION_COLUMNS[1],
        ),
        flightClass: FlightClass.PREMIUM_ECONOMY,
        milesRequiredText: cleanCellContent(
          cells[2],
          TSV_PREMIUM_ECONOMY_SECTION_COLUMNS[2],
        ),
        flightNo: cleanCellContent(
          cells[3],
          TSV_PREMIUM_ECONOMY_SECTION_COLUMNS[3],
        ),
        blackoutPeriodText: cleanCellContent(
          cells[4],
          TSV_PREMIUM_ECONOMY_SECTION_COLUMNS[4],
        ),
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
}): RedemptionTableInfoWithRegion | null {
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
 * Finds all the row numbers in fileContent that represent a header row.
 *
 * @param fileContent An array of rows, where each row is tab-separated.
 * @param headerCols An array of headers, where each header is an array of column names.
 */
function getHeaderRowsIdxs({
  fileContent,
  headers,
}: {
  fileContent: string[];
  headers: string[][];
}) {
  const headerRowsIdxs: number[] = [];

  fileContent.forEach((row, idx) => {
    const rowCells = row.split('\t');
    if (headers.some((headerCols) => isHeaderRow(rowCells, headerCols))) {
      headerRowsIdxs.push(idx);
    }
  });

  return headerRowsIdxs;
}

function isHeaderRow(rowCells: string[], headerCols: string[]) {
  return headerCols.every((headerCol, idx) => headerCol === rowCells[idx]);
}

function createRedemptionsOutputFile({
  redemptionPeriod,
  redemptionsData,
}: {
  redemptionPeriod: string;
  redemptionsData: RedemptionInputProps[];
}) {
  const redemptions = redemptionsData.map((redemptionInfo) =>
    Redemption.create(redemptionInfo),
  );
  const redemptionsFilepath =
    OUTPUT_FILEPATH ?? `data/${redemptionPeriod}-redemptions.json`;

  console.log(`📄 Writing to ${redemptionsFilepath}`);
  fs.writeFileSync(redemptionsFilepath, JSON.stringify(redemptions, null, 2));
}

/**
 * The cell value can contain the column name in addition to the value, e.g.
 * "FROM Singapore to Bali" instead of "Singapore to Bali".
 *
 * In such cases, we remove the column name from the cell.
 */
function cleanCellContent(content: string, textToRemove: string) {
  return content.replace(textToRemove, '').trim();
}

if (require.main === module) {
  parseFromTsvFile();
}
