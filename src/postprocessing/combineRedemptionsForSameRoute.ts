import { RedemptionJson } from '../utils/types';

/**
 * After the cleanup of city fields, there might be multiple redemption entries for the same route and flight class.
 *
 * This step combines them into one entry.
 */
export function combineRedemptionsForSameRoute(
  redemptions: RedemptionJson[],
): RedemptionJson[] {
  const redemptionsCombined: RedemptionJson[] = [];

  redemptions.forEach((redemption) => {
    const redemptionExistingIdx = redemptionsCombined.findIndex(
      (r) =>
        r.origin === redemption.origin &&
        r.destination === redemption.destination &&
        r.flightClass === redemption.flightClass,
    );

    if (redemptionExistingIdx === -1) {
      redemptionsCombined.push(redemption);
    } else {
      const redemptionExisting = redemptionsCombined[redemptionExistingIdx];

      const flightNosCombined = [
        redemptionExisting.flightNo,
        redemption.flightNo,
      ].join(',');
      const blackoutPeriodCombined = [
        ...redemptionExisting.blackoutPeriod.map((blackoutPeriod) => ({
          ...blackoutPeriod,
          flightNo: redemptionExisting.flightNo,
        })),
        ...redemption.blackoutPeriod.map((blackoutPeriod) => ({
          ...blackoutPeriod,
          flightNo: redemption.flightNo,
        })),
      ];
      const redemptionCombined: RedemptionJson = {
        ...redemptionExisting,
        flightNo: flightNosCombined,
        blackoutPeriod: blackoutPeriodCombined,
      };

      redemptionsCombined.splice(redemptionExistingIdx, 1, redemptionCombined);
    }
  });

  return redemptionsCombined;
}
