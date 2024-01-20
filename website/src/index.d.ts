export type RouteAnalysisEntry = {
  from: string;
  to: string;
  fromIata: string;
  toIata: string;
  region: string;
  details: Record<Month, Record<FlightClass, SingleRedemptionInfo | null>>;
};

export type Month = string;
export type FlightClass = 'Y' | 'PY' | 'J';
export type FlightClassSelectOption = FlightClass | 'ALL';
export type SingleRedemptionInfo = {
  flightNo: string;
  milesRequired: number;
  blackoutPeriod: string[];
};
