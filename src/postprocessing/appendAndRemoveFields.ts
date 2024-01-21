import { iata } from '../lib/iata/iataCodes';
import { RedemptionJson, RedemptionJsonPostprocessed } from '../utils/types';

/**
 * Appends the following fields:
 *  - originIata
 *  - destinationIata
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
    originIata: iata(redemption.origin),
    destination: redemption.destination,
    destinationIata: iata(redemption.destination),
    flightClass: redemption.flightClass,
    flightNo: redemption.flightNo,
    milesRequired: redemption.milesRequired,
    blackoutPeriod: redemption.blackoutPeriod,
    region: redemption.region,
    redemptionMonth: month,
  }));
}
