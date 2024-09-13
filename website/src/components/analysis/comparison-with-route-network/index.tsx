import { AlertInfo } from '@/components/common/alert-info';
import { RedemptionsVsRouteNetworkCharts } from './redemptions-vs-route-network-charts';
import { RouteRedeemablePctTable } from './route-redeemable-pct-table';
import { SilkairRoutesToggle } from '../silkair-routes-toggle';
import { SectionHeader } from '../section-header';

export function ComparisonWithRouteNetwork() {
  const explanatoryNotes = [
    'The SIA/SilkAir route network dataset time range spans from Nov 2017 to Feb 2024.',
    'SilkAir ceased operations in end-2021; subsequently its flights were split between SIA and Scoot.',
  ].map((note) => `• ${note}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <SectionHeader header="Comparison with SIA/SilkAir route network" />
        <SilkairRoutesToggle />
      </div>

      <AlertInfo content={explanatoryNotes} />

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3 md:col-span-2">
          <RedemptionsVsRouteNetworkCharts />
        </div>

        <div className="col-span-3 md:col-span-1">
          <RouteRedeemablePctTable />
        </div>
      </div>
    </div>
  );
}
