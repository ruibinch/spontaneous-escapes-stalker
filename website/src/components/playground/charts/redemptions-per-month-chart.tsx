import { RouteAnalysisEntry } from '@/index';
import { Line } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { lineOnHoverPlugin } from '../../common/chart/line-on-hover-plugin';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { useTheme } from '@/components/common/use-theme';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RedemptionsPerMonthChart({ routeAnalysisListFiltered }: Props) {
  const { isDarkTheme } = useTheme();
  const monthToCountDict: Record<string, number> = {};

  routeAnalysisListFiltered.forEach(({ details }) => {
    details.forEach((detail) => {
      const numRedemptionsForMonth = Object.values(
        detail.redemptionDetails,
      ).filter(Boolean).length;
      monthToCountDict[detail.month] =
        (monthToCountDict[detail.month] ?? 0) + numRedemptionsForMonth;
    });
  });

  const data = {
    labels: Object.keys(monthToCountDict).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        data: Object.values(monthToCountDict),
        borderColor: '#a21caf', // fuchsia-700
        borderWidth: 1,
        backgroundColor: '#a21caf', // fuchsia-700
        pointRadius: 1,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Redemptions per month"
      chart={
        <Line
          options={makeChartOptions({
            isDarkTheme,
            axesTicks: { x: true, y: false },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 4, y: 4 },
            axesMinValue: { y: 0 },
          })}
          plugins={[lineOnHoverPlugin]}
          data={data}
        />
      }
    />
  );
}
