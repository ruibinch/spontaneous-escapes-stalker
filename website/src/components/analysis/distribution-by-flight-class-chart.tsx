import { MonthSummaryAnalysisDict } from '@/index';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function DistributionByFlightClassChart({
  monthSummaryAnalysisDict,
  months,
}: {
  monthSummaryAnalysisDict: MonthSummaryAnalysisDict;
  months: string[];
}) {
  const economyDataset = months.map(
    (month) => monthSummaryAnalysisDict[month]?.byFlightClass.Y ?? 0,
  );
  const premiumEconomyDataset = months.map(
    (month) => monthSummaryAnalysisDict[month]?.byFlightClass.PY ?? 0,
  );
  const businessDataset = months.map(
    (month) => monthSummaryAnalysisDict[month]?.byFlightClass.J ?? 0,
  );
  const allDataset = months.map(
    (month) => monthSummaryAnalysisDict[month]?.total ?? 0,
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const data = {
    labels: months.map((month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`),
    datasets: [
      {
        label: 'Economy',
        data: economyDataset,
        borderColor: '#16a34a', // green-600
        borderWidth: 1,
        backgroundColor: '#16a34a',
        pointRadius: 2,
      },
      {
        label: 'Premium Economy',
        data: premiumEconomyDataset,
        borderColor: '#3b82f6', // blue-600
        borderWidth: 1,
        backgroundColor: '#3b82f6',
        pointRadius: 2,
      },
      {
        label: 'Business',
        data: businessDataset,
        borderColor: '#b91c1c', // red-700
        borderWidth: 1,
        backgroundColor: '#b91c1c',
        pointRadius: 2,
      },
      {
        label: 'All',
        data: allDataset,
        borderColor: '#1f2937', // gray-800
        borderWidth: 2,
        backgroundColor: '#1f2937',
        pointRadius: 2,
      },
    ],
  };

  return <Line options={options} data={data} />;
}
