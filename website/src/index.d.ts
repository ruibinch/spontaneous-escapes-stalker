export type RedemptionEntry = {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  flightClass: string;
  flightNo: string;
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
  details: Record<Month, Record<FlightClass, SingleRedemptionInfo | null>>;
};

export type MonthSummaryAnalysis = Record<
  string,
  {
    flightClass: Record<FlightClass, number>;
    region: Record<Region, number>;
  }
>;

export type Month = string;
export type FlightClass = 'Y' | 'PY' | 'J';
export type FlightClassSelectOption = FlightClass | 'ALL';
export type SingleRedemptionInfo = {
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string[];
};

enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  USA = 'USA',
}
