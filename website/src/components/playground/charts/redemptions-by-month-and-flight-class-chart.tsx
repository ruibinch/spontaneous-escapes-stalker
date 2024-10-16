import {
  monthNumToShortNameMap,
  monthShortNameToNameMap,
} from '@/common/months-map';
import { roundToDp } from '@/common/round-to-dp';
import { Toggle, ToggleProps } from '@/components/common/toggle';
import { useTheme } from '@/components/common/use-theme';
import { RouteAnalysisEntry } from '@/index';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { flightClassColors } from '../../common/colors';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

type AverageOrTotal = 'average' | 'total';
const displayToggleOptions: ToggleProps<AverageOrTotal>['options'] = [
  { key: 'average', label: 'Average' },
  { key: 'total', label: 'Total', backgroundStyle: 'px-5' },
];

export function RedemptionsByMonthAndFlightClassChart({
  routeAnalysisListFiltered,
}: Props) {
  const { isSilkairRoutesContextLoaded } = useSilkairRoutesToggleContext();
  const { isDarkTheme } = useTheme();
  const [displayAs, setDisplayAs] = useState<AverageOrTotal>('average');

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
  const monthNameToMonths: Record<string, Set<string>> = {
    Jan: new Set(),
    Feb: new Set(),
    Mar: new Set(),
    Apr: new Set(),
    May: new Set(),
    Jun: new Set(),
    Jul: new Set(),
    Aug: new Set(),
    Sep: new Set(),
    Oct: new Set(),
    Nov: new Set(),
    Dec: new Set(),
  };

  routeAnalysisListFiltered.forEach(({ details }) => {
    details.forEach((detail) => {
      const monthName = monthNumToShortNameMap[detail.month.slice(4)];
      monthNameToMonths[monthName].add(detail.month);

      Object.entries(detail.redemptionDetails).forEach(
        ([flightClass, redemptionInfo]) => {
          if (redemptionInfo) {
            monthToFlightClassToCountDict[monthName][flightClass] =
              (monthToFlightClassToCountDict[monthName]?.[flightClass] ?? 0) +
              1;
          }
        },
      );
    });
  });

  const monthToFlightClassToAverageCountDict = Object.entries(
    monthToFlightClassToCountDict,
  ).reduce(
    (
      _monthToFlightClassToAverageCountDict: Record<
        string,
        Record<string, number>
      >,
      [month, flightClassToCountDict],
    ) => {
      _monthToFlightClassToAverageCountDict[month] = Object.entries(
        flightClassToCountDict,
      ).reduce(
        (
          _flightClassToAverageCountDict: Record<string, number>,
          [flightClass, count],
        ) => {
          _flightClassToAverageCountDict[flightClass] = roundToDp(
            count / monthNameToMonths[month].size,
            2,
          );
          return _flightClassToAverageCountDict;
        },
        {},
      );
      return _monthToFlightClassToAverageCountDict;
    },
    {},
  );

  const selectedDataset =
    displayAs === 'average'
      ? monthToFlightClassToAverageCountDict
      : monthToFlightClassToCountDict;
  const data = {
    labels: Object.keys(monthToFlightClassToCountDict),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(selectedDataset).map(
          (flightClassToCountDict) => flightClassToCountDict.Y,
        ),
        backgroundColor: flightClassColors.Y,
      },
      {
        label: 'Premium Economy',
        data: Object.values(selectedDataset).map(
          (flightClassToCountDict) => flightClassToCountDict.W,
        ),
        backgroundColor: flightClassColors.W,
      },
      {
        label: 'Business',
        data: Object.values(selectedDataset).map(
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
            isDarkTheme,
            axesStacked: { x: true, y: true },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 12, y: 6 },
            showTooltipLabelIndicator: true,
            tooltipTitleOverrideMap: monthShortNameToNameMap,
          })}
          data={data}
        />
      }
      topRightComponent={
        <Toggle<AverageOrTotal>
          size="sm"
          options={displayToggleOptions}
          selValue={displayAs}
          setSelValue={setDisplayAs}
        />
      }
      isLoaded={isSilkairRoutesContextLoaded}
    />
  );
}
