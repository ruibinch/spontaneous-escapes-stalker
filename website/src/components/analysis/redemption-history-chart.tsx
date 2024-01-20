import { FlightClass } from '@/index';
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
import monthSummaryAnalysisFile from '../../static/month-summary-analysis.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const monthSummaryAnalysis = monthSummaryAnalysisFile as Record<
  string,
  Record<FlightClass, number>
>;

// Define this list manually first as there are missing months of data
const SE_MONTHS_LIST_WITH_MISSING_DATA_MONTHS = [
  '201709', // missing data
  '201710', // missing data
  '201711',
  '201712',
  '201801',
  '201802', // missing data
  '201803',
  '201804',
  '201805',
  '201806',
  '201807',
  '201808', // missing data
  '201809', // missing data
];

export function RedemptionHistoryChart() {
  const months = (() => {
    const monthsSet = new Set(SE_MONTHS_LIST_WITH_MISSING_DATA_MONTHS);
    Object.keys(monthSummaryAnalysis).forEach((month) => {
      monthsSet.add(month);
    });
    return Array.from(monthsSet);
  })();

  const economyDataset = months.map(
    (month) => monthSummaryAnalysis[month]?.Y ?? 0,
  );
  const premiumEconomyDataset = months.map(
    (month) => monthSummaryAnalysis[month]?.PY ?? 0,
  );
  const businessDataset = months.map(
    (month) => monthSummaryAnalysis[month]?.J ?? 0,
  );
  const allDataset = months.map(
    (month) =>
      (monthSummaryAnalysis[month]?.Y ?? 0) +
      (monthSummaryAnalysis[month]?.PY ?? 0) +
      (monthSummaryAnalysis[month]?.J ?? 0),
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
