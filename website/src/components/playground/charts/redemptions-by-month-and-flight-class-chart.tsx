import {
  monthNumToShortNameMap,
  monthShortNameToNameMap,
} from '@/common/months-map';
import { RouteAnalysisEntry } from '@/index';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { flightClassColors } from '../../common/colors';
import { ChartWrapper } from '../../common/chart/chart-wrapper';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RedemptionsByMonthAndFlightClassChart({
  routeAnalysisListFiltered,
}: Props) {
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

  routeAnalysisListFiltered.forEach(({ details }) => {
    Object.entries(details).forEach(([yyyymm, detailsInfo]) => {
      const monthName = monthNumToShortNameMap[yyyymm.slice(4)];
      Object.entries(detailsInfo).forEach(([flightClass, redemptionInfo]) => {
        if (redemptionInfo) {
          monthToFlightClassToCountDict[monthName][flightClass] =
            (monthToFlightClassToCountDict[monthName]?.[flightClass] ?? 0) + 1;
        }
      });
    });
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
      title="Redemptions by month and flight class"
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
