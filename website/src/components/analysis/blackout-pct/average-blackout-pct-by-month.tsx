import {
  monthNumToShortNameMap,
  monthShortNameToNameMap,
} from '@/common/months-map';
import { roundToDp } from '@/common/round-to-dp';
import { makeChartOptions } from '@/components/common/chart/chart-options';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { useTheme } from '@/components/common/use-theme';
import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { Bar } from 'react-chartjs-2';

const monthSummaryAnalysisList =
  monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

export function AverageBlackoutPctByMonth() {
  const { isDarkTheme } = useTheme();

  const monthToBlackoutPctSumDict: Record<
    string,
    {
      blackoutPctSum: number;
      count: number;
    }
  > = {
    Jan: { blackoutPctSum: 0, count: 0 },
    Feb: { blackoutPctSum: 0, count: 0 },
    Mar: { blackoutPctSum: 0, count: 0 },
    Apr: { blackoutPctSum: 0, count: 0 },
    May: { blackoutPctSum: 0, count: 0 },
    Jun: { blackoutPctSum: 0, count: 0 },
    Jul: { blackoutPctSum: 0, count: 0 },
    Aug: { blackoutPctSum: 0, count: 0 },
    Sep: { blackoutPctSum: 0, count: 0 },
    Oct: { blackoutPctSum: 0, count: 0 },
    Nov: { blackoutPctSum: 0, count: 0 },
    Dec: { blackoutPctSum: 0, count: 0 },
  };

  monthSummaryAnalysisList.forEach((entry) => {
    const monthName = monthNumToShortNameMap[entry.month.slice(4, 6)];
    const blackoutPctAverageForMonth = entry.blackoutPctAverages.total;
    if (blackoutPctAverageForMonth != null) {
      monthToBlackoutPctSumDict[monthName].blackoutPctSum +=
        blackoutPctAverageForMonth;
      monthToBlackoutPctSumDict[monthName].count += 1;
    }
  });

  const monthToAverageBlackoutPctDict = Object.entries(
    monthToBlackoutPctSumDict,
  ).reduce(
    (
      _monthToAverageBlackoutPctDict: Record<string, number>,
      [month, { blackoutPctSum, count }],
    ) => {
      _monthToAverageBlackoutPctDict[month] = roundToDp(
        blackoutPctSum / count,
        1,
      );
      return _monthToAverageBlackoutPctDict;
    },
    {},
  );

  const data = {
    labels: Object.keys(monthToAverageBlackoutPctDict),
    datasets: [
      {
        label: 'Average blackout %',
        data: Object.values(monthToAverageBlackoutPctDict),
        backgroundColor: '#475569', // slate-600
      },
    ],
  };

  return (
    <ChartWrapper
      title="Average blackout % by month"
      chartComponentStyle="h-52 xl:h-52"
      chart={
        <Bar
          options={makeChartOptions({
            isDarkTheme,
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 12, y: 5 },
            axesTickLabelRenderFn: {
              y: (value) => `${value}%`,
            },
            tooltipTitleOverrideMap: monthShortNameToNameMap,
          })}
          data={data}
        />
      }
    />
  );
}
