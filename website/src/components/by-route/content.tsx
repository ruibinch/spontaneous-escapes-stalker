'use client';
import { BlackoutPeriod, FlightClassSelectOption } from '@/index';
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
import { useState } from 'react';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { MonthView } from './month-view';
import { ByRouteFilters } from './by-route-filters';
import { MilesRequiredOverTimeChart } from './charts/miles-required-over-time-chart';
import { MonthsDistributionChart } from './charts/months-distribution-chart';
import { filterRouteDetailsList } from './helpers/filter-route-details-list';
import { RouteAnalysisEntryWithDetailsList } from './helpers/make-route-details-list';
import { MonthYearFrequencyTable } from './month-year-frequency-table';
import { RouteHistoryTable } from './route-history-table';

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
  const [years, setYears] = useState<string>('All'); // comma-separated list of years
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');

  const { from, to, fromIata, toIata, detailsList } = routeInfo;

  const detailsListFiltered = filterRouteDetailsList({
    detailsList,
    filters: {
      years: years.split(','),
      flightClassOption,
    },
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/route">View by Route</BreadcrumbItem>
            <BreadcrumbItem>{`${fromIata}-${toIata}`}</BreadcrumbItem>
          </Breadcrumbs>
        }
        title={`${from} - ${to}`}
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col w-full gap-8')}>
        <ByRouteFilters
          years={years}
          setYears={setYears}
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
        />

        <div className="flex flex-col gap-4">
          <div>
            <span>Showing </span>
            <span className="font-bold">{`${detailsListFiltered.length}/${detailsList.length} redemptions`}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 xl:col-span-1">
              <MonthsDistributionChart
                detailsListFiltered={detailsListFiltered}
              />
            </div>
            <div className="col-span-2 xl:col-span-1">
              <MilesRequiredOverTimeChart
                detailsListFiltered={detailsListFiltered}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 xl:col-span-1">
            <MonthView detailsListFiltered={detailsListFiltered} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <MonthYearFrequencyTable
              data={detailsListFiltered}
              years={years.split(',')}
            />
          </div>
        </div>

        <RouteHistoryTable data={detailsList} />
      </div>
    </div>
  );
}
