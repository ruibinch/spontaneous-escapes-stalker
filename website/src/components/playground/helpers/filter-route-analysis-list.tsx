import { monthNameToNumMap } from '@/common/months-map';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { RouteAnalysisEntry } from '@/index';
import { isAfter, isBefore } from 'date-fns';

export function filterRouteAnalysisList({
  data,
  filters: { searchTerm, regions, startDate, endDate, months },
}: {
  data: RouteAnalysisEntry[];
  filters: {
    searchTerm: string;
    regions: string[];
    startDate: Date;
    endDate: Date;
    months: string[];
  };
}) {
  const monthsInNumFormat = months.map((month) =>
    month === 'All' ? month : monthNameToNumMap[month],
  );

  return data
    .filter((d) => {
      const isSearchTermMatch =
        searchTerm === ''
          ? true
          : d.from.toLowerCase().includes(searchTerm) ||
            d.fromIata.toLowerCase().includes(searchTerm) ||
            d.to.toLowerCase().includes(searchTerm) ||
            d.toIata.toLowerCase().includes(searchTerm);

      const isRegionsMatch =
        regions.includes('All') || regions.includes(d.region);

      return isSearchTermMatch && isRegionsMatch;
    })
    .map((d) => {
      const detailsFiltered = Object.entries(d.details).reduce(
        (
          _detailsFiltered: RouteAnalysisEntry['details'],
          [month, detailsInfo],
        ) => {
          const monthDate = yyyymmToDate(month);
          const isOutsideDateBounds =
            isBefore(monthDate, startDate) || isAfter(monthDate, endDate);
          const isValidMonth =
            monthsInNumFormat.includes('All') ||
            monthsInNumFormat.includes(month.slice(4, 6));

          if (!isOutsideDateBounds && isValidMonth) {
            _detailsFiltered[month] = detailsInfo;
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
