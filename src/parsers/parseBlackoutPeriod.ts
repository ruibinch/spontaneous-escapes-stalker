import { spellcheckMonth } from '../lib/spellcheck';
import { BlackoutPeriod } from '../types';
import { parseDateStringToISO8601 } from '../utils';

// SQ website doesn't standardise their dashes
// TODO: check for other possible Unicode dash characters
const POSSIBLE_DASHES = ['–', '‐', '-'];

interface BlackoutPeriodStringByFlightNo {
  blackoutPeriodString: string;
  flightNo?: string;
}

export function parseBlackoutPeriod(blackoutPeriodString: string) {
  // if input value is just a dash, there is no blackout period
  const hasNoBlackoutPeriod = POSSIBLE_DASHES.some(
    (dash) => blackoutPeriodString === dash,
  );
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
      console.error(
        `[parseBlackoutPeriod] "${blackoutPeriodString}": ${err.message}`,
      );
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
    const blackoutPeriodsString =
      blackoutPeriodStringByFlightNos[0].blackoutPeriodString.split(', ');
    blackoutPeriods = blackoutPeriodsString.map(getBlackoutPeriod);
  } else {
    // multiple flight numbers might have a common blackout period
    // key is in the format `{fromDate}__{toDate}`
    const blackoutPeriodsDict: Record<string, string[]> = {};

    blackoutPeriodStringByFlightNos.forEach(
      ({ blackoutPeriodString, flightNo }) => {
        if (!flightNo) {
          throw new Error('flightNo should not be undefined here!');
        }

        const blackoutPeriodsString = blackoutPeriodString.split(', ');
        blackoutPeriodsString.map(getBlackoutPeriod).forEach(({ from, to }) => {
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
 * Finds the from/to dates of a single blackout period entry.
 *
 * @param blackoutPeriodString e.g. "3 – 5 July 2023" / "5 July 2023"
 */
function getBlackoutPeriod(blackoutPeriodStringRaw: string) {
  const separator = POSSIBLE_DASHES.find((sep) =>
    blackoutPeriodStringRaw.includes(sep),
  );
  // use a regex to extract only the date component from the string, in case the string contains irrelevant extra chars
  const blackoutPeriodString = (() => {
    const dayRegex = '\\d{1,2}';
    const dayRangeRegex = `${dayRegex}\\s?${separator}\\s?${dayRegex}`;
    const monthRegex = '\\s[a-zA-Z]+';
    const yearOptionalRegex = '(\\s\\d{4})?';
    const re = new RegExp(
      separator
        ? `${dayRangeRegex}${monthRegex}${yearOptionalRegex}`
        : `${dayRegex}${monthRegex}${yearOptionalRegex}`,
      'g',
    );

    const match = blackoutPeriodStringRaw.match(re);
    if (!match) {
      throw new Error(
        `Unable to extract date component from "${blackoutPeriodStringRaw}"`,
      );
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

  // blackout period is a date range, e.g. "3 – 5 July 2023" / "3 – 5 July"
  // then, fromDay = 3, toDate = 5 July 2023
  const blackoutPeriodStringSplit = blackoutPeriodString.split(separator);
  const fromDay = blackoutPeriodStringSplit[0].trim();
  const toDateSplit = blackoutPeriodStringSplit[1].trim().split(' ');
  const toDay = toDateSplit[0];
  const toMonth = spellcheckMonth(toDateSplit[1]);
  const toYear = toDateSplit[2] ?? getYearInNextMonth();

  const fromDate = `${fromDay} ${toMonth} ${toYear}`;
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
