import { makeChartOptions } from '@/components/common/chart/chart-options';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { lineOnHoverPlugin } from '@/components/common/chart/line-on-hover-plugin';
import { flightClassColors } from '@/components/common/colors';
import { Line } from 'react-chartjs-2';
import { RouteDetailDatum } from '../helpers/make-route-details-list';
import { useTheme } from '@/components/common/use-theme';

export function MilesRequiredOverTimeChart({
  detailsListFiltered,
}: {
  detailsListFiltered: RouteDetailDatum[];
}) {
  const { isDarkTheme } = useTheme();

  const flightClassToMonthToMilesRequiredDict: Record<
    string,
    Record<string, string | number>
  > = {};

  const monthsWithRedemption = Array.from(
    new Set(detailsListFiltered.map((d) => d.month)),
  );

  ['Y', 'W', 'J'].forEach((flightClass) => {
    const detailsListForFlightClass = detailsListFiltered.filter(
      (d) => d.flightClass === flightClass,
    );

    const monthToMilesRequiredDict = monthsWithRedemption.reduce(
      (_monthToMilesRequiredDict: Record<string, string | number>, month) => {
        const detailForFlightClassAndMonth = detailsListForFlightClass.find(
          (d) => d.month === month,
        );
        _monthToMilesRequiredDict[month] =
          detailForFlightClassAndMonth?.milesRequired ?? 'N/A';
        return _monthToMilesRequiredDict;
      },
      {},
    );

    flightClassToMonthToMilesRequiredDict[flightClass] =
      monthToMilesRequiredDict;
  });

  const data = {
    labels: monthsWithRedemption.map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(flightClassToMonthToMilesRequiredDict.Y),
        borderColor: flightClassColors.Y,
        borderWidth: 1,
        backgroundColor: flightClassColors.Y,
        pointRadius: 3,
      },
      {
        label: 'Premium Economy',
        data: Object.values(flightClassToMonthToMilesRequiredDict.W),
        borderColor: flightClassColors.W,
        borderWidth: 1,
        backgroundColor: flightClassColors.W,
        pointRadius: 3,
      },
      {
        label: 'Business',
        data: Object.values(flightClassToMonthToMilesRequiredDict.J),
        borderColor: flightClassColors.J,
        borderWidth: 1,
        backgroundColor: flightClassColors.J,
        pointRadius: 3,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Miles required over time"
      chart={
        <Line
          options={makeChartOptions({
            isDarkTheme,
            axesBorder: { x: true },
            axesMinValue: { y: 0 },
            axesTicks: { x: true, y: false },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { y: 8 },
            axesTickPadding: { y: 8 },
            showTooltipLabelIndicator: true,
          })}
          plugins={[lineOnHoverPlugin]}
          data={data}
        />
      }
    />
  );
}
