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

// Redefining here instead of referencing from index.d.ts as importing it throws a "module not found" error for some reason
enum Region {
  SOUTH_EAST_ASIA = 'South East Asia',
  NORTH_ASIA = 'North Asia',
  SOUTH_ASIA = 'South Asia',
  MIDDLE_EAST_AND_AFRICA = 'Middle East & Africa',
  SOUTHWEST_PACIFIC = 'Southwest Pacific',
  EUROPE = 'Europe',
  USA = 'USA',
}

export function DistributionByRegionChart({
  monthSummaryAnalysisDict,
  months,
}: {
  monthSummaryAnalysisDict: MonthSummaryAnalysisDict;
  months: string[];
}) {
  const southEastAsiaRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[Region.SOUTH_EAST_ASIA] ?? 0,
  );
  const northAsiaRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[Region.NORTH_ASIA] ?? 0,
  );
  const southAsiaRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[Region.SOUTH_ASIA] ?? 0,
  );
  const middleEastAndAfricaRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[
        Region.MIDDLE_EAST_AND_AFRICA
      ] ?? 0,
  );
  const southwestPacificRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[Region.SOUTHWEST_PACIFIC] ??
      0,
  );
  const europeRegionDataset = months.map(
    (month) => monthSummaryAnalysisDict[month]?.byRegion?.[Region.EUROPE] ?? 0,
  );
  const usaRegionDataset = months.map(
    (month) =>
      monthSummaryAnalysisDict[month]?.byRegion?.[Region.NORTH_AMERICA] ?? 0,
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
        label: Region.SOUTH_EAST_ASIA,
        data: southEastAsiaRegionDataset,
        borderColor: '#84cc16', // lime-500
        borderWidth: 1,
        backgroundColor: '#84cc16',
        pointRadius: 2,
      },
      {
        label: Region.NORTH_ASIA,
        data: northAsiaRegionDataset,
        borderColor: '#22d3ee', // cyan-400
        borderWidth: 1,
        backgroundColor: '#22d3ee',
        pointRadius: 2,
      },
      {
        label: Region.SOUTH_ASIA,
        data: southAsiaRegionDataset,
        borderColor: '#713f12', // yellow-900
        borderWidth: 1,
        backgroundColor: '#713f12',
        pointRadius: 2,
      },
      {
        label: Region.MIDDLE_EAST_AND_AFRICA,
        data: middleEastAndAfricaRegionDataset,
        borderColor: '#fcd34d', // amber-300
        borderWidth: 1,
        backgroundColor: '#fcd34d',
        pointRadius: 2,
      },
      {
        label: Region.SOUTHWEST_PACIFIC,
        data: southwestPacificRegionDataset,
        borderColor: '#c026d3', // fuchsia-600
        borderWidth: 1,
        backgroundColor: '#c026d3',
        pointRadius: 2,
      },
      {
        label: Region.EUROPE,
        data: europeRegionDataset,
        borderColor: '#1d4ed8', // blue-700
        borderWidth: 1,
        backgroundColor: '#1d4ed8',
        pointRadius: 2,
      },
      {
        label: Region.NORTH_AMERICA,
        data: usaRegionDataset,
        borderColor: '#ef4444', // red-500
        borderWidth: 1,
        backgroundColor: '#ef4444',
        pointRadius: 2,
      },
    ],
  };

  return <Line options={options} data={data} />;
}
