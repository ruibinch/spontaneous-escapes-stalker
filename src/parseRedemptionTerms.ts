import { parse } from 'date-fns';
import { HTMLElement } from 'node-html-parser';
import { toDateISO8601 } from './utils';

// e.g. 1 March 2023, 28 June 2023
const DATE_STRING_FORMAT = 'd MMMM yyyy';

/**
 * Finds the end date of the redemption period.
 */
export function parseRedemptionEndDate(root: HTMLElement) {
  const paragraphs = root.getElementsByTagName('p');
  const redemptionEndDateRegex = new RegExp('(?<=till\\s)(.+?)\\d{4}');

  const redemptionEndDateMatch = paragraphs
    .map((paragraph) => paragraph.text.match(redemptionEndDateRegex))
    .find(Boolean);
  if (!redemptionEndDateMatch) {
    throw new Error('Unable to find redemption end date');
  }

  const redemptionEndDateStr = redemptionEndDateMatch[0];
  const redemptionEndDate = parse(
    redemptionEndDateStr,
    DATE_STRING_FORMAT,
    new Date(),
  );
  return toDateISO8601(redemptionEndDate);
}

/**
 * Finds the travel period applicable for the redemption.
 */
export function parseRedemptionTravelPeriod(root: HTMLElement) {
  const paragraphs = root.getElementsByTagName('p');
  const periodRegex = new RegExp('(?<=travel\\sfrom\\s)(.+?)\\d{4}');

  const periodMatch = paragraphs
    .map((paragraph) => paragraph.text.match(periodRegex))
    .find(Boolean);
  if (!periodMatch) {
    throw new Error('Unable to find redemption travel period');
  }

  const periodStr = periodMatch[0];
  const periodDaysRegex = new RegExp('\\d{1,2}\\sto\\s\\d{1,2}');
  const periodDaysMatch = periodStr.match(periodDaysRegex);
  if (!periodDaysMatch) {
    throw new Error('Unable to find redemption travel period');
  }

  // e.g. "1 to 31 March 2023" -> "1 to 31"
  const periodDays = periodDaysMatch[0];
  // e.g. "1 to 31 March 2023" -> " March 2023"
  const periodMonthYear = periodStr.replace(periodDays, '');

  const [periodFromDay, periodToDay] = periodDays.split(' to ');
  const periodFrom = `${periodFromDay}${periodMonthYear}`;
  const periodTo = `${periodToDay}${periodMonthYear}`;

  const fromDate = parse(periodFrom, DATE_STRING_FORMAT, new Date());
  const toDate = parse(periodTo, DATE_STRING_FORMAT, new Date());
  return {
    from: toDateISO8601(fromDate),
    to: toDateISO8601(toDate),
  };
}
