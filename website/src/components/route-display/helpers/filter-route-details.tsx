import {
  FlightClass,
  FlightClassSelectOption,
  RedemptionInfoForMonth,
  RouteAnalysisEntry,
} from '@/index';

export function filterRouteDetails({
  details,
  filters: { years, flightClassOption },
}: {
  details: RouteAnalysisEntry['details'];
  filters: {
    years: string[];
    flightClassOption: FlightClassSelectOption;
  };
}): RedemptionInfoForMonth[] {
  const isFlightClassMatchingSelOption = isFlightClassMatch(flightClassOption);

  const routeDetailsList = Object.entries(details)
    .filter(([yyyymm]) => {
      return years.includes('All') || years.includes(yyyymm.slice(0, 4));
    })
    .map(([yyyymm, detail]) => {
      return {
        month: yyyymm,
        Y: isFlightClassMatchingSelOption('Y') ? detail.Y : null,
        PY: isFlightClassMatchingSelOption('PY') ? detail.PY : null,
        J: isFlightClassMatchingSelOption('J') ? detail.J : null,
      };
    });

  return routeDetailsList;
}

const isFlightClassMatch =
  (flightClassOption: FlightClassSelectOption) =>
  (flightClassCode: FlightClass) => {
    return flightClassOption === 'ALL' || flightClassOption === flightClassCode;
  };
