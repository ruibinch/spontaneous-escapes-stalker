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
      const detailsFiltered = d.details
        .filter((detail) => {
          return isApplicableMonth({
            month: detail.month,
            filters: {
              startDate,
              endDate,
              months,
            },
          });
        })
        .map((detail) => {
          return {
            ...detail,
            redemptionDetails: {
              Y: isFlightClassMatchingSelOption('Y')
                ? detail.redemptionDetails.Y
                : null,
              W: isFlightClassMatchingSelOption('W')
                ? detail.redemptionDetails.W
                : null,
              J: isFlightClassMatchingSelOption('J')
                ? detail.redemptionDetails.J
                : null,
            },
          };
        });

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
