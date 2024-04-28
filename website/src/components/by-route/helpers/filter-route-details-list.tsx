import { isYearMatch } from '@/components/common/filters/year-filter';
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
}): RouteDetailDatum[] {
  return detailsList.filter((detail) => {
    const isFlightClassMatch =
      flightClassOption === 'ALL' || flightClassOption === detail.flightClass;

    return (
      isYearMatch({ yearsFiltered: years, year: detail.month.slice(0, 4) }) &&
      isFlightClassMatch
    );
  });
}
