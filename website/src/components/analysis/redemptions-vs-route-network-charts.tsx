import { LAST_PRE_COVID_MONTH } from '@/common/months-map';
import { roundToDp } from '@/common/round-to-dp';
import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { Bar, Line } from 'react-chartjs-2';
import { getMonthsList } from '../../common/get-months-with-route-network-data';
import { makeChartOptions } from '../common/chart/chart-options';
import { ChartWrapper } from '../common/chart/chart-wrapper';
import { covidLinePlugin } from '../common/chart/covid-line-plugin';
import { lineOnHoverPlugin } from '../common/chart/line-on-hover-plugin';
import { useTheme } from '../common/use-theme';
import { useSilkairRoutesToggleContext } from './silkair-routes-toggle';

export function RedemptionsVsRouteNetworkCharts() {
  const { isDarkTheme } = useTheme();
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();

  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];
  const monthsWithRouteNetworkData = getMonthsList({
    includeOnlyMonthsPresentInOagDataset: true,
  });
  const lastPreCovidMonthIdx = (() => {
    const _lastPreCovidMonthIdx = monthsWithRouteNetworkData.findIndex(
      (month) => month === LAST_PRE_COVID_MONTH,
    );
    return _lastPreCovidMonthIdx === -1 ? undefined : _lastPreCovidMonthIdx;
  })();

  // only include up to the last month with route network size data
  const monthSummaryAnalysisListForMonthsWithRouteNetworkData =
    monthSummaryAnalysisList.filter((entry) =>
      monthsWithRouteNetworkData.includes(entry.month),
    );

  const routeNetworkCountList =
    monthSummaryAnalysisListForMonthsWithRouteNetworkData.map(
      (entry): number => {
        // @ts-expect-error these values are assured to be defined after .filter above
        return showSilkairRoutes
          ? entry.byUniqueRoutes.routeNetworkSize.total
          : entry.byUniqueRoutes.routeNetworkSize.sia;
      },
    );
  const redemptionsCountList =
    monthSummaryAnalysisListForMonthsWithRouteNetworkData.map((entry) => {
      return showSilkairRoutes
        ? entry.byUniqueRoutes.availableForRedemption.total
        : entry.byUniqueRoutes.availableForRedemption.sia;
    });
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
        label: 'Route network size',
        data: routeNetworkCountList,
        borderColor: '#ca8a04', // yellow-600
        borderWidth: 1,
        backgroundColor: '#ca8a04', // yellow-600
        pointRadius: 1,
      },
      {
        label: 'SE redemptions',
        data: redemptionsCountList,
        borderColor: '#7c3aed', // violet-600
        borderWidth: 1,
        backgroundColor: '#7c3aed', // violet-600
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
        backgroundColor: '#881337', // rose-900
        borderColor: '#881337', // rose-900
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <ChartWrapper
        title="Route network size vs no. of SE redemptions offered each month"
        chart={
          <Line
            options={makeChartOptions({
              isDarkTheme,
              axesTicks: { x: true, y: false },
              axesBorder: { x: true },
              axesTicksOnChartArea: { x: false, y: true },
              axesTickMaxLimit: { x: 10, y: 6 },
              showTooltipLabelIndicator: true,
              covidLineOptions: {
                lineIndex: lastPreCovidMonthIdx,
              },
            })}
            plugins={[lineOnHoverPlugin, covidLinePlugin]}
            data={comparisonChartData}
          />
        }
      />

      <ChartWrapper
        title="Percentage of route network available for SE redemptions"
        chart={
          <Bar
            options={makeChartOptions({
              isDarkTheme,
              axesTicks: { x: true, y: false },
              axesBorder: { x: true },
              axesTicksOnChartArea: { x: false, y: true },
              axesTickMaxLimit: { x: 10, y: 6 },
              axesTickLabelRenderFn: {
                y: (value) => `${value}%`,
              },
              tooltipLabelSuffix: '%',
              covidLineOptions: {
                lineIndex: lastPreCovidMonthIdx,
              },
            })}
            plugins={[covidLinePlugin]}
            data={pctComparisonChartData}
          />
        }
        tooltip="Number of routes available for SE redemptions / Total number of routes in the route network"
      />
    </div>
  );
}
