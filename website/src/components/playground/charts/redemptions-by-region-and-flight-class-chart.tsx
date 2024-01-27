import { FlightClass, RouteAnalysisEntry } from '@/index';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from './chart-wrapper';
import { flightClassColors, regionColors } from '../../common/colors';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RedemptionsByRegionAndFlightClassChart({
  routeAnalysisListFiltered,
}: Props) {
  const regionToFlightClassToCountDict: Record<
    string,
    Record<string, number>
  > = {
    'South East Asia': {},
    'North Asia': {},
    'South Asia': {},
    'Middle East & Africa': {},
    'Southwest Pacific': {},
    Europe: {},
    'North America': {},
  };

  routeAnalysisListFiltered.forEach(({ region, details }) => {
    Object.values(details).forEach((detailsInfo) => {
      Object.entries(detailsInfo).forEach(([flightClass, redemptionInfo]) => {
        if (redemptionInfo) {
          regionToFlightClassToCountDict[region][flightClass] =
            (regionToFlightClassToCountDict[region]?.[flightClass] ?? 0) + 1;
        }
      });
    });
  });

  const data = {
    labels: Object.keys(regionToFlightClassToCountDict),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(regionToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.Y,
        ),
        backgroundColor: flightClassColors.Y,
      },
      {
        label: 'Premium Economy',
        data: Object.values(regionToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.PY,
        ),
        backgroundColor: flightClassColors.PY,
      },
      {
        label: 'Business',
        data: Object.values(regionToFlightClassToCountDict).map(
          (flightClassToCountDict) => flightClassToCountDict.J,
        ),
        backgroundColor: flightClassColors.J,
      },
    ],
  };

  return (
    <ChartWrapper title="Redemptions by region and flight class">
      <Bar
        options={makeChartOptions({
          axesStacked: { x: true, y: true },
          axesBorder: { x: true },
          axesTicksOnChartArea: { x: false, y: true },
          axesTickMaxLimit: { y: 5 },
          showTooltipLabelIndicator: true,
        })}
        data={data}
      />
    </ChartWrapper>
  );
}
