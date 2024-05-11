import { BlackoutPeriod, RedemptionJson } from '../utils/types';

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
      return;
    }

    const redemptionExisting = redemptionsCombined[redemptionExistingIdx];

    const flightNosCombined = [
      redemptionExisting.flightNo,
      redemption.flightNo,
    ].join(',');
    const blackoutPeriodCombined: BlackoutPeriod[] = [
      ...redemptionExisting.blackoutPeriod.map(
        (blackoutPeriod) =>
          ({
            from: blackoutPeriod.from,
            to: blackoutPeriod.to,
            flightNos: [redemptionExisting.flightNo],
          } satisfies BlackoutPeriod),
      ),
      ...redemption.blackoutPeriod.map(
        (blackoutPeriod) =>
          ({
            from: blackoutPeriod.from,
            to: blackoutPeriod.to,
            flightNos: [redemption.flightNo],
          } satisfies BlackoutPeriod),
      ),
    ];
    const redemptionCombined: RedemptionJson = {
      ...redemptionExisting,
      flightNo: flightNosCombined,
      blackoutPeriod: blackoutPeriodCombined,
    };

    redemptionsCombined.splice(redemptionExistingIdx, 1, redemptionCombined);
  });

  return redemptionsCombined;
}
