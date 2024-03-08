import { useTheme } from '@/components/common/use-theme';
import { Month, RouteAnalysisEntry } from '@/index';
import { Line } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { lineOnHoverPlugin } from '../../common/chart/line-on-hover-plugin';
import { flightClassColors } from '../../common/colors';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RedemptionsByFlightClassPerMonthChart({
  routeAnalysisListFiltered,
}: Props) {
  const { isDarkTheme } = useTheme();

  const monthToFlightClassToCountDict: Record<
    Month,
    Record<string, number>
  > = {};

  routeAnalysisListFiltered.forEach(({ details }) => {
    details.forEach((detail) => {
      if (!(detail.month in monthToFlightClassToCountDict)) {
        monthToFlightClassToCountDict[detail.month] = { Y: 0, W: 0, J: 0 };
      }
      Object.entries(detail.redemptionDetails).forEach(
        ([flightClass, redemptionInfo]) => {
          if (redemptionInfo) {
            monthToFlightClassToCountDict[detail.month][flightClass] += 1;
          }
        },
      );
    });
  });

  const data = {
    labels: Object.keys(monthToFlightClassToCountDict).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.Y,
        ),
        borderColor: flightClassColors.Y,
        borderWidth: 1,
        backgroundColor: flightClassColors.Y,
        pointRadius: 1,
      },
      {
        label: 'Premium Economy',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.W,
        ),
        borderColor: flightClassColors.W,
        borderWidth: 1,
        backgroundColor: flightClassColors.W,
        pointRadius: 1,
      },
      {
        label: 'Business',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.J,
        ),
        borderColor: flightClassColors.J,
        borderWidth: 1,
        backgroundColor: flightClassColors.J,
        pointRadius: 1,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Redemptions by flight class per month"
      chart={
        <Line
          options={makeChartOptions({
            isDarkTheme,
            axesTicks: { x: true, y: false },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 4, y: 4 },
            showTooltipLabelIndicator: true,
          })}
          plugins={[lineOnHoverPlugin]}
          data={data}
        />
      }
    />
  );
}
