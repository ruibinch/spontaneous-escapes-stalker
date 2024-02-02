import { isRegionMatch } from '@/components/common/filters/region-filter';
import { isSearchTermMatch } from '@/components/common/filters/search-term-filter';
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
      return (
        isSearchTermMatch({
          searchTerm,
          strings: [d.from, d.fromIata, d.to, d.toIata],
        }) &&
        isRegionMatch({
          regionsFiltered: regions,
          region: d.region,
        })
      );
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
