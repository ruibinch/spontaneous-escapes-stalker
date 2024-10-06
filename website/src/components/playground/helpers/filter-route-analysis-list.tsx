import { isRegionMatch as isRegionMatchFn } from '@/components/common/filters/region-filter';
import { notEmpty } from '@/common/not-empty';
import { FlightClass, RedemptionInfoSingle, RouteAnalysisEntry } from '@/index';
import { isApplicableMonth } from './is-applicable-month';
import { isSearchTermExactMatch } from '@/components/common/filters/autocomplete-search-term-filter';
import { FLIGHT_CLASS_ALL } from '@/components/common/filters/flight-class-filter';

export function filterRouteAnalysisList({
  data,
  filters: { searchTerms, flightClass, regions, startDate, endDate, months },
}: {
  data: RouteAnalysisEntry[];
  filters: {
    searchTerms: string[];
    flightClass: string;
    regions: string[];
    startDate: Date;
    endDate: Date;
    months: string[];
  };
}) {
  const isFlightClassMatchingSelOption = isFlightClassMatch(flightClass);

  return (
    data
      // check if ROUTE matches all relevant filters
      .filter((d) => {
        const isAnySearchTermExactMatch =
          searchTerms.length > 0
            ? searchTerms.some((searchTerm) =>
                isSearchTermExactMatch({
                  searchTerm,
                  strings: [
                    d.origin,
                    d.originIata,
                    d.originCountry,
                    d.destination,
                    d.destinationIata,
                    d.destinationCountry,
                  ],
                }),
              )
            : true;

        const isRegionMatch = isRegionMatchFn({
          regionsFiltered: regions,
          region: d.region,
        });

        return isAnySearchTermExactMatch && isRegionMatch;
      })
      .map((d) => {
        const detailsFiltered = d.details
          // within the ROUTE, only keep the relevant MONTH entries
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
          // for each MONTH, only keep the relevant FLIGHTCLASS entries
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
      })
  );
}

const isFlightClassMatch =
  (flightClassOption: string) => (flightClassCode: FlightClass) => {
    return (
      flightClassOption === FLIGHT_CLASS_ALL ||
      flightClassOption === flightClassCode
    );
  };
