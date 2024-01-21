import { Redemption } from '../models/Redemption';

// Base information that can be obtained from each individual redemption table
export type RedemptionTableInfo = Omit<
  Redemption,
  'region' | 'redemptionEndDate'
>;

export type RedemptionTableInfoWithRegion = Omit<
  Redemption,
  'redemptionEndDate'
>;

// Exclude the class-level fields
export type RedemptionJson = Pick<
  Redemption,
  | 'origin'
  | 'destination'
  | 'flightClass'
  | 'flightNo'
  | 'milesRequired'
  | 'blackoutPeriod'
  | 'region'
  | 'redemptionEndDate'
  | 'sortKey'
>;
export type RedemptionJsonPostprocessed = Omit<
  RedemptionJson,
  'redemptionEndDate' | 'sortKey'
> & {
  originIata: string;
  destinationIata: string;
  redemptionMonth: string;
};

export enum FlightClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

export enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  USA = 'USA',
}

export interface BlackoutPeriod {
  from: string;
  to: string;
  flightNos?: string[]; // if undefined, then it's applicable for all flights
}

export interface TimePeriod {
  from: Date;
  to: Date;
}

export interface TimePeriodSerialized {
  from: string;
  to: string;
}
