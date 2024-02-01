import { FlightClassSelectOption } from '@/index';
import { RouteDetailDatum } from './make-route-details-list';

export function filterRouteDetailsList({
  detailsList,
  filters: { years, flightClassOption },
}: {
  detailsList: RouteDetailDatum[];
  filters: {
    years: string[];
    flightClassOption: FlightClassSelectOption;
  };
}) {
  return detailsList.filter((detail) => {
    const isYearMatch =
      years.includes('All') || years.includes(detail.month.slice(0, 4));
    const isFlightClassMatch =
      flightClassOption === 'ALL' || flightClassOption === detail.flightClass;

    return isYearMatch && isFlightClassMatch;
  });
}
