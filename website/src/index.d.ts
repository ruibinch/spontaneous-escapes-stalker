export type Month = string;
export type FlightClass = 'Y' | 'W' | 'J';
export type FlightClassSelectOption = FlightClass | 'ALL';

export enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  NORTH_AMERICA = 'North America',
}

export type RedemptionEntry = {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  flightClass: string;
  flightNos: string[];
  milesRequired: number;
  blackoutPeriod: Array<{
    from: string;
    to: string;
    flightNos?: string[];
  }>;
  region: string;
};

export type RouteAnalysisEntry = {
  from: string;
  to: string;
  fromIata: string;
  toIata: string;
  region: string;
  details: Array<{
    month: string;
    redemptionDetails: Record<FlightClass, RedemptionInfoSingle | null>;
    flightDetails: boolean;
  }>;
};

export type MonthSummaryAnalysisEntry = {
  month: string;
  count: number;
  byFlightClass: Record<FlightClassCode, number>;
  byRegion: Record<Region, number>;
  metadata: {
    remarks?: string[];
  };
};
export type MonthSummaryAnalysisDict = Record<
  string,
  Omit<MonthSummaryAnalysisEntry, 'month'>
>;

export type RouteFrequencyByFlightClass = Record<
  FlightClassSelectOption,
  RouteFrequencyEntry[]
>;

export type RouteFrequencyEntry = {
  from: string;
  to: string;
  fromIata: string;
  toIata: string;
  count: number;
};

export type RedemptionInfoForMonth = Record<
  FlightClass,
  RedemptionInfoSingle | null
> & {
  month: string;
};

export type RedemptionInfoSingle = {
  flightNos: string[];
  milesRequired: number;
  blackoutPeriod: Array<{
    from: string;
    to: string;
    flightNos?: string[];
  }>;
};
