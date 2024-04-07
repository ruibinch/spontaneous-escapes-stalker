import { isSearchTermExactMatch } from '@/components/common/filters/autocomplete-search-term-filter';
import { isRegionMatch } from '@/components/common/filters/region-filter';
import { FlightClassSelectOption, RedemptionEntry } from '@/index';

export function filterRedemptionEntryList({
  data,
  filters: { searchTerms, regions, flightClassOption },
}: {
  data: RedemptionEntry[];
  filters: {
    searchTerms: string[];
    regions: string[];
    flightClassOption: FlightClassSelectOption;
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
      flightClassOption === 'ALL' ||
      (flightClassOption === 'Y' && d.flightClass === 'Economy') ||
      (flightClassOption === 'W' && d.flightClass === 'Premium Economy') ||
      (flightClassOption === 'J' && d.flightClass === 'Business');

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
