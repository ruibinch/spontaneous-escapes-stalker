import fs from 'fs';
import path from 'path';

interface Stat {
  key: string;
  total: number;
  devices: number;
}

interface StatsFile {
  data: Stat[];
}

const categories = [
  'client_name',
  'country',
  'os_name',
  'path',
  'timeseries',
] as const;
type Category = (typeof categories)[number];

export function getStatsProbabilityMap(category: Category) {
  const statsData = getStatsData(category);
  const total = statsData.reduce((_total, stat) => _total + stat.total, 0);

  return statsData.reduce((_map: Record<string, number>, stat) => {
    _map[stat.key] = stat.total / total;
    return _map;
  }, {});
}

export function getStatsData(category: Category) {
  const statsFilepath = path.join('analytics', 'data', `${category}.json`);
  const statsFile = JSON.parse(
    fs.readFileSync(statsFilepath).toString(),
  ) as StatsFile;
  return statsFile.data;
}
