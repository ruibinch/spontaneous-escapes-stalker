import { getCountryFromCity } from '../lib/iata/getCountryFromCity';
import { iata } from '../lib/iata/iata';
import { RedemptionJsonPostprocessed } from '../utils/types';
import { RedemptionJsonWithFlightNosAndBlackoutPct } from './computeBlackoutPct';

/**
 * Appends the following fields:
 *  - originIata
 *  - originCountry
 *  - destinationIata
 *  - destinationCountry
 *  - redemptionMonth
 * Removes the following unused fields:
 *  - redemptionEndDate
 *  - sortKey
 */
export function appendAndRemoveFields({
  redemptions,
  month,
}: {
  redemptions: RedemptionJsonWithFlightNosAndBlackoutPct[];
  month: string;
}): RedemptionJsonPostprocessed[] {
  return redemptions.map((redemption) => {
    const originCountry = getCountryFromCity(redemption.origin);
    const destinationCountry = getCountryFromCity(redemption.destination);

    return {
      origin: redemption.origin,
      originIata: iata(redemption.origin),
      originCountry,
      destination: redemption.destination,
      destinationIata: iata(redemption.destination),
      destinationCountry,
      flightClass: redemption.flightClass,
      flightNos: redemption.flightNos,
      milesRequired: redemption.milesRequired,
      blackoutPeriod: redemption.blackoutPeriod,
      blackoutPct: redemption.blackoutPct,
      region: redemption.region,
      redemptionMonth: month,
    } satisfies RedemptionJsonPostprocessed;
  });
}
