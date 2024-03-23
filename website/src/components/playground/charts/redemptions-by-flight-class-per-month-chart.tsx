import { useTheme } from '@/components/common/use-theme';
import { Month, RouteAnalysisEntry } from '@/index';
import { Line } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { lineOnHoverPlugin } from '../../common/chart/line-on-hover-plugin';
import { flightClassColors } from '../../common/colors';
import { Toggle, ToggleProps } from '@/components/common/toggle';
import { useState } from 'react';
import { roundToDp } from '@/common/round-to-dp';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

type CountOrPct = 'count' | 'pct';
const displayToggleOptions: ToggleProps<CountOrPct>['options'] = [
  { key: 'count', label: 'Count' },
  { key: 'pct', label: '%', backgroundStyle: 'px-5' },
];

export function RedemptionsByFlightClassPerMonthChart({
  routeAnalysisListFiltered,
}: Props) {
  const { isDarkTheme } = useTheme();
  const [displayAs, setDisplayAs] = useState<CountOrPct>('count');

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

  const monthToFlightClassToPctDict = Object.entries(
    monthToFlightClassToCountDict,
  ).reduce(
    (
      _monthToFlightClassToPctDict: Record<Month, Record<string, number>>,
      [month, flightClassToCountDict],
    ) => {
      const total = Object.values(flightClassToCountDict).reduce(
        (_total, count) => _total + count,
        0,
      );
      _monthToFlightClassToPctDict[month] = {
        Y: roundToDp((flightClassToCountDict.Y / total) * 100, 1),
        W: roundToDp((flightClassToCountDict.W / total) * 100, 1),
        J: roundToDp((flightClassToCountDict.J / total) * 100, 1),
      };
      return _monthToFlightClassToPctDict;
    },
    {},
  );

  const selectedDataset =
    displayAs === 'count'
      ? monthToFlightClassToCountDict
      : monthToFlightClassToPctDict;
  const data = {
    labels: Object.keys(selectedDataset).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(selectedDataset).map(
          (flightClassToCountDict) => flightClassToCountDict.Y,
        ),
        borderColor: flightClassColors.Y,
        borderWidth: 1,
        backgroundColor: flightClassColors.Y,
        pointRadius: 1,
      },
      {
        label: 'Premium Economy',
        data: Object.values(selectedDataset).map(
          (flightClassToCountDict) => flightClassToCountDict.W,
        ),
        borderColor: flightClassColors.W,
        borderWidth: 1,
        backgroundColor: flightClassColors.W,
        pointRadius: 1,
      },
      {
        label: 'Business',
        data: Object.values(selectedDataset).map(
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
            ...(displayAs === 'pct'
              ? {
                  axesMinValue: {
                    y: 0,
                  },
                  axesMaxValue: {
                    y: 100,
                  },
                  axesTickMaxLimit: {
                    x: 4,
                    y: 6,
                  },
                  axesTickLabelRenderFn: {
                    y: (value) => `${value}%`,
                  },
                  tooltipLabelSuffix: '%',
                }
              : {}),
          })}
          plugins={[lineOnHoverPlugin]}
          data={data}
        />
      }
      topRightComponent={
        <Toggle<CountOrPct>
          size="sm"
          options={displayToggleOptions}
          selValue={displayAs}
          setSelValue={setDisplayAs}
        />
      }
    />
  );
}
