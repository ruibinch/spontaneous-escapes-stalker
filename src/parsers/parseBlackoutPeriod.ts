import { spellcheckMonth } from '../lib/spellcheck';
import { BlackoutPeriod, FlightClass } from '../utils/types';
import { parseDateStringToISO8601 } from '../utils';
import { log, logParserError } from '../utils/log';

// SQ website doesn't standardise their dashes
// TODO: check for other possible Unicode dash characters
export const POSSIBLE_DASHES = ['–', '‐', '—', '-'];
const POSSIBLE_SEPARATORS = [...POSSIBLE_DASHES, ' to '];

interface BlackoutPeriodStringByFlightNo {
  blackoutPeriodString: string;
  flightNo?: string;
}

export function parseBlackoutPeriod(
  blackoutPeriodString: string,
  metadata?: {
    origin: string;
    destination: string;
    flightClass: FlightClass;
  },
) {
  const hasNoBlackoutPeriod =
    // if input value is just a dash, there is no blackout period
    POSSIBLE_DASHES.some((dash) => blackoutPeriodString.trim() === dash) ||
    // empty string
    !blackoutPeriodString.trim();
  if (hasNoBlackoutPeriod) return [];

  try {
    const blackoutPeriodStringByFlightNos =
      maybeSplitByFlightNos(blackoutPeriodString);

    const blackoutPeriods = parseBlackoutPeriodContent(
      blackoutPeriodStringByFlightNos,
    );

    return blackoutPeriods;
  } catch (err) {
    if (err instanceof Error) {
      const metadataString = metadata
        ? `[${metadata.origin}-${metadata.destination};${metadata.flightClass}]`
        : '';
      const errorMessage = `[parseBlackoutPeriod]${metadataString} "${blackoutPeriodString}": ${err.message}`;
      logParserError(errorMessage);
    }
    return [];
  }
}

/**
 * Checks if the unformatted string of blackout period(s) has different dates corresponding to different flight numbers, and splits if so.
 *
 * @param blackoutPeriodString e.g. "SQ212: 1 ‐ 9 July 2023 SQ232: 1 ‐ 9 July 2023, 13 July 2023"
 */
function maybeSplitByFlightNos(blackoutPeriodString: string) {
  const flightNoRegex = new RegExp('SQ\\d{2,3}:\\s', 'g');

  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  do {
    m = flightNoRegex.exec(blackoutPeriodString);
    if (m) {
      matches.push(m);
    }
  } while (m);

  if (matches.length === 0) {
    return [{ blackoutPeriodString }];
  }

  const blackoutPeriodStringByFlightNos = matches.reduce(
    (acc: BlackoutPeriodStringByFlightNo[], match, idx) => {
      const matchLength = match[0].length;
      const matchStartIndex = match.index;
      const matchEndIndex = matches[idx + 1]?.index; // if undefined, then this is the last match
      const blackoutPeriodStringForSingleFlightNo = blackoutPeriodString.slice(
        matchStartIndex + matchLength,
        matchEndIndex,
      );

      acc.push({
        blackoutPeriodString: blackoutPeriodStringForSingleFlightNo.trim(),
        flightNo: match[0].replace(': ', ''), // remove trailing ": "
      });
      return acc;
    },
    [],
  );

  return blackoutPeriodStringByFlightNos;
}

/**
 * Parses an array of objects containing an unformatted string of blackout period(s) and an optional flight number.
 */
function parseBlackoutPeriodContent(
  blackoutPeriodStringByFlightNos: BlackoutPeriodStringByFlightNo[],
) {
  let blackoutPeriods: BlackoutPeriod[] = [];

  const hasNoDifferentiationByFlightNo =
    blackoutPeriodStringByFlightNos.length === 1 &&
    blackoutPeriodStringByFlightNos[0].flightNo === undefined;

  if (hasNoDifferentiationByFlightNo) {
    const blackoutPeriodsString = splitBlackoutPeriodString(
      blackoutPeriodStringByFlightNos[0].blackoutPeriodString,
    );
    blackoutPeriods = blackoutPeriodsString.map(parseDateText);
  } else {
    // multiple flight numbers might have a common blackout period
    // key is in the format `{fromDate}__{toDate}`
    const blackoutPeriodsDict: Record<`${string}__${string}`, string[]> = {};

    blackoutPeriodStringByFlightNos.forEach(
      ({ blackoutPeriodString, flightNo }) => {
        if (!flightNo) {
          throw new Error('flightNo should not be undefined here!');
        }

        const blackoutPeriodsString =
          splitBlackoutPeriodString(blackoutPeriodString);
        blackoutPeriodsString.map(parseDateText).forEach(({ from, to }) => {
          blackoutPeriodsDict[`${from}__${to}`] = [
            ...(blackoutPeriodsDict[`${from}__${to}`] ?? []),
            flightNo,
          ];
        });
      },
    );

    blackoutPeriods = Object.entries(blackoutPeriodsDict).map(
      ([period, flightNos]) => {
        const [from, to] = period.split('__');
        return { from, to, flightNos };
      },
    );
  }

  return blackoutPeriods;
}

/**
 * Splits a string representation of a blackout period into single entries.
 *
 * @param blackoutPeriodString
 *  Either multiple entries each containing their own month/year component, e.g. 1 ‐ 7 January 2024, 14 January 2024;
 *  Or multiple entires sharing a single month/year component, e.g. 1, 2, 5 December 2023
 * @returns Array of blackout period strings,
 *  e.g. ["1 ‐ 7 January 2024", "14 January 2024"]
 *  or ["1 December 2023", "2 December 2023", "5 December 2023"]
 */
function splitBlackoutPeriodString(blackoutPeriodString: string) {
  const monthRegex = '[a-zA-Z]+';
  const yearOptionalRegex = '(\\s\\d{4})?';
  const monthYearComponentRegex = new RegExp(
    `${monthRegex}${yearOptionalRegex}`,
    'g',
  );

  // Get any month/year component from the string
  const monthYearComponent = (() => {
    const match = blackoutPeriodString.match(monthYearComponentRegex);
    if (!match) {
      throw new Error(
        `Unable to extract any month/year component from "${blackoutPeriodString}`,
      );
    }
    return match[0];
  })();

  const entriesRaw = blackoutPeriodString.split(', ');
  // Append month/year component to any entry that does not have it
  const entries = entriesRaw.map((entry) => {
    const hasMonthYear = entry.match(monthYearComponentRegex);
    return hasMonthYear ? entry : `${entry} ${monthYearComponent}`;
  });
  return entries;
}

/**
 * Finds the from/to dates of a date text string.
 *
 * @param dateText e.g. "3 – 5 July 2023" / "4 July - 6 July 2023" / "5 July 2023"
 */
export function parseDateText(_dateText: string) {
  // semi-hardcoded handling to remove any extraneous dashes before the year to avoid it being incorrectly registered as a separator
  const dashBeforeYearRegex = new RegExp(
    `[${POSSIBLE_DASHES.join('')}](?=\\d{4})`,
    'g',
  );
  const dateText = _dateText.replace(dashBeforeYearRegex, '');

  const separator = POSSIBLE_SEPARATORS.find((sep) => dateText.includes(sep));
  const yearOptionalRegex = '(\\s\\d{4})?';
  const monthRegex = '\\s[a-zA-Z]+';
  const monthOptionalRegex = `(${monthRegex})?`;
  const dayRegex = '\\d{1,2}';

  // use a regex to extract only the date component from the string, in case the string contains irrelevant extra chars
  const blackoutPeriodString = (() => {
    // monthOptionalRegex/yearOptionalRegex is to cover cases like "4 July 2023 - 6 July 2023"
    const dayRangeRegex = `${dayRegex}${monthOptionalRegex}${yearOptionalRegex}\\s*${separator}\\s*${dayRegex}`;
    const re = new RegExp(
      separator
        ? `${dayRangeRegex}${monthRegex}${yearOptionalRegex}`
        : `${dayRegex}${monthRegex}${yearOptionalRegex}`,
      'g',
    );

    const match = dateText.match(re);
    if (!match) {
      throw new Error(`Unable to extract date component from "${dateText}"`);
    }
    return match[0];
  })();

  // blackout period is a single day, e.g. "3 July 2023" / "3 July"
  if (!separator) {
    const blackoutPeriodStringSplit = blackoutPeriodString.split(' ');
    const day = blackoutPeriodStringSplit[0];
    const month = spellcheckMonth(blackoutPeriodStringSplit[1]);
    const year = blackoutPeriodStringSplit[2] ?? getYearInNextMonth();

    const date = `${day} ${month} ${year}`;
    return {
      from: parseDateStringToISO8601(date),
      to: parseDateStringToISO8601(date),
    };
  }

  // blackout period is a date range, e.g. "3 – 5 July 2023" / "3 – 5 July" / "3 July - 5 July"
  // then, fromDay = 3, toDate = 5 July 2023
  // alternatively, the from/to months can also be different, e.g. "31 June - 5 July"
  const [fromSegment, toSegment] = blackoutPeriodString.split(separator);

  const fromDateSplit = fromSegment.trim().split(' ');
  const fromDay = fromDateSplit[0];
  const fromMonth = fromDateSplit[1] ? spellcheckMonth(fromDateSplit[1]) : null;

  const toDateSplit = toSegment.trim().split(' ');
  const toDay = toDateSplit[0];
  const toMonth = spellcheckMonth(toDateSplit[1]);
  const toYear = toDateSplit[2] ?? getYearInNextMonth();

  const fromDate = `${fromDay} ${fromMonth ?? toMonth} ${toYear}`;
  const toDate = `${toDay} ${toMonth} ${toYear}`;
  return {
    from: parseDateStringToISO8601(fromDate),
    to: parseDateStringToISO8601(toDate),
  };
}

/**
 * Simple function to get the year value in the next month.
 * For handling the case where the year is not defined in the blackout period, e.g. "1 – 4 August"
 */
function getYearInNextMonth() {
  const today = new Date(Date.now());
  const currentYear = today.getFullYear();
  const isMonthDec = today.getMonth() === 11;
  return isMonthDec ? currentYear + 1 : currentYear;
}
