import { HTMLElement } from 'node-html-parser';
import { parseDateString } from '../utils';

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
  const redemptionEndDate = parseDateString(redemptionEndDateStr);
  return redemptionEndDate;
}
