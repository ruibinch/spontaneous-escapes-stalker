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
import { Tabs, Tab } from '@nextui-org/react';

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
    <div>
      <PageHeader title="Analysis" rightComponent={<SilkairRoutesToggle />} />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-6')}>
        <Tabs aria-label="Analysis tabs" size="lg">
          <Tab
            key="comparisonWithRouteNetwork"
            title="% of route network available for redemption"
          >
            <ComparisonWithRouteNetwork
              monthSummaryAnalysisList={monthSummaryAnalysisList}
              routeAnalysisList={routeAnalysisList}
            />
          </Tab>
          <Tab key="blackoutPct" title="Blackout %">
            <BlackoutPct
              monthSummaryAnalysisList={monthSummaryAnalysisList}
              routeAnalysisList={routeAnalysisList}
            />
          </Tab>
        </Tabs>

        {/* TODO: by region drilldown? */}
      </div>
    </div>
  );
}
