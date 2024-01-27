import { RouteAnalysisEntry } from '@/index';
import { Bar } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from './chart-wrapper';
import { regionColors } from '../../common/colors';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function RoutesByRegionChart({ routeAnalysisListFiltered }: Props) {
  const regionToCountDict: Record<string, number> = {
    'South East Asia': 0,
    'North Asia': 0,
    'South Asia': 0,
    'Middle East & Africa': 0,
    'Southwest Pacific': 0,
    Europe: 0,
    'North America': 0,
  };

  routeAnalysisListFiltered.forEach(({ region, details }) => {
    let hasRedemptionForRoute = false;

    Object.values(details).forEach((detailsInfo) => {
      const hasRedemption =
        Object.values(detailsInfo).filter(Boolean).length > 0;
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
    <ChartWrapper title="Routes by region">
      <Bar
        options={makeChartOptions({
          axesStacked: { x: true },
          axesBorder: { x: true },
          axesTicksOnChartArea: { x: false, y: true },
          axesTickMaxLimit: { y: 5 },
        })}
        data={data}
      />
    </ChartWrapper>
  );
}
