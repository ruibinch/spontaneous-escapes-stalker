import { makeChartOptions } from '@/components/common/chart/chart-options';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { lineOnHoverPlugin } from '@/components/common/chart/line-on-hover-plugin';
import { flightClassColors } from '@/components/common/colors';
import { useTheme } from '@/components/common/use-theme';
import { MonthSummaryAnalysisEntry } from '@/index';
import { Line } from 'react-chartjs-2';

export function AverageBlackoutPctOverTime({
  monthSummaryAnalysisList,
}: {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}) {
  const { isDarkTheme } = useTheme();
  const averageBlackoutPctList = monthSummaryAnalysisList.map((entry) => ({
    month: entry.month,
    ...entry.blackoutPctAverages,
  }));

  const data = {
    labels: averageBlackoutPctList.map(
      ({ month }) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'Total',
        data: averageBlackoutPctList.map((entry) => entry.total),
        borderColor: '#a21caf', // fuchsia-700
        borderWidth: 1,
        backgroundColor: '#a21caf', // fuchsia-700
        pointRadius: 1,
      },
      {
        label: 'Economy',
        data: averageBlackoutPctList.map((entry) => entry.Y),
        borderColor: flightClassColors.Y,
        borderWidth: 1,
        backgroundColor: flightClassColors.Y,
        pointRadius: 1,
      },
      {
        label: 'Premium Economy',
        data: averageBlackoutPctList.map((entry) => entry.W),
        borderColor: flightClassColors.W,
        borderWidth: 1,
        backgroundColor: flightClassColors.W,
        pointRadius: 1,
      },
      {
        label: 'Business',
        data: averageBlackoutPctList.map((entry) => entry.J),
        borderColor: flightClassColors.J,
        borderWidth: 1,
        backgroundColor: flightClassColors.J,
        pointRadius: 1,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Average blackout % over time"
      chartComponentStyle="h-52 xl:h-52"
      chart={
        <Line
          options={makeChartOptions({
            isDarkTheme,
            axesTicks: { x: true, y: false },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: {
              x: 10,
              y: 6,
            },
            showTooltipLabelIndicator: true,
            axesMinValue: {
              y: 0,
            },
            axesMaxValue: {
              y: 50,
            },
            axesTickLabelRenderFn: {
              y: (value) => `${value}%`,
            },
            tooltipLabelSuffix: '%',
            showLegend: true,
          })}
          plugins={[lineOnHoverPlugin]}
          data={data}
        />
      }
    />
  );
}
