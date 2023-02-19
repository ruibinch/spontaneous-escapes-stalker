import { Redemption } from './models/Redemption';

// Base information that can be obtained from each individual redemption table
export type RedemptionTableInfo = Omit<
  Redemption,
  'region' | 'redemptionEndDate'
>;

export type RedemptionTableInfoWithRegion = Omit<
  Redemption,
  'redemptionEndDate'
>;

export interface TimePeriod {
  from: Date;
  to: Date;
}
