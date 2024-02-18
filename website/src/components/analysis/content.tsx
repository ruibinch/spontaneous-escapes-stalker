import { cn } from '@nextui-org/react';
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
import { AlertInfo } from '../common/alert-info';
import { RedemptionsVsRouteNetworkCharts } from './redemptions-vs-route-network-charts';
import { RouteRedeemablePctTable } from './route-redeemable-pct-table';

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
  const explanatoryNotes = [
    'The SIA/SilkAir route network dataset time range spans from Nov 2017 to Feb 2024.',
    'SilkAir flights are included in the route network dataset until it ceased operations in end-2021, hence the pre-Covid network size is slightly higher as the SilkAir flights were subsequently split between SIA and Scoot.',
  ].map((note) => `• ${note}`);

  return (
    <div>
      <PageHeader
        title="Analysis"
        subtitle="Compares Spontaneous Escapes redemptions against the SIA/SilkAir route network"
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-8')}>
        <AlertInfo content={explanatoryNotes} />

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 md:col-span-2">
            <RedemptionsVsRouteNetworkCharts />
          </div>

          <div className="col-span-3 md:col-span-1">
            <RouteRedeemablePctTable />
          </div>
        </div>
      </div>
    </div>
  );
}
