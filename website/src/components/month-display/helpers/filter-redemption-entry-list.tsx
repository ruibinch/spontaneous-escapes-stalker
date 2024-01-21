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
    const isSearchTermMatch =
      searchTerm === ''
        ? true
        : d.origin.toLowerCase().includes(searchTerm) ||
          d.originIata.toLowerCase().includes(searchTerm) ||
          d.destination.toLowerCase().includes(searchTerm) ||
          d.destinationIata.toLowerCase().includes(searchTerm);

    const isRegionsMatch =
      regions.includes('All') || regions.includes(d.region);

    const isFlightClassMatch =
      flightClassOption === 'ALL' ||
      (flightClassOption === 'Y' && d.flightClass === 'Economy') ||
      (flightClassOption === 'PY' && d.flightClass === 'Premium Economy') ||
      (flightClassOption === 'J' && d.flightClass === 'Business');

    return isSearchTermMatch && isRegionsMatch && isFlightClassMatch;
  });
}
