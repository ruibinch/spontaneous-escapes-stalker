import { RedemptionJson, RedemptionJsonPostprocessed } from '../utils/types';

/**
 * Appends the following fields:
 *  - redemptionMonth
 * Removes the following unused fields:
 *  - redemptionEndDate
 *  - sortKey
 */
export function appendAndRemoveFields({
  redemptions,
  month,
}: {
  redemptions: RedemptionJson[];
  month: string;
}): RedemptionJsonPostprocessed[] {
  return redemptions.map((redemption) => ({
    origin: redemption.origin,
    destination: redemption.destination,
    flightClass: redemption.flightClass,
    flightNo: redemption.flightNo,
    milesRequired: redemption.milesRequired,
    blackoutPeriod: redemption.blackoutPeriod,
    region: redemption.region,
    redemptionMonth: month,
  }));
}
