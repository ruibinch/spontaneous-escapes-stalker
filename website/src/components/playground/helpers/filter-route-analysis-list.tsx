import {
  FlightClass,
  FlightClassSelectOption,
  RouteAnalysisEntry,
} from '@/index';
import { isApplicableMonth } from './is-applicable-month';

export function filterRouteAnalysisList({
  data,
  filters: {
    searchTerm,
    flightClassOption,
    regions,
    startDate,
    endDate,
    months,
  },
}: {
  data: RouteAnalysisEntry[];
  filters: {
    searchTerm: string;
    flightClassOption: FlightClassSelectOption;
    regions: string[];
    startDate: Date;
    endDate: Date;
    months: string[];
  };
}) {
  const isFlightClassMatchingSelOption = isFlightClassMatch(flightClassOption);

  return data
    .filter((d) => {
      const isSearchTermMatch =
        searchTerm === ''
          ? true
          : d.from.toLowerCase().includes(searchTerm) ||
            d.fromIata.toLowerCase().includes(searchTerm) ||
            d.to.toLowerCase().includes(searchTerm) ||
            d.toIata.toLowerCase().includes(searchTerm);

      const isRegionsMatch =
        regions.includes('All') || regions.includes(d.region);

      return isSearchTermMatch && isRegionsMatch;
    })
    .map((d) => {
      const detailsFiltered = Object.entries(d.details).reduce(
        (
          _detailsFiltered: RouteAnalysisEntry['details'],
          [month, detailsInfo],
        ) => {
          const _isApplicableMonth = isApplicableMonth({
            month,
            filters: {
              startDate,
              endDate,
              months,
            },
          });

          if (_isApplicableMonth) {
            _detailsFiltered[month] = {
              Y: isFlightClassMatchingSelOption('Y') ? detailsInfo.Y : null,
              PY: isFlightClassMatchingSelOption('PY') ? detailsInfo.PY : null,
              J: isFlightClassMatchingSelOption('J') ? detailsInfo.J : null,
            };
          }
          return _detailsFiltered;
        },
        {},
      );

      return {
        ...d,
        details: detailsFiltered,
      };
    });
}

const isFlightClassMatch =
  (flightClassOption: FlightClassSelectOption) =>
  (flightClassCode: FlightClass) => {
    return flightClassOption === 'ALL' || flightClassOption === flightClassCode;
  };
