import {
  monthNumToShortNameMap,
  monthShortNameToNameMap,
} from '@/common/months-map';
import { RouteDetailDatum } from '../helpers/make-route-details-list';
import { flightClassColors } from '@/components/common/colors';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '@/components/common/chart/chart-options';

export function MonthsDistributionChart({
  detailsListFiltered,
}: {
  detailsListFiltered: RouteDetailDatum[];
}) {
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
          (flightClassToCountDict) => flightClassToCountDict.PY,
        ),
        backgroundColor: flightClassColors.PY,
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
