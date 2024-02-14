import { isRegionMatch } from '@/components/common/filters/region-filter';
import { isSearchTermMatch } from '@/components/common/filters/search-term-filter';
import { FlightClassSelectOption, RedemptionEntry } from '@/index';

export function filterRedemptionEntryList({
  data,
  filters: { searchTerm, regions, flightClassOption },
}: {
  data: RedemptionEntry[];
  filters: {
    searchTerm: string;
    regions: string[];
    flightClassOption: FlightClassSelectOption;
  };
}) {
  return data.filter((d) => {
    const isFlightClassMatch =
      flightClassOption === 'ALL' ||
      (flightClassOption === 'Y' && d.flightClass === 'Economy') ||
      (flightClassOption === 'W' && d.flightClass === 'Premium Economy') ||
      (flightClassOption === 'J' && d.flightClass === 'Business');

    return (
      isSearchTermMatch({
        searchTerm,
        strings: [d.origin, d.originIata, d.destination, d.destinationIata],
      }) &&
      isRegionMatch({
        regionsFiltered: regions,
        region: d.region,
      }) &&
      isFlightClassMatch
    );
  });
}
