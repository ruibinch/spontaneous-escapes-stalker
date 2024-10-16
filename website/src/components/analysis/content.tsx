'use client';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { Divider, cn } from '@nextui-org/react';
import {
  ArcElement,
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
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { CommonStyles } from '../common/styles';
import { BlackoutPct } from './blackout-pct';
import { ComparisonWithRouteNetwork } from './comparison-with-route-network';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export function AnalysisContent({
  monthSummaryAnalysisList,
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
}: {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
}) {
  const { showSilkairRoutes, isSilkairRoutesContextLoaded } =
    useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

  return (
    <div>
      <PageHeader
        title="Analysis"
        rightComponent={<SilkairRoutesToggle />}
        isLoaded={isSilkairRoutesContextLoaded}
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-6')}>
        <ComparisonWithRouteNetwork
          monthSummaryAnalysisList={monthSummaryAnalysisList}
          routeAnalysisList={routeAnalysisList}
        />

        <Divider />
        <BlackoutPct
          monthSummaryAnalysisList={monthSummaryAnalysisList}
          routeAnalysisList={routeAnalysisList}
        />

        {/* TODO: by region drilldown? */}
      </div>
    </div>
  );
}
