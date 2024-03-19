import { endOfMonth } from 'date-fns';
import { RedemptionJson } from '../utils/types';

/**
 * Merges redemptions in this month with the base set.
 * This is used for releases where the travel period spans more than 1 month.
 *
 * Removes any blackout periods not relevant to the current month.
 */
export function mergeRedemptionsWithBaseSet({
  month,
  redemptions,
  redemptionsBase,
}: {
  month: string;
  redemptions: RedemptionJson[];
  redemptionsBase: RedemptionJson[] | null;
}): RedemptionJson[] {
  if (!redemptionsBase) {
    return redemptions;
  }

  console.log(
    `\n🔀 Merging redemptions for ${month} with base set from previous month`,
  );
  const monthDate = new Date(`${month.slice(0, 4)}-${month.slice(4, 6)}-01`);
  const redemptionsMerged: RedemptionJson[] = [];
  const redemptionsInCurrMonth = [...redemptions];
  let numMatchingRedemptions = 0;

  redemptionsBase.forEach((redemptionBase) => {
    const { redemptionMatching, matchIndex } = findMatchingRedemptionWithIdx(
      redemptionsInCurrMonth,
      redemptionBase,
    );

    const redemptionMerged = (() => {
      if (!redemptionMatching) return redemptionBase;

      // remove the matched redemption from this month's set as it will be merged with that from the base set
      redemptionsInCurrMonth.splice(matchIndex, 1);
      numMatchingRedemptions += 1;

      const flightNoMerged = (() => {
        const flightNos = new Set([
          ...flightNoFieldToArray(redemptionBase.flightNo),
          ...flightNoFieldToArray(redemptionMatching.flightNo),
        ]);
        return [...flightNos].sort().join(',');
      })();
      const blackoutPeriodMerged = (() => {
        const blackoutPeriodsInCurrMonthFromBase =
          redemptionBase.blackoutPeriod.filter(
            (bp) => new Date(bp.to).getMonth() === monthDate.getMonth(),
          );
        return [
          ...blackoutPeriodsInCurrMonthFromBase,
          ...redemptionMatching.blackoutPeriod,
        ];
      })();
      const redemptionEndDate = endOfMonth(monthDate)
        .toISOString()
        .split('T')[0];

      return {
        ...redemptionBase,
        flightNo: flightNoMerged,
        blackoutPeriod: blackoutPeriodMerged,
        redemptionEndDate,
      };
    })();
    redemptionsMerged.push(redemptionMerged);
  });

  // append redemptions unique to this month to the merged list
  redemptionsMerged.push(...redemptionsInCurrMonth);

  console.log(
    `No. of base redemptions: ${redemptionsBase.length}\n` +
      `No. of redemptions in this month: ${redemptions.length}\n` +
      `No. of matching redemptions: ${numMatchingRedemptions}\n` +
      `No. of redemptions unique to this month: ${redemptionsInCurrMonth.length}\n` +
      `No. of redemptions after merging: ${redemptionsMerged.length}`,
  );
  return redemptionsMerged;
}

function findMatchingRedemptionWithIdx(
  redemptions: RedemptionJson[],
  redemptionToMatch: RedemptionJson,
) {
  const matchIndex = redemptions.findIndex(
    (r) =>
      r.origin === redemptionToMatch.origin &&
      r.destination === redemptionToMatch.destination &&
      r.flightClass === redemptionToMatch.flightClass,
  );
  return matchIndex === -1
    ? {}
    : { redemptionMatching: redemptions[matchIndex], matchIndex };
}

function flightNoFieldToArray(flightNo: string): string[] {
  return flightNo
    .replace(/\//g, ',')
    .split(',')
    .map((s) => s.trim());
}
