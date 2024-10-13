'use client';
import { monthNumToNameMap } from '@/common/months-map';
import { MonthSummaryAnalysisEntry, RedemptionEntry } from '@/index';
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
import { useSearchParams } from 'next/navigation';
import { AlertInfo } from '../common/alert-info';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { REGION_ALL } from '../common/filters/region-filter';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { ByMonthFilters } from './by-month-filters';
import { ByMonthSummary } from './by-month-summary';
import { FlightClassDistributionChart } from './charts/flight-class-distribution-chart';
import { RoutesRegionDistributionChart } from './charts/routes-region-distribution-chart';
import { filterRedemptionEntryList } from './helpers/filter-redemption-entry-list';
import { RedemptionsTable } from './redemptions-table';
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';

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

// TODO: clarify on disableSkeleton behaviour
export function ByMonthContent({
  month,
  redemptionsFull,
  redemptionsSiaOnly,
  monthSummaryAnalysisEntry,
}: {
  month: string;
  redemptionsFull: RedemptionEntry[];
  redemptionsSiaOnly: RedemptionEntry[];
  monthSummaryAnalysisEntry: MonthSummaryAnalysisEntry;
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const redemptions = showSilkairRoutes ? redemptionsFull : redemptionsSiaOnly;
  const shouldShowSilkairRoutesToggle =
    redemptionsFull.length !== redemptionsSiaOnly.length;

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('searchTerm') ?? '';
  const flightClass = searchParams.get('flightClass') ?? FLIGHT_CLASS_ALL;
  const region = searchParams.get('region') ?? REGION_ALL;

  const redemptionsFiltered = filterRedemptionEntryList({
    data: redemptions,
    filters: {
      searchTerms: searchTerm.split(',').filter(Boolean),
      regions: region.split(','),
      flightClass,
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
        rightComponent={
          shouldShowSilkairRoutesToggle && <SilkairRoutesToggle />
        }
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col w-full gap-8')}>
        {monthSummaryAnalysisEntry.metadata.remarks && (
          <AlertInfo content={monthSummaryAnalysisEntry.metadata.remarks} />
        )}

        <ByMonthFilters redemptions={redemptions} />

        <div className="flex flex-col gap-4">
          <ByMonthSummary
            month={month}
            redemptions={redemptions}
            redemptionsFiltered={redemptionsFiltered}
            disableSkeleton
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 xl:col-span-1">
              <FlightClassDistributionChart
                redemptionsFiltered={redemptionsFiltered}
                isFilterActive={isFilterActive}
                disableSkeleton
              />
            </div>
            <div className="col-span-2 xl:col-span-1">
              <RoutesRegionDistributionChart
                redemptionsFiltered={redemptionsFiltered}
                disableSkeleton
              />
            </div>
          </div>
        </div>

        <RedemptionsTable data={redemptionsFiltered} />
      </div>
    </div>
  );
}
