import { FLIGHT_CLASS_ALL } from '@/components/common/filters/flight-class-filter';
import { isYearMatch } from '@/components/common/filters/year-filter';
import { RouteDetailDatum } from './make-route-details-list';

export function filterRouteDetailsList({
  detailsList,
  filters: { years, flightClass },
}: {
  detailsList: RouteDetailDatum[];
  filters: {
    years: string[];
    flightClass: string;
  };
}): RouteDetailDatum[] {
  return detailsList.filter((detail) => {
    const isFlightClassMatch =
      flightClass === FLIGHT_CLASS_ALL || flightClass === detail.flightClass;

    return (
      isYearMatch({ yearsFiltered: years, year: detail.month.slice(0, 4) }) &&
      isFlightClassMatch
    );
  });
}
