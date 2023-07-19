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

  const blackoutPeriodStringByFlightNos =
    maybeSplitByFlightNos(blackoutPeriodString);

  const blackoutPeriods = parseBlackoutPeriodContent(
    blackoutPeriodStringByFlightNos,
  );

  return blackoutPeriods;
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
 * @param blackoutPeriodString e.g. "3 – 5 July 2023"
 */
function getBlackoutPeriod(blackoutPeriodString: string) {
  const separator = POSSIBLE_DASHES.find((sep) =>
    blackoutPeriodString.includes(sep),
  );

  // blackout period is a single day, e.g. "3 July 2023"
  if (!separator) {
    return {
      from: parseDateStringToISO8601(blackoutPeriodString),
      to: parseDateStringToISO8601(blackoutPeriodString),
    };
  }

  // blackout period is a date range, e.g. "3 – 5 July 2023"
  // then, fromDay = 3, toDate = 5 July 2023
  const [fromDay, toDate] = blackoutPeriodString.split(separator);
  const [, toMonth, toYear] = toDate.trim().split(' ');
  const fromDate = `${fromDay.trim()} ${toMonth} ${toYear}`;
  return {
    from: parseDateStringToISO8601(fromDate.trim()),
    to: parseDateStringToISO8601(toDate.trim()),
  };
}
