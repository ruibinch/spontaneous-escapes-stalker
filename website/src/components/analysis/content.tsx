import { Divider, cn } from '@nextui-org/react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { ComparisonWithRouteNetwork } from './comparison-with-route-network';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export function AnalysisContent() {
  return (
    <div>
      <PageHeader title="Analysis" />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-8')}>
        <ComparisonWithRouteNetwork />

        <Divider />
      </div>
    </div>
  );
}
