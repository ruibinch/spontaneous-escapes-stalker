import { getCountryFromCity } from '../lib/iata/getCountryFromCity';
import { iata } from '../lib/iata/iata';
import { RedemptionJson, RedemptionJsonPostprocessed } from '../utils/types';

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
  redemptions: Array<
    Omit<RedemptionJson, 'flightNo'> & {
      flightNos: string[];
    }
  >;
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
      region: redemption.region,
      redemptionMonth: month,
    };
  });
}
