export enum FlightClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

export interface RedemptionTableInfo {
  origin: string;
  destination: string;
  flightClass: FlightClass;
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string; // TODO: to be formatted better
}

export interface RedemptionTableInfoWithRegion extends RedemptionTableInfo {
  region: string;
}

export interface RedemptionInfo extends RedemptionTableInfoWithRegion {
  validUntil: Date; // TODO:
  travelPeriod: string[]; // TODO:
}
