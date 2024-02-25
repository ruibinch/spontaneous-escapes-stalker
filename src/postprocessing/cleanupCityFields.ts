import { RedemptionJson } from '../utils/types';

const cityMapper: Record<string, string> = {
  Bengaluru: 'Bangalore',
  Brunei: 'Bandar Seri Begawan',
  Chiangmai: 'Chiang Mai',
  'Davao City': 'Davao',
  Delhi: 'New Delhi',
  Denpasar: 'Bali',
  Dusseldorf: 'Düsseldorf',
  Haneda: 'Tokyo',
  'Ho Chi Minh': 'Ho Chi Minh City',
  'Kuala lumpur': 'Kuala Lumpur',
  Male: 'Malé',
  Kalimantan: 'Balikpapan',
  Narita: 'Tokyo',
  'New York (JFK)': 'New York',
  'New York (Newark)': 'New York',
  Sermarang: 'Semarang',
  'Siam Reap': 'Siem Reap',
  'Seoul (Incheon)': 'Seoul',
  'Tokyo (Haneda)': 'Tokyo',
  'Tokyo (Narita)': 'Tokyo',
  Sinapore: 'Singapore',
  Zurich: 'Zürich',
};

/**
 * Handles the cleanup of city fields to fix any non-standardised namings or casing/naming discrepancies.
 *
 * Also combines cities with multiple airports together (e.g. Tokyo, New York) for simplicity.
 */
export function cleanupCityFields(
  redemptions: RedemptionJson[],
): RedemptionJson[] {
  return redemptions.map((redemption) => ({
    ...redemption,
    origin: cityMapper[redemption.origin] ?? redemption.origin,
    destination: cityMapper[redemption.destination] ?? redemption.destination,
  }));
}
