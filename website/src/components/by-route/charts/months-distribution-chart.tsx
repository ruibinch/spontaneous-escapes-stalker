import {
  monthNumToShortNameMap,
  monthShortNameToNameMap,
} from '@/common/months-map';
import { makeChartOptions } from '@/components/common/chart/chart-options';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { flightClassColors } from '@/components/common/colors';
import { useTheme } from '@/components/common/use-theme';
import { Bar } from 'react-chartjs-2';
import { RouteDetailDatum } from '../helpers/make-route-details-list';

export function MonthsDistributionChart({
  detailsListFiltered,
}: {
  detailsListFiltered: RouteDetailDatum[];
}) {
  const { isDarkTheme } = useTheme();

  const monthToFlightClassToCountDict: Record<
    string,
    Record<string, number>
  > = {
    Jan: {},
    Feb: {},
    Mar: {},
    Apr: {},
    May: {},
    Jun: {},
    Jul: {},
    Aug: {},
    Sep: {},
    Oct: {},
    Nov: {},
    Dec: {},
  };

  detailsListFiltered.forEach(({ month, flightClass }) => {
    const monthName = monthNumToShortNameMap[month.slice(4, 6)];
    monthToFlightClassToCountDict[monthName][flightClass] =
      (monthToFlightClassToCountDict[monthName]?.[flightClass] ?? 0) + 1;
  });

  const data = {
    labels: Object.keys(monthToFlightClassToCountDict),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.Y,
        ),
        backgroundColor: flightClassColors.Y,
      },
      {
        label: 'Premium Economy',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.W,
        ),
        backgroundColor: flightClassColors.W,
      },
      {
        label: 'Business',
        data: Object.values(monthToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.J,
        ),
        backgroundColor: flightClassColors.J,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Breakdown by month and flight class"
      chart={
        <Bar
          options={makeChartOptions({
            isDarkTheme,
            axesStacked: { x: true, y: true },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 12, y: 5 },
            showTooltipLabelIndicator: true,
            tooltipTitleOverrideMap: monthShortNameToNameMap,
          })}
          data={data}
        />
      }
    />
  );
}
