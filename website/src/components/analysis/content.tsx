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

export function AnalysisContent() {
  return (
    <div>
      <PageHeader title="Analysis" rightComponent={<SilkairRoutesToggle />} />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-6')}>
        <ComparisonWithRouteNetwork />

        <Divider />
        <BlackoutPct />

        {/* TODO: by region drilldown? */}
      </div>
    </div>
  );
}
