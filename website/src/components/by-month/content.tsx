'use client';
import { monthNumToNameMap } from '@/common/months-map';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import {
  MonthSummaryAnalysisEntry,
  RedemptionEntry,
  RouteAnalysisEntry,
} from '@/index';
import { BreadcrumbItem, Breadcrumbs, Skeleton, cn } from '@heroui/react';
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
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AlertInfo } from '../common/alert-info';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { REGION_ALL } from '../common/filters/region-filter';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { ByMonthFilters } from './by-month-filters';
import { ByMonthSummary } from './by-month-summary';
import { MonthHighlights } from './month-highlights';
import { filterRedemptionEntryList } from './helpers/filter-redemption-entry-list';

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

const ByMonthCharts = dynamic(
  () => import('./by-month-charts').then((mod) => mod.ByMonthCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="col-span-2 xl:col-span-1">
            <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
          </div>
        ))}
      </div>
    ),
  },
);
const RedemptionsTable = dynamic(
  () => import('./redemptions-table').then((mod) => mod.RedemptionsTable),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
    ),
  },
);

export function ByMonthContent({
  month,
  redemptionsFull,
  redemptionsSiaOnly,
  monthSummaryAnalysisEntry,
  routeAnalysisList,
  totalMonths,
}: {
  month: string;
  redemptionsFull: RedemptionEntry[];
  redemptionsSiaOnly: RedemptionEntry[];
  monthSummaryAnalysisEntry: MonthSummaryAnalysisEntry;
  routeAnalysisList: RouteAnalysisEntry[];
  totalMonths: number;
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const redemptions = showSilkairRoutes ? redemptionsFull : redemptionsSiaOnly;
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

  const monthName = monthNumToNameMap[month.slice(4, 6)];
  const year = month.slice(0, 4);
  const uniqueRoutes =
    monthSummaryAnalysisEntry.byUniqueRoutes.availableForRedemption.total;

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-8">
        <PageHeader
          breadcrumbs={
            <Breadcrumbs size="md">
              <BreadcrumbItem href="/month">Monthly View</BreadcrumbItem>
              <BreadcrumbItem>{`${year}-${month.slice(4, 6)}`}</BreadcrumbItem>
            </Breadcrumbs>
          }
          title={`${year} ${monthName}`}
          subtitle={`${uniqueRoutes} routes · ${redemptions.length} redemptions`}
        />

        {monthSummaryAnalysisEntry.metadata.remarks && (
          <AlertInfo content={monthSummaryAnalysisEntry.metadata.remarks} />
        )}

        <MonthHighlights
          redemptions={redemptions}
          routeAnalysisList={routeAnalysisList}
          totalMonths={totalMonths}
        />

        <ByMonthFilters redemptions={redemptions} />

        <div className="flex flex-col gap-6">
          <ByMonthSummary
            month={month}
            redemptions={redemptions}
            redemptionsFiltered={redemptionsFiltered}
          />

          <ByMonthCharts
            redemptionsFiltered={redemptionsFiltered}
            isFilterActive={isFilterActive}
          />
        </div>

        <RedemptionsTable data={redemptionsFiltered} />
      </div>
    </div>
  );
}
