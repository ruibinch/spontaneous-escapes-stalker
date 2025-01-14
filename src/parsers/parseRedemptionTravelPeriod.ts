import { HTMLElement } from 'node-html-parser';
import { parseDateText } from './parseBlackoutPeriod';
import { log } from '../utils/log';
import { addMonths, endOfMonth, startOfMonth } from 'date-fns';

/**
 * Finds the travel period applicable for the redemption.
 */
export function parseRedemptionTravelPeriod(root: HTMLElement): {
  from: Date;
  to: Date;
} {
  const paragraphs = root.getElementsByTagName('p');
  const periodRegex = new RegExp('(?<=travel\\sfrom\\s)(.+)\\d{4}');

  // should match something like "1 to 29 February 2024"/"1 March 2024 to 30 April 2024"
  const periodMatch = paragraphs
    .map((paragraph) => paragraph.text.match(periodRegex))
    .find(Boolean);

  if (periodMatch) {
    const periodText = periodMatch[0];
    const periodDates = parseDateText(periodText);

    return {
      from: new Date(periodDates.from),
      to: new Date(periodDates.to),
    };
  } else {
    log(
      'Unable to find redemption travel period, falling back to start/end of next month',
      true,
    );

    const startOfNextMonth = startOfMonth(addMonths(new Date(), 1));
    const endOfNextMonth = endOfMonth(addMonths(new Date(), 1));
    return {
      from: new Date(startOfNextMonth.toISOString().split('T')[0]),
      to: new Date(endOfNextMonth.toISOString().split('T')[0]),
    };
  }
}
