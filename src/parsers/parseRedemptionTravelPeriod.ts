import { HTMLElement } from 'node-html-parser';
import { parseDateText } from './parseBlackoutPeriod';

/**
 * Finds the travel period applicable for the redemption.
 */
export function parseRedemptionTravelPeriod(root: HTMLElement) {
  const paragraphs = root.getElementsByTagName('p');
  const periodRegex = new RegExp('(?<=travel\\sfrom\\s)(.+)\\d{4}');

  const periodMatch = paragraphs
    .map((paragraph) => paragraph.text.match(periodRegex))
    .find(Boolean);
  // should match something like "1 to 29 February 2024"/"1 March 2024 to 30 April 2024"
  if (!periodMatch) {
    throw new Error('Unable to find redemption travel period');
  }

  const periodText = periodMatch[0];
  const periodDates = parseDateText(periodText);

  return {
    from: new Date(periodDates.from),
    to: new Date(periodDates.to),
  };
}
