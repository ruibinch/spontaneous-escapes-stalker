import { RedemptionJson } from '../utils/types';

const cityNameOverride: Record<string, string> = {
  Adaleide: 'Adelaide',
  'Beijing (PEK)': 'Beijing',
  'Beijing (PKX)': 'Beijing',
  'Beijing Daxing': 'Beijing',
  Bengaluru: 'Bangalore',
  Brunei: 'Bandar Seri Begawan',
  Chiangmai: 'Chiang Mai',
  'Chong Qing': 'Chongqing',
  Danang: 'Da Nang',
  'Davao City': 'Davao',
  Delhi: 'New Delhi',
  Denpasar: 'Bali',
  Denpansar: 'Bali',
  Dusseldorf: 'Düsseldorf',
  Incheon: 'Seoul',
  Haneda: 'Tokyo',
  'Ho Chi Minh': 'Ho Chi Minh City',
  'Kuala lumpur': 'Kuala Lumpur',
  'London (Gatwick)': 'London',
  'London Gatwick': 'London',
  'London (Heathrow)': 'London',
  'London (LGW)': 'London',
  'London (LHR)': 'London',
  Male: 'Malé',
  Myanmar: 'Yangon',
  Kalimantan: 'Balikpapan',
  Narita: 'Tokyo',
  'New York (EWR)': 'New York',
  'New York (JFK)': 'New York',
  'New York (Newark)': 'New York',
  'San Franciso': 'San Francisco',
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
  return redemptions.map((redemption) => {
    const origin = standardiseCityName(redemption.origin);
    const destination = standardiseCityName(redemption.destination);

    return {
      ...redemption,
      origin: cityNameOverride[origin] ?? origin,
      destination: cityNameOverride[destination] ?? destination,
    };
  });
}

/**
 * Standardises the city name to uppercase first letter of each word.
 *
 * Bracketed values are preserved to avoid messing up any intentional capitalisation, e.g. "New York (JFK)".
 */
function standardiseCityName(city: string) {
  const bracketedValuesRegex = /\(.*?\)/;
  const bracketedValues = city.match(bracketedValuesRegex);
  const cityWithoutBracketedValues = city.replace(bracketedValuesRegex, '');

  const cityStandardised = cityWithoutBracketedValues
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return `${cityStandardised}${bracketedValues?.[0] ?? ''}`;
}
