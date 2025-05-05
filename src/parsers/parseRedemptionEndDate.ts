import { endOfMonth } from 'date-fns';
import { HTMLElement } from 'node-html-parser';
import { parseDateString } from '../utils';
import { log } from '../utils/log';

/**
 * Finds the end date of the redemption period.
 */
export function parseRedemptionEndDate(
  root: HTMLElement,
  currentMonth: Date,
): Date {
  const paragraphs = root.getElementsByTagName('p');
  const redemptionEndDateRegex = new RegExp('(?<=till\\s)(.+?)\\d{4}');

  const redemptionEndDateMatch = paragraphs
    .map((paragraph) => paragraph.text.match(redemptionEndDateRegex))
    .find(Boolean);

  if (redemptionEndDateMatch) {
    const redemptionEndDateStr = redemptionEndDateMatch[0];
    return parseDateString(redemptionEndDateStr);
  }

  // fallback to deriving based on scraped redemptions data
  return endOfMonth(currentMonth);
}
