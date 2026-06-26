'use client';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { Divider } from '@heroui/react';
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
import { CommonStyles } from '../common/styles';
import { ProgramOverview } from './program-overview';
import { SeasonalGuide } from './seasonal-guide';
import { RouteLifecycle } from './route-lifecycle';
import { ClassDistribution } from './class-distribution';
import { RegionalBreakdown } from './regional-breakdown';
import { BestValueRoutes } from './best-value-routes';
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
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Trends & Insights"
          subtitle="Deep analysis of program patterns, network coverage, and availability trends"
        />

        <ProgramOverview
          monthSummaryAnalysisList={monthSummaryAnalysisList}
        />

        <Divider />

        <SeasonalGuide
          monthSummaryAnalysisList={monthSummaryAnalysisList}
        />

        <Divider />

        <BestValueRoutes routeAnalysisList={routeAnalysisList} />

        <Divider />

        <RouteLifecycle routeAnalysisList={routeAnalysisList} />

        <Divider />

        <ClassDistribution
          monthSummaryAnalysisList={monthSummaryAnalysisList}
        />

        <Divider />

        <RegionalBreakdown
          monthSummaryAnalysisList={monthSummaryAnalysisList}
        />

        <Divider />

        <BlackoutPct
          monthSummaryAnalysisList={monthSummaryAnalysisList}
          routeAnalysisList={routeAnalysisList}
        />

        <Divider />

        <ComparisonWithRouteNetwork
          monthSummaryAnalysisList={monthSummaryAnalysisList}
          routeAnalysisList={routeAnalysisList}
        />
      </div>
    </div>
  );
}
