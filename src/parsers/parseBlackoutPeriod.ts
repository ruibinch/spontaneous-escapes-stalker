import { parseDateStringToISO8601 } from '../utils';

// SQ website doesn't standardise their dashes
const POSSIBLE_DASHES = ['–', '‐', '-'];

export function parseBlackoutPeriod(blackoutPeriodRaw: string) {
  // if input value is just a dash, there is no blackout period
  const hasNoBlackoutPeriod = POSSIBLE_DASHES.some(
    (dash) => blackoutPeriodRaw === dash,
  );
  if (hasNoBlackoutPeriod) return [];

  const blackoutPeriods = parseBlackoutPeriodContent(blackoutPeriodRaw);

  return blackoutPeriods;
}

/**
 * Parses an unformatted string of blackout period(s) separated by a comma.
 *
 * @param blackoutPeriodString e.g. "3 – 5 July 2023, 11 ‐ 12 July 2023"
 * @returns Array of BlackoutPeriod objects
 */
function parseBlackoutPeriodContent(blackoutPeriodString: string) {
  const blackoutPeriodsString = blackoutPeriodString.split(', ');

  const blackoutPeriods = blackoutPeriodsString.map((period) => {
    const separator = POSSIBLE_DASHES.find((sep) => period.includes(sep));

    // blackout period is a single day, e.g. "3 July 2023"
    if (!separator) {
      return {
        from: parseDateStringToISO8601(period),
        to: parseDateStringToISO8601(period),
      };
    }

    // blackout period is a date range, e.g. "3 – 5 July 2023"
    // then, fromDay = 3, toDate = 5 July 2023
    const [fromDay, toDate] = period.split(separator);
    const [, toMonth, toYear] = toDate.trim().split(' ');
    const fromDate = `${fromDay.trim()} ${toMonth} ${toYear}`;
    return {
      from: parseDateStringToISO8601(fromDate.trim()),
      to: parseDateStringToISO8601(toDate.trim()),
    };
  });

  return blackoutPeriods;
}
