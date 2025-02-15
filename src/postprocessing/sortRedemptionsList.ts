import {
  FlightClass,
  RedemptionJsonPostprocessed,
  Region,
} from '../utils/types';

export const REGION_SORT_ORDER: string[] = [
  Region.SOUTH_EAST_ASIA,
  Region.NORTH_ASIA,
  Region.SOUTH_ASIA,
  Region.MIDDLE_EAST_AND_AFRICA,
  Region.SOUTHWEST_PACIFIC,
  Region.EUROPE,
  Region.NORTH_AMERICA,
];

export const FLIGHT_CLASS_SORT_ORDER: string[] = [
  FlightClass.ECONOMY,
  FlightClass.PREMIUM_ECONOMY,
  FlightClass.BUSINESS,
];

/**
 * Sorts the redemptions list by:
 * 1. region
 * 2. flight class
 * 3. miles required
 */
export function sortRedemptionsList({
  redemptions,
}: {
  redemptions: RedemptionJsonPostprocessed[];
}) {
  return [...redemptions].sort((a, b) => {
    if (a.region !== b.region) {
      return (
        REGION_SORT_ORDER.indexOf(a.region) -
        REGION_SORT_ORDER.indexOf(b.region)
      );
    }
    if (a.flightClass !== b.flightClass) {
      return (
        FLIGHT_CLASS_SORT_ORDER.indexOf(a.flightClass) -
        FLIGHT_CLASS_SORT_ORDER.indexOf(b.flightClass)
      );
    }
    return a.milesRequired - b.milesRequired;
  });
}
