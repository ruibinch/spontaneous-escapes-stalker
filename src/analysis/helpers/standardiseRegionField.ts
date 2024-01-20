import { Redemption } from '../../models/Redemption';
import { Region } from '../../utils/types';

// Override for all cities because the region definition by SQ varies depending on time
const cityToRegionMap: Record<string, Region> = {
  Adelaide: Region.SOUTHWEST_PACIFIC,
  Ahmedabad: Region.SOUTH_ASIA,
  Amsterdam: Region.EUROPE,
  Auckland: Region.SOUTHWEST_PACIFIC,
  Bali: Region.SOUTH_EAST_ASIA,
  'Bandar Seri Begawan': Region.SOUTH_EAST_ASIA,
  Brunei: Region.SOUTH_EAST_ASIA,
  Bandung: Region.SOUTH_EAST_ASIA,
  Bangkok: Region.SOUTH_EAST_ASIA,
  Barcelona: Region.EUROPE,
  Beijing: Region.NORTH_ASIA,
  Bangalore: Region.SOUTH_ASIA,
  Brisbane: Region.SOUTHWEST_PACIFIC,
  Busan: Region.NORTH_ASIA,
  Cairns: Region.SOUTHWEST_PACIFIC,
  Canberra: Region.SOUTHWEST_PACIFIC,
  'Cape Town': Region.MIDDLE_EAST_AND_AFRICA,
  Cebu: Region.SOUTH_EAST_ASIA,
  Chengdu: Region.NORTH_ASIA,
  Chennai: Region.SOUTH_ASIA,
  Chongqing: Region.NORTH_ASIA,
  Christchurch: Region.SOUTHWEST_PACIFIC,
  Colombo: Region.SOUTH_ASIA,
  Copenhagen: Region.EUROPE,
  'Da Nang': Region.SOUTH_ASIA,
  Darwin: Region.SOUTHWEST_PACIFIC,
  Davao: Region.SOUTH_EAST_ASIA,
  Dhaka: Region.SOUTH_ASIA,
  Dubai: Region.MIDDLE_EAST_AND_AFRICA,
  Düsseldorf: Region.EUROPE,
  Frankfurt: Region.EUROPE,
  Fukuoka: Region.NORTH_ASIA,
  Guangzhou: Region.NORTH_ASIA,
  Hanoi: Region.SOUTH_EAST_ASIA,
  'Ho Chi Minh City': Region.SOUTH_EAST_ASIA,
  'Hong Kong': Region.NORTH_ASIA,
  Houston: Region.USA,
  Hyderabad: Region.SOUTH_ASIA,
  Istanbul: Region.MIDDLE_EAST_AND_AFRICA,
  Jakarta: Region.SOUTH_EAST_ASIA,
  Johannesburg: Region.MIDDLE_EAST_AND_AFRICA,
  Kathmandu: Region.SOUTH_ASIA,
  Kochi: Region.SOUTH_ASIA,
  Kolkata: Region.SOUTH_ASIA,
  'Kuala Lumpur': Region.SOUTH_EAST_ASIA,
  London: Region.EUROPE,
  'Los Angeles': Region.USA,
  Malé: Region.SOUTH_ASIA,
  Manchester: Region.EUROPE,
  Mandalay: Region.SOUTH_EAST_ASIA,
  Manila: Region.SOUTH_EAST_ASIA,
  Medan: Region.SOUTH_EAST_ASIA,
  Melbourne: Region.SOUTHWEST_PACIFIC,
  Milan: Region.EUROPE,
  Moscow: Region.EUROPE,
  Mumbai: Region.SOUTH_ASIA,
  Munich: Region.EUROPE,
  Nagoya: Region.NORTH_ASIA,
  'New Delhi': Region.SOUTH_ASIA,
  'New York': Region.USA,
  Osaka: Region.NORTH_ASIA,
  Paris: Region.EUROPE,
  Penang: Region.SOUTH_EAST_ASIA,
  Perth: Region.SOUTHWEST_PACIFIC,
  'Phnom Penh': Region.SOUTH_EAST_ASIA,
  Phuket: Region.SOUTH_EAST_ASIA,
  Rome: Region.EUROPE,
  'San Francisco': Region.USA,
  Seattle: Region.USA,
  Seoul: Region.NORTH_ASIA,
  Shanghai: Region.NORTH_ASIA,
  Shenzhen: Region.NORTH_ASIA,
  'Siem Reap': Region.SOUTH_EAST_ASIA,
  // Singapore omitted as a non-SG destination should be used to derive the version
  Surabaya: Region.SOUTH_EAST_ASIA,
  Sydney: Region.SOUTHWEST_PACIFIC,
  Taipei: Region.NORTH_ASIA,
  Tokyo: Region.NORTH_ASIA,
  Wellington: Region.SOUTHWEST_PACIFIC,
  Xiamen: Region.NORTH_ASIA,
  Yangon: Region.SOUTH_EAST_ASIA,
  Zürich: Region.EUROPE,
};

/**
 * Preprocessing before analysis.
 *
 * Standardises the region fields to the following set:
 *   - South East Asia
 *   - North Asia
 *   - South Asia
 *   - Middle East & Africa
 *   - Southwest Pacific
 *   - Europe
 *   - USA
 */
export function standardiseRegionField(redemptions: Redemption[]) {
  return redemptions.map((redemption) => {
    const { origin, destination } = redemption;
    const regionOverride = (() => {
      if (origin === 'Singapore') {
        return cityToRegionMap[destination];
      }
      if (destination === 'Singapore') {
        return cityToRegionMap[origin];
      }
      // if origin/destination are both not Singapore, then we use the destination to determine the regino
      return cityToRegionMap[destination];
    })();

    if (!regionOverride) {
      throw new Error(
        `No regionOverride found for origin="${origin}"/destination="${destination}"`,
      );
    }

    return Redemption.create({
      ...redemption,
      region: regionOverride,
      redemptionEndDate: new Date(redemption.redemptionEndDate),
    });
  });
}
