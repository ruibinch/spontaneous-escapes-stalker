'use client';
import { BreadcrumbItem, Breadcrumbs, cn } from '@nextui-org/react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { ByRouteFilters } from './by-route-filters';
import { BlackoutPctOverTimeChart } from './charts/blackout-pct-over-time-chart';
import { MonthsDistributionChart } from './charts/months-distribution-chart';
import { filterRouteDetailsList } from './helpers/filter-route-details-list';
import { RouteAnalysisEntryWithDetailsList } from './helpers/make-route-details-list';
import { MonthView } from './month-view';
import { MonthYearFrequencyTable } from './month-year-frequency-table';
import { RouteHistoryTable } from './route-history-table';
import { useSearchParams } from 'next/navigation';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { YEAR_ALL } from '../common/filters/year-filter';
import { ByRouteSummary } from './by-route-summary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function ByRouteContent({
  routeInfo,
}: {
  routeInfo: RouteAnalysisEntryWithDetailsList;
}) {
  const searchParams = useSearchParams();
  const flightClass = searchParams.get('flightClass') ?? FLIGHT_CLASS_ALL;
  const year = searchParams.get('year') ?? YEAR_ALL;

  const { origin, destination, originIata, destinationIata, detailsList } =
    routeInfo;

  const detailsListFiltered = filterRouteDetailsList({
    detailsList,
    filters: {
      years: year.split(','),
      flightClass,
    },
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/route">View by Route</BreadcrumbItem>
            <BreadcrumbItem>{`${originIata}-${destinationIata}`}</BreadcrumbItem>
          </Breadcrumbs>
        }
        title={`${origin} - ${destination}`}
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col w-full gap-8')}>
        <ByRouteFilters />

        <div className="flex flex-col gap-4">
          <ByRouteSummary
            routeMetadata={{ originIata, destinationIata }}
            detailsList={detailsList}
            detailsListFiltered={detailsListFiltered}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 xl:col-span-1">
              <MonthsDistributionChart
                detailsListFiltered={detailsListFiltered}
              />
            </div>
            <div className="col-span-2 xl:col-span-1">
              <BlackoutPctOverTimeChart
                detailsListFiltered={detailsListFiltered}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:gap-2">
          <div className="col-span-2 xl:col-span-1">
            <MonthYearFrequencyTable data={detailsListFiltered} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <MonthView detailsListFiltered={detailsListFiltered} />
          </div>
        </div>

        <RouteHistoryTable data={detailsListFiltered} />
      </div>
    </div>
  );
}
