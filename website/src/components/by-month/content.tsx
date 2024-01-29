'use client';
import { monthNumToNameMap } from '@/common/months-map';
import { FlightClassSelectOption, RedemptionEntry } from '@/index';
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
  redemptions,
  month,
}: {
  redemptions: RedemptionEntry[];
  month: string;
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');
  const [regions, setRegions] = useState<string>('All'); // comma-separated list of regions

  const redemptionsFiltered = filterRedemptionEntryList({
    data: redemptions,
    filters: {
      searchTerm,
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
        <ByMonthFilters
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          regions={regions}
          setRegions={setRegions}
        />

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

        <RedemptionsTable
          data={redemptionsFiltered}
          tableSummaryComponent={
            <TableSummary
              redemptions={redemptions}
              redemptionsFiltered={redemptionsFiltered}
            />
          }
        />
      </div>
    </div>
  );
}

function TableSummary({
  redemptions,
  redemptionsFiltered,
}: {
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
}) {
  return redemptions.length === redemptionsFiltered.length ? (
    <div>
      <span>Total </span>
      <span className="font-bold">{`${redemptionsFiltered.length} entries`}</span>
    </div>
  ) : (
    <div>
      <span>Showing </span>
      <span className="font-bold">{`${redemptionsFiltered.length} of ${redemptions.length} entries`}</span>
    </div>
  );
}
