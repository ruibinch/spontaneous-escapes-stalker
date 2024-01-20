import { Redemption } from '../../models/Redemption';

const cityMapper: Record<string, string> = {
  Bengaluru: 'Bangalore',
  Delhi: 'New Delhi',
  Denpasar: 'Bali',
  Dusseldorf: 'Düsseldorf',
  Haneda: 'Tokyo (Haneda)',
  'Ho Chi Minh': 'Ho Chi Minh City',
  'Kuala lumpur': 'Kuala Lumpur',
  Male: 'Malé',
  Narita: 'Tokyo (Narita)',
  Sinapore: 'Singapore',
  Zurich: 'Zürich',
};

/**
 * Preprocessing before analysis.
 *
 * Handles the cleanup of city fields to fix any non-standardised namings or casing/naming discrepancies.
 */
export function cleanupCityFields(redemptions: Redemption[]) {
  return redemptions.map((redemption) =>
    Redemption.create({
      ...redemption,
      origin: cityMapper[redemption.origin] ?? redemption.origin,
      destination: cityMapper[redemption.destination] ?? redemption.destination,
      redemptionEndDate: new Date(redemption.redemptionEndDate),
    }),
  );
}
