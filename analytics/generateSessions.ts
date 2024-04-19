import { v4 as uuid } from 'uuid';
import { HOSTNAME, WEBSITE_ID } from './constants';
import { getStatsData, getStatsProbabilityMap } from './getVercelStats';
import { Session } from './types';
import { generateFromProbabilityMap } from './utils';

function getSessionsCount() {
  const timeseriesData = getStatsData('timeseries');
  return timeseriesData.reduce((_total, stat) => _total + stat.total, 0);
}

export function generateSessions() {
  const sessionsCount = getSessionsCount();
  const clientNameProbabilityMap = getStatsProbabilityMap('client_name');
  const countryProbabilityMap = getStatsProbabilityMap('country');
  const osNameProbabilityMap = getStatsProbabilityMap('os_name');
  const timeseriesProbabilityMap = getStatsProbabilityMap('timeseries');

  const sessions: Session[] = [];
  console.log(`Generating ${sessionsCount} sessions`);
  for (let i = 0; i < sessionsCount; i++) {
    sessions.push({
      session_id: uuid(),
      website_id: WEBSITE_ID,
      hostname: HOSTNAME,
      browser: mapBrowser(generateFromProbabilityMap(clientNameProbabilityMap)),
      os: mapOS(generateFromProbabilityMap(osNameProbabilityMap)),
      // device: '',
      // screen: '',
      // language: '',
      country: generateFromProbabilityMap(countryProbabilityMap),
      // subdivision1: '',
      // subdivision2: '',
      // city: '',
      created_at: new Date(
        generateFromProbabilityMap(timeseriesProbabilityMap),
      ).toISOString(),
    });
  }

  // verifySessionDataForField(clientNameProbabilityMap, sessions, 'browser');
  // verifySessionDataForField(countryProbabilityMap, sessions, 'country');
  // verifySessionDataForField(osNameProbabilityMap, sessions, 'os');
  // verifySessionDataForField(timeseriesProbabilityMap, sessions, 'created_at');

  return sessions;
}

function mapBrowser(browser: string) {
  // Reference: https://github.com/ruibinch/umami/blob/be7f69fd5d3d711ba650a21013b73c7e17125f52/src/lib/constants.ts#L273
  const browserMapping: Record<string, string> = {
    Chrome: 'chrome',
    'Mobile Safari': 'safari',
    'Chrome Mobile': 'chrome',
    'Chrome Mobile iOS': 'crios',
    Safari: 'safari',
    Facebook: 'facebook',
    // 'Microsoft Edge': '',
    'Samsung Browser': 'samsung',
    Firefox: 'firefox',
    // 'Google Search App': '',
    'Firefox Mobile iOS': 'fxios',
    Opera: 'opera',
    'Firefox Mobile': 'firefox',
    'Chrome Webview': 'chromium-webview',
    'Instagram App': 'instagram',
    'MIUI Browser': 'miui',
    'Opera Mobile': 'opera',
    // Reeder: '',
    // WeChat: '',
  };
  return browserMapping[browser] ?? browser;
}

function mapOS(os: string) {
  // Reference: https://github.com/ruibinch/umami/blob/be7f69fd5d3d711ba650a21013b73c7e17125f52/src/lib/constants.ts#L265
  const osMapping: Record<string, string> = {
    // 'iOS': '',
    Android: 'Android OS',
    Windows: 'Windows 10',
    Mac: 'Mac OS',
    'GNU/Linux': 'Linux',
    // 'Chrome OS': '',
  };
  return osMapping[os] ?? os;
}

/**
 * Helper function to verify that the generated session data is in the same proportions as expected.
 */
function verifySessionDataForField(
  expectedProbabilityMap: Record<string, number>,
  sessions: Session[],
  field: keyof Session,
) {
  const fieldValuesCountMap = sessions.reduce(
    (map: Record<string, number>, session) => {
      const fieldValue = session[field]?.split('T')[0];
      if (fieldValue) {
        map[fieldValue] = (map[fieldValue] ?? 0) + 1;
      }
      return map;
    },
    {},
  );
  const fieldValuesProbabilityMap = Object.entries(fieldValuesCountMap).reduce(
    (map: Record<string, number>, [fieldValue, count]) => {
      map[fieldValue] = count / sessions.length;
      return map;
    },
    {},
  );

  const fieldValuesProbabilityCombinedMap = Object.keys(
    fieldValuesProbabilityMap,
  ).reduce(
    (
      map: Record<string, Record<'expected' | 'actual', number>>,
      fieldValue,
    ) => {
      map[fieldValue] = {
        expected: Number(expectedProbabilityMap[fieldValue].toFixed(4)),
        actual: Number(fieldValuesProbabilityMap[fieldValue].toFixed(4)),
      };
      return map;
    },
    {},
  );
  console.log(fieldValuesProbabilityCombinedMap);
}
