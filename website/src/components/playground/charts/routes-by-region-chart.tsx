import { useTheme } from '@/components/common/use-theme';
import { RouteAnalysisEntry } from '@/index';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { regionColors } from '../../common/colors';

enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  NORTH_AMERICA = 'North America',
}

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RoutesByRegionChart({ routeAnalysisListFiltered }: Props) {
  const { isDarkTheme } = useTheme();
  const regionToCountDict: Record<string, number> = {
    [Region.SOUTH_EAST_ASIA]: 0,
    [Region.NORTH_ASIA]: 0,
    [Region.SOUTH_ASIA]: 0,
    [Region.MIDDLE_EAST_AND_AFRICA]: 0,
    [Region.SOUTHWEST_PACIFIC]: 0,
    [Region.EUROPE]: 0,
    [Region.NORTH_AMERICA]: 0,
  };

  routeAnalysisListFiltered.forEach(({ region, details }) => {
    let hasRedemptionForRoute = false;

    Object.values(details).forEach((detailsInfo) => {
      const hasRedemption =
        Object.values(detailsInfo.redemptionDetails).filter(Boolean).length > 0;
      if (hasRedemption) {
        hasRedemptionForRoute = true;
      }
    });

    if (hasRedemptionForRoute) {
      regionToCountDict[region] += 1;
    }
  });

  const data = {
    labels: Object.keys(regionToCountDict),
    datasets: [
      {
        data: Object.values(regionToCountDict),
        backgroundColor: Object.values(regionColors),
        borderColor: Object.values(regionColors),
        borderWidth: 1,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Routes by region"
      chart={
        <Bar
          options={makeChartOptions({
            isDarkTheme,
            axesStacked: { x: true },
            axesBorder: { x: true },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { y: 5 },
          })}
          data={data}
        />
      }
    />
  );
}
