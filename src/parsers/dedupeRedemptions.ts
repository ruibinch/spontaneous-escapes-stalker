import { RedemptionTableInfoWithRegion } from '../utils/types';

/**
 * After the parsing of the redemption tables, there might be duplicate entries with the same origin/destination/flightClass combination,
 * because one is under the SIA section while the other is under the SilkAir section.
 *
 * We combine these entries into a single entry - only the flightNo field will be combined.
 *
 * The original order of the array will be preserved, so duplicated entries further down the list will be combined with the ones higher up the list.
 * Hence the slightly cumbersome approach of this function.
 */
export function dedupeRedemptions(
  redemptions: RedemptionTableInfoWithRegion[],
) {
  const getRedemptionUniqueKey = (redemption: RedemptionTableInfoWithRegion) =>
    `${redemption.flightClass}#${redemption.origin}#${redemption.destination}`;

  const redemptionsDuplicate = (() => {
    const redemptionsUniqueKeySet = new Set();
    const _redemptionsDuplicate: RedemptionTableInfoWithRegion[] = [];

    redemptions.forEach((r) => {
      if (redemptionsUniqueKeySet.has(getRedemptionUniqueKey(r))) {
        _redemptionsDuplicate.push(r);
      } else {
        redemptionsUniqueKeySet.add(getRedemptionUniqueKey(r));
      }
    });

    return _redemptionsDuplicate;
  })();

  const redemptionsHandledUniqueKeySet = new Set();
  const redemptionsDeduped = redemptions.reduce(
    (_redemptionsDeduped: RedemptionTableInfoWithRegion[], redemption) => {
      const redemptionUniqueKey = getRedemptionUniqueKey(redemption);
      if (redemptionsHandledUniqueKeySet.has(redemptionUniqueKey)) {
        return _redemptionsDeduped;
      }

      const redemptionDuplicate = redemptionsDuplicate.find(
        (r) => redemptionUniqueKey === getRedemptionUniqueKey(r),
      );
      if (redemptionDuplicate) {
        const flightNosCombined = [
          ...redemption.flightNo.split(','),
          ...redemptionDuplicate.flightNo.split(','),
        ].join(',');
        _redemptionsDeduped.push({
          ...redemption,
          flightNo: flightNosCombined,
        });
      } else {
        _redemptionsDeduped.push(redemption);
      }

      redemptionsHandledUniqueKeySet.add(redemptionUniqueKey);
      return _redemptionsDeduped;
    },
    [],
  );

  return redemptionsDeduped;
}
