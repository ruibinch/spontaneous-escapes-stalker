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

export enum FlightClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

export interface TimePeriod {
  from: Date;
  to: Date;
}

export interface TimePeriodSerialized {
  from: string;
  to: string;
}
