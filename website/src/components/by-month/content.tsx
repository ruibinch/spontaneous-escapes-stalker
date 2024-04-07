'use client';
import { monthNumToNameMap } from '@/common/months-map';
import {
  FlightClassSelectOption,
  MonthSummaryAnalysisEntry,
  RedemptionEntry,
} from '@/index';
import { BreadcrumbItem, Breadcrumbs, cn } from '@nextui-org/react';
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
import { RedemptionsTable } from './redemptions-table';
import { ByMonthFilters } from './by-month-filters';
import { filterRedemptionEntryList } from './helpers/filter-redemption-entry-list';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { FlightClassDistributionChart } from './charts/flight-class-distribution-chart';
import { RoutesRegionDistributionChart } from './charts/routes-region-distribution-chart';
import { AlertInfo } from '../common/alert-info';
import { SelectOptions } from '../common/filters/autocomplete-search-term-filter';

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

export function ByMonthContent({
  month,
  redemptions,
  monthSummaryAnalysisEntry,
}: {
  month: string;
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

      <div className={cn(CommonStyles.Page(), 'flex flex-col w-full gap-8')}>
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
    </div>
  );
}
