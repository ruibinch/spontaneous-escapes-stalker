import axios from 'axios';
import fs from 'fs';
import path from 'path';
import {
  ENVIRONMENT,
  EVENT_NAME_TO_KEY_MAP,
  LIMIT,
  PROJECT_ID,
  TEAM_ID,
} from './constants';

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
  const total = statsData.reduce((_total, stat) => _total + stat.devices, 0);

  return statsData.reduce((_map: Record<string, number>, stat) => {
    _map[stat.key] = stat.devices / total;
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
 * Returns a mapping of event name to event data to probability.
 */
export function getEventNameToEventDataProbabilityMap() {
  const eventNamesWithData = Object.keys(EVENT_NAME_TO_KEY_MAP).filter(
    (eventName) => !!EVENT_NAME_TO_KEY_MAP[eventName],
  );

  const eventNameToEventDataProbabilityMap = eventNamesWithData.reduce(
    (
      _eventNameToEventDataProbabilityMap: Record<
        string,
        Record<string, number>
      >,
      eventName,
    ) => {
      const eventDataFilepath = path.join(
        'analytics',
        'data',
        `event-${eventName.replace(/\/|:/g, '')}.json`,
      );
      const eventDataFile = JSON.parse(
        fs.readFileSync(eventDataFilepath).toString(),
      ) as StatsFile;

      const eventDataToCountMap = eventDataFile.data.reduce(
        (_eventDataToCountMap: Record<string, number>, { key, total }) => {
          _eventDataToCountMap[key] = total;
          return _eventDataToCountMap;
        },
        {},
      );

      const total = Object.values(eventDataToCountMap).reduce(
        (_total, count) => _total + count,
        0,
      );
      _eventNameToEventDataProbabilityMap[eventName] = Object.entries(
        eventDataToCountMap,
      ).reduce(
        (
          _eventDataToProbabilityMap: Record<string, number>,
          [_eventDatumValue, count],
        ) => {
          // some values have random "\t" characters which mess up the TSV parsing
          const eventDatumValue = _eventDatumValue.replace('\t', '');
          _eventDataToProbabilityMap[eventDatumValue] = count / total;
          return _eventDataToProbabilityMap;
        },
        {},
      );

      return _eventNameToEventDataProbabilityMap;
    },
    {},
  );
  return eventNameToEventDataProbabilityMap;
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
      console.log(`Extracting event names for path "${_path}"`);
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

export async function extractEventData() {
  const eventNameData = getStatsData('event_name');
  const eventNames = eventNameData.map((stat) => stat.key);

  eventNames.forEach(async (eventName) => {
    const eventNameKey = EVENT_NAME_TO_KEY_MAP[eventName];
    if (!eventNameKey) {
      return;
    }

    console.log(
      `\Extracting event data for eventName "${eventName}" and key "${eventNameKey}"`,
    );
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
          type: 'event_data',
          filter: `{"event_name":{"values":["${eventName}"],"operator":"eq"}}`,
          jsonProperty: eventNameKey,
        },
        headers: {
          Authorization: `Bearer ${process.env['VERCEL_AUTH_TOKEN']}`,
        },
      },
    );
    const responseData = response.data as StatsFile;

    const eventDataFilepath = path.join(
      'analytics',
      'data',
      `event-${eventName.replace(/\/|:/g, '')}.json`,
    );
    console.log(
      `Saving ${responseData.data.length} entries to ${eventDataFilepath}\n`,
    );
    fs.writeFileSync(eventDataFilepath, JSON.stringify(responseData, null, 4));
  });
}

(async () => {
  if (!!process.env['EXTRACT_EVENT_NAMES_FOR_PATHS']) {
    await extractEventNamesForPaths();
  }

  if (!!process.env['EXTRACT_EVENT_DATA']) {
    await extractEventData();
  }
})();
