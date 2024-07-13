import { isSearchTermExactMatch } from '@/components/common/filters/autocomplete-search-term-filter';
import { FLIGHT_CLASS_ALL } from '@/components/common/filters/flight-class-filter';
import { isRegionMatch } from '@/components/common/filters/region-filter';
import { RedemptionEntry } from '@/index';

export function filterRedemptionEntryList({
  data,
  filters: { searchTerms, regions, flightClass },
}: {
  data: RedemptionEntry[];
  filters: {
    searchTerms: string[];
    regions: string[];
    flightClass: string;
  };
}) {
  return data.filter((d) => {
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

    const isFlightClassMatch =
      flightClass === FLIGHT_CLASS_ALL ||
      (flightClass === 'Y' && d.flightClass === 'Economy') ||
      (flightClass === 'W' && d.flightClass === 'Premium Economy') ||
      (flightClass === 'J' && d.flightClass === 'Business');

    return (
      isAnySearchTermExactMatch &&
      isRegionMatch({
        regionsFiltered: regions,
        region: d.region,
      }) &&
      isFlightClassMatch
    );
  });
}
