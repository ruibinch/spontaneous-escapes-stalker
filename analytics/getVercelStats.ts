import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ENVIRONMENT, LIMIT, PROJECT_ID, TEAM_ID } from './constants';

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
  'event_name',
  'country',
  'os_name',
  'path',
  'timeseries',
] as const;
type Category = (typeof categories)[number];

export function getStatsProbabilityMap(
  category: Category,
): Record<string, number> {
  const statsData = getStatsData(category);
  const total = statsData.reduce((_total, stat) => _total + stat.total, 0);

  return statsData.reduce((_map: Record<string, number>, stat) => {
    _map[stat.key] = stat.total / total;
    return _map;
  }, {});
}

export function getStatsData(category: Category): Stat[] {
  const statsFilepath = path.join('analytics', 'data', `${category}.json`);
  const statsFile = JSON.parse(
    fs.readFileSync(statsFilepath).toString(),
  ) as StatsFile;
  return statsFile.data;
}

/**
 * Returns a mapping of event name to path to probability.
 */
export function getEventNameToPathProbabilityMap(): Record<
  string,
  Record<string, number>
> {
  const eventNamesForPathFilepath = path.join(
    'analytics',
    'data',
    'event_names_for_path.json',
  );
  const eventNamesForPathFile = JSON.parse(
    fs.readFileSync(eventNamesForPathFilepath).toString(),
  ) as Record<string, Stat[]>;

  const eventNameToPathToCountMap = Object.entries(
    eventNamesForPathFile,
  ).reduce(
    (
      _eventNameToPathToCountMap: Record<string, Record<string, number>>,
      [path, eventNames],
    ) => {
      eventNames.forEach(({ key, total }) => {
        if (!_eventNameToPathToCountMap[key]) {
          _eventNameToPathToCountMap[key] = {};
        }
        _eventNameToPathToCountMap[key][path] = total;
      });
      return _eventNameToPathToCountMap;
    },
    {},
  );

  const eventNameToPathToProbabilityMap = Object.entries(
    eventNameToPathToCountMap,
  ).reduce(
    (
      _eventNameToPathToProbabilityMap: Record<string, Record<string, number>>,
      [eventName, pathToCountMap],
    ) => {
      const total = Object.values(pathToCountMap).reduce(
        (_total, count) => _total + count,
        0,
      );
      _eventNameToPathToProbabilityMap[eventName] = Object.entries(
        pathToCountMap,
      ).reduce(
        (_pathToProbabilityMap: Record<string, number>, [path, count]) => {
          _pathToProbabilityMap[path] = count / total;
          return _pathToProbabilityMap;
        },
        {},
      );
      return _eventNameToPathToProbabilityMap;
    },
    {},
  );
  return eventNameToPathToProbabilityMap;
}

/**
 * Creates a mapping of path to event names for all existing paths,
 * and saves it to analytics/data/event_names_for_path.json.
 */
export async function extractEventNamesForPaths() {
  const pathData = getStatsData('path');
  const paths = pathData.map((stat) => stat.key);
  const pathToEventNamesMap: Record<string, Stat[]> = {};

  await Promise.all(
    paths.map(async (_path) => {
      console.log(`Extracting event names for path: ${_path}`);
      const response = await axios.get(
        'https://vercel.com/api/web-analytics/stats',
        {
          params: {
            environment: ENVIRONMENT,
            projectId: PROJECT_ID,
            teamId: TEAM_ID,
            limit: LIMIT,
            from: '2024-04-06T00:00:00.000+00:00',
            to: '2024-04-14T16:00:00.000+00:00',
            type: 'event_name',
            filter: `{"path":{"values":["${_path}"],"operator":"eq"}}`,
          },
          headers: {
            Authorization: `Bearer ${process.env['VERCEL_AUTH_TOKEN']}`,
          },
        },
      );
      const responseData = response.data as StatsFile;
      pathToEventNamesMap[_path] = responseData.data;
    }),
  );

  const eventNamesForPathFilepath = path.join(
    'analytics',
    'data',
    'event_names_for_path.json',
  );
  fs.writeFileSync(
    eventNamesForPathFilepath,
    JSON.stringify(pathToEventNamesMap, null, 2),
  );
}

(async () => {
  if (!!process.env['EXTRACT_EVENT_NAMES_FOR_PATHS']) {
    await extractEventNamesForPaths();
  }
})();
