import { roundToDp } from '@/common/round-to-dp';
import { MonthSummaryAnalysisEntry, RedemptionEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { useTheme } from '@/components/common/use-theme';

enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  NORTH_AMERICA = 'North America',
}

export function RoutesRegionDistributionChart({
  redemptionsFiltered,
  isFilterActive,
}: {
  redemptionsFiltered: RedemptionEntry[];
  isFilterActive: boolean;
}) {
  const { isDarkTheme } = useTheme();

  const regionDistributionInMonth: Record<string, number> = {
    [Region.SOUTH_EAST_ASIA]: 0,
    [Region.NORTH_ASIA]: 0,
    [Region.SOUTH_ASIA]: 0,
    [Region.MIDDLE_EAST_AND_AFRICA]: 0,
    [Region.SOUTHWEST_PACIFIC]: 0,
    [Region.EUROPE]: 0,
    [Region.NORTH_AMERICA]: 0,
  };
  redemptionsFiltered.forEach((redemption) => {
    regionDistributionInMonth[redemption.region] += 1;
  });

  const regionDistributionPctInMonth = Object.entries(
    regionDistributionInMonth,
  ).reduce(
    (
      _regionDistributionPctInMonth: Record<string, number>,
      [region, count],
    ) => {
      _regionDistributionPctInMonth[region] = decimalToPct1Dp(
        count / redemptionsFiltered.length,
      );
      return _regionDistributionPctInMonth;
    },
    {},
  );
  const averageRegionDistributionPct = computeAverageRegionDistributionPct();

  const data = {
    labels: Object.keys(regionDistributionInMonth),
    datasets: [
      {
        label: 'Average',
        data: Object.values(averageRegionDistributionPct),
        backgroundColor: '#0369a1', // sky-700
        stack: 'Average',
      },
      {
        label: 'Month',
        data: isFilterActive ? [] : Object.values(regionDistributionPctInMonth),
        backgroundColor: '#d97706', // amber-600
        stack: 'Month',
      },
    ],
  };

  return (
    <ChartWrapper
      title="Breakdown of routes by region (%)"
      tooltip="Compares the percentage distribution of routes this month with the overall average"
      chart={
        <Bar
          options={makeChartOptions({
            isDarkTheme,
            axesStacked: { x: true },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { y: 5 },
            axesTickLabelRenderFn: {
              y: (value) => `${value}%`,
            },
            tooltipLabelSuffix: '%',
          })}
          data={data}
        />
      }
    />
  );
}

function computeAverageRegionDistributionPct() {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];
  const numMonths = monthSummaryAnalysisList.length;

  let southEastAsiaPctSum = 0;
  let northAsiaPctSum = 0;
  let southAsiaPctSum = 0;
  let middleEastAndAfricaPctSum = 0;
  let southwestPacificPctSum = 0;
  let europePctSum = 0;
  let northAmericaPctSum = 0;

  monthSummaryAnalysisList.forEach((monthSummaryAnalysisEntry) => {
    const { count, byRegion } = monthSummaryAnalysisEntry;
    southEastAsiaPctSum += byRegion[Region.SOUTH_EAST_ASIA] / count;
    northAsiaPctSum += byRegion[Region.NORTH_ASIA] / count;
    southAsiaPctSum += byRegion[Region.SOUTH_ASIA] / count;
    middleEastAndAfricaPctSum +=
      byRegion[Region.MIDDLE_EAST_AND_AFRICA] / count;
    southwestPacificPctSum += byRegion[Region.SOUTHWEST_PACIFIC] / count;
    europePctSum += byRegion[Region.EUROPE] / count;
    northAmericaPctSum += byRegion[Region.NORTH_AMERICA] / count;
  });

  return {
    [Region.SOUTH_EAST_ASIA]: decimalToPct1Dp(southEastAsiaPctSum / numMonths),
    [Region.NORTH_ASIA]: decimalToPct1Dp(northAsiaPctSum / numMonths),
    [Region.SOUTH_ASIA]: decimalToPct1Dp(southAsiaPctSum / numMonths),
    [Region.MIDDLE_EAST_AND_AFRICA]: decimalToPct1Dp(
      middleEastAndAfricaPctSum / numMonths,
    ),
    [Region.SOUTHWEST_PACIFIC]: decimalToPct1Dp(
      southwestPacificPctSum / numMonths,
    ),
    [Region.EUROPE]: decimalToPct1Dp(europePctSum / numMonths),
    [Region.NORTH_AMERICA]: decimalToPct1Dp(northAmericaPctSum / numMonths),
  };
}

const decimalToPct1Dp = (num: number) => roundToDp(num * 100, 1);
