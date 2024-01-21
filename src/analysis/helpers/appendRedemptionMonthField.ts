import { RedemptionJson, RedemptionJsonWithMonth } from '../../utils/types';

/**
 * Preprocessing before analysis.
 *
 * Appends the redemptionMonth field to each Redemption object.
 */
export function appendRedemptionMonthField({
  redemptions,
  month,
}: {
  redemptions: RedemptionJson[];
  month: string;
}): RedemptionJsonWithMonth[] {
  return redemptions.map((redemption) => ({
    ...redemption,
    redemptionMonth: month,
  }));
}
