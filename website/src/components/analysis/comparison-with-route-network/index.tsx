import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { CommonStyles } from '../../common/styles';
import { RedemptionsVsRouteNetworkCharts } from './redemptions-vs-route-network-charts';
import { RouteRedeemablePctTable } from './route-redeemable-pct-table';

export function ComparisonWithRouteNetwork({
  monthSummaryAnalysisList,
  routeAnalysisList,
}: {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>
          Route Network Coverage
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          How Spontaneous Escapes compares to SIA&apos;s full route network
          (OAG data: Nov 2017 — Feb 2024)
        </p>
      </div>

      <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 text-sm text-text-secondary">
        <p>
          SilkAir ceased operations in end-2021; its flights were subsequently
          split between SIA and Scoot. Route network data is only available
          through Feb 2024.
        </p>
      </div>

      <RedemptionsVsRouteNetworkCharts
        monthSummaryAnalysisList={monthSummaryAnalysisList}
      />

      <RouteRedeemablePctTable routeAnalysisList={routeAnalysisList} />
    </section>
  );
}
