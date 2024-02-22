import { cityMappings } from '../lib/iata/mappings';
import { RedemptionJson } from '../utils/types';

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
): RedemptionJson[] {
  return redemptions.map((redemption) => {
    const { origin, destination } = redemption;
    const regionOverride = (() => {
      if (origin === 'Singapore') {
        return cityMappings[destination]?.region;
      }
      if (destination === 'Singapore') {
        return cityMappings[origin]?.region;
      }
      // if origin/destination are both not Singapore, then we use the destination to determine the regino
      return cityMappings[destination]?.region;
    })();

    if (!regionOverride) {
      throw new Error(
        `No regionOverride found for origin="${origin}"/destination="${destination}"`,
      );
    }

    return {
      ...redemption,
      region: regionOverride,
    };
  });
}
