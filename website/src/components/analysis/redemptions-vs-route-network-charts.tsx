import { roundToDp } from '@/common/round-to-dp';
import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { Bar, Line } from 'react-chartjs-2';
import { makeChartOptions } from '../common/chart/chart-options';
import { ChartWrapper } from '../common/chart/chart-wrapper';
import { lineOnHoverPlugin } from '../common/chart/line-on-hover-plugin';
import { getMonthsWithRouteNetworkData } from './helpers/get-months-with-route-network-data';

export function RedemptionsVsRouteNetworkCharts() {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];
  const monthsWithRouteNetworkData = getMonthsWithRouteNetworkData();

  // only include up to the last month with route network size data
  const routeNetworkCountList = monthSummaryAnalysisList
    .filter((entry) => monthsWithRouteNetworkData.has(entry.month))
    .map((entry) => entry.byUniqueRoutes.routeNetworkSize) as number[];
  const redemptionsCountList = monthSummaryAnalysisList
    .filter((entry) => monthsWithRouteNetworkData.has(entry.month))
    .map((entry) => entry.byUniqueRoutes.availableForRedemption);
  const redemptionsCountPctOfRouteNetworkList = redemptionsCountList.map(
    (redemptionCount, idx) =>
      roundToDp((redemptionCount / routeNetworkCountList[idx]) * 100, 1),
  );

  const comparisonChartData = {
    labels: Array.from(monthsWithRouteNetworkData).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'SE redemptions',
        data: redemptionsCountList,
        borderColor: '#6d28d9', // violet-700
        borderWidth: 1,
        backgroundColor: '#6d28d9', // violet-700
        pointRadius: 1,
      },
      {
        label: 'Route network size',
        data: routeNetworkCountList,
        borderColor: '#ca8a04', // yellow-600
        borderWidth: 1,
        backgroundColor: '#ca8a04', // yellow-600
        pointRadius: 1,
      },
    ],
  };

  const pctComparisonChartData = {
    labels: Array.from(monthsWithRouteNetworkData).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        data: redemptionsCountPctOfRouteNetworkList,
        backgroundColor: '#4c0519', // rose-950
        borderColor: '#4c0519', // rose-950
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8">
      <ChartWrapper
        title="SE redemptions count vs. route network size"
        chart={
          <Line
            options={makeChartOptions({
              axesTicks: { x: true, y: false },
              axesBorder: { x: true },
              axesTicksOnChartArea: { x: false, y: true },
              axesTickMaxLimit: { x: 10, y: 6 },
              showTooltipLabelIndicator: true,
            })}
            plugins={[lineOnHoverPlugin]}
            data={comparisonChartData}
          />
        }
      />

      <ChartWrapper
        title="Percentage of route network available for SE redemptions"
        chart={
          <Bar
            options={makeChartOptions({
              axesTicks: { x: true, y: false },
              axesBorder: { x: true },
              axesTicksOnChartArea: { x: false, y: true },
              axesTickMaxLimit: { x: 10, y: 6 },
              axesTickLabelRenderFn: {
                y: (value) => `${value}%`,
              },
              tooltipLabelSuffix: '%',
            })}
            data={pctComparisonChartData}
          />
        }
      />
    </div>
  );
}
