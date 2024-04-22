'use client';
import { monthNumToNameMap } from '@/common/months-map';
import {
  FlightClassSelectOption,
  MonthSummaryAnalysisEntry,
  RedemptionEntry,
} from '@/index';
import { getMonthRedemptionsAndSummaryAnalysis } from '@/queries/getMonthRedemptionsAndSummaryAnalysis';
import { BreadcrumbItem, Breadcrumbs, Skeleton, cn } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { AlertInfo } from '../common/alert-info';
import { SelectOptions } from '../common/filters/autocomplete-search-term-filter';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { ByMonthFilters } from './by-month-filters';
import { FlightClassDistributionChart } from './charts/flight-class-distribution-chart';
import { RoutesRegionDistributionChart } from './charts/routes-region-distribution-chart';
import { filterRedemptionEntryList } from './helpers/filter-redemption-entry-list';
import { RedemptionsTable } from './redemptions-table';
import { AlertApiError } from '../common/alert-api-error';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export function ByMonth({ month }: { month: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['by-month', month],
    queryFn: () => getMonthRedemptionsAndSummaryAnalysis(month),
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/month">View by Month</BreadcrumbItem>
            <BreadcrumbItem>{`${month.slice(0, 4)}-${month.slice(
              4,
              6,
            )}`}</BreadcrumbItem>
          </Breadcrumbs>
        }
        title={`${month.slice(0, 4)} ${monthNumToNameMap[month.slice(4, 6)]}`}
      />

      <div className={cn(CommonStyles.Page())}>
        {isLoading && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Skeleton className="h-12 rounded-md col-span-2" />
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg col-span-2" />
            </div>

            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 rounded-md w-1/4" />

              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-52 rounded-md col-span-2 xl:col-span-1" />
                <Skeleton className="h-52 rounded-md col-span-2 xl:col-span-1" />
              </div>

              <Skeleton className="h-96 rounded-md" />
            </div>
          </div>
        )}

        {isError && <AlertApiError refetch={refetch} />}

        {data && (
          <ByMonthContent
            redemptions={data.redemptions}
            monthSummaryAnalysisEntry={data.monthSummaryAnalysisEntry}
          />
        )}
      </div>
    </div>
  );
}

function ByMonthContent({
  redemptions,
  monthSummaryAnalysisEntry,
}: {
  redemptions: RedemptionEntry[];
  monthSummaryAnalysisEntry: MonthSummaryAnalysisEntry;
}) {
  const [searchTerms, setSearchTerms] = useState<SelectOptions>([]);
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');
  const [regions, setRegions] = useState<string>('All'); // comma-separated list of regions

  const redemptionsFiltered = filterRedemptionEntryList({
    data: redemptions,
    filters: {
      searchTerms: searchTerms.map((term) => term.value),
      regions: regions.split(','),
      flightClassOption,
    },
  });

  const isFilterActive = redemptions.length !== redemptionsFiltered.length;

  return (
    <div className="flex flex-col gap-8">
      {monthSummaryAnalysisEntry.metadata.remarks && (
        <AlertInfo content={monthSummaryAnalysisEntry.metadata.remarks} />
      )}

      <ByMonthFilters
        flightClassOption={flightClassOption}
        setFlightClassOption={setFlightClassOption}
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
        redemptions={redemptions}
        regions={regions}
        setRegions={setRegions}
      />

      <div className="flex flex-col gap-4">
        <div>
          <span>Showing </span>
          <span className="font-bold">{`${redemptionsFiltered.length}/${redemptions.length} redemptions`}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 xl:col-span-1">
            <FlightClassDistributionChart
              redemptionsFiltered={redemptionsFiltered}
              isFilterActive={isFilterActive}
            />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <RoutesRegionDistributionChart
              redemptionsFiltered={redemptionsFiltered}
              isFilterActive={isFilterActive}
            />
          </div>
        </div>
      </div>

      <RedemptionsTable data={redemptionsFiltered} />
    </div>
  );
}
