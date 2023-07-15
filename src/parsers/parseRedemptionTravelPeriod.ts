import { HTMLElement } from 'node-html-parser';
import { parseDateString } from '../utils';

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

  const fromDate = parseDateString(periodFrom);
  const toDate = parseDateString(periodTo);
  return {
    from: fromDate,
    to: toDate,
  };
}
