import { cityMappings } from '../lib/iata/mappings';
import { log } from '../utils/log';
import { RedemptionJson } from '../utils/types';

export type RedemptionJsonWithRegion = Omit<RedemptionJson, 'region'> & {
  region: string;
}

/**
 * Standardises the region fields to the following set:
 *   - South East Asia
 *   - North Asia
 *   - South Asia
 *   - Middle East & Africa
 *   - Southwest Pacific
 *   - Europe
 *   - North America
 */
export function standardiseRegionField(
  redemptions: RedemptionJson[],
): RedemptionJsonWithRegion[] {
  return redemptions.map((redemption) => {
    const { origin, destination } = redemption;
    const region = getRegion(redemption);

    if (!region) {
      const errorMessage = `No region found for origin="${origin}"/destination="${destination}"`;
      log(errorMessage, true);
      throw new Error(errorMessage);
    }

    return {
      ...redemption,
      region,
    };
  });
}

export function getRegion(
  redemption: Pick<RedemptionJson, 'origin' | 'destination'>,
): string {
  const { origin, destination } = redemption;

  if (origin === 'Singapore') {
    return cityMappings[destination]?.region;
  }
  if (destination === 'Singapore') {
    return cityMappings[origin]?.region;
  }
  // if origin/destination are both not Singapore, then we use the destination to determine the regino
  return cityMappings[destination]?.region;
}
