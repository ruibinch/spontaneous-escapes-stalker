// @ts-ignore ignore importing type declaration for the sake of it
import { v4 as uuid } from 'uuid';
import { PAGE_TITLE, WEBSITE_ID } from './constants';
import {
  getEventNameToPathProbabilityMap,
  getStatsData,
  getStatsProbabilityMap,
} from './getVercelStats';
import { WebsiteEvent } from './types';
import { generateFromProbabilityMap } from './utils';

const makeGetRandomSessionId = (sessionIds: string[]) => () =>
  sessionIds[Math.floor(Math.random() * sessionIds.length)];

function getPathEventsCount() {
  const pathData = getStatsData('path');
  return pathData.reduce((_total, stat) => _total + stat.devices, 0);
}

export function generatePathEvents(sessionIds: string[]) {
  const pathCount = getPathEventsCount();
  const pathProbabilityMap = getStatsProbabilityMap('path');
  const timeseriesProbabilityMap = getStatsProbabilityMap('timeseries');
  const getRandomSessionId = makeGetRandomSessionId(sessionIds);

  const pathEvents: WebsiteEvent[] = [];
  console.log(`Generating ${pathCount} path events`);
  for (let i = 0; i < pathCount; i++) {
    pathEvents.push({
      event_id: uuid(),
      website_id: WEBSITE_ID,
      // map to a random session as there is no way of mapping to a specific session
      session_id: getRandomSessionId(),
      created_at: new Date(
        generateFromProbabilityMap(timeseriesProbabilityMap),
      ).toISOString(),
      url_path: generateFromProbabilityMap(pathProbabilityMap),
      referrer_query: '',
      referrer_domain: '',
      page_title: PAGE_TITLE,
      event_type: 1,
      // use random UUID as there is no way of mapping to a specific visit
      visit_id: uuid(),
    });
  }

  return pathEvents;
}

function getCustomEventsCount() {
  const eventNameData = getStatsData('event_name');
  return eventNameData.reduce((_total, stat) => _total + stat.devices, 0);
}

export function generateCustomEvents(sessionIds: string[]) {
  const customEventsCount = getCustomEventsCount();
  const customEventsProbabilityMap = getStatsProbabilityMap('event_name');
  const eventNameToPathProbabilityMap = getEventNameToPathProbabilityMap();
  const timeseriesProbabilityMap = getStatsProbabilityMap('timeseries');
  const getRandomSessionId = makeGetRandomSessionId(sessionIds);

  const customEvents: WebsiteEvent[] = [];
  console.log(`Generating ${customEventsCount} custom events`);
  for (let i = 0; i < customEventsCount; i++) {
    const eventName = generateFromProbabilityMap(customEventsProbabilityMap);
    const urlPath = generateFromProbabilityMap(
      eventNameToPathProbabilityMap[eventName],
    );

    customEvents.push({
      event_id: uuid(),
      website_id: WEBSITE_ID,
      // map to a random session as there is no way of mapping to a specific session
      session_id: getRandomSessionId(),
      created_at: new Date(
        generateFromProbabilityMap(timeseriesProbabilityMap),
      ).toISOString(),
      url_path: urlPath,
      referrer_query: '',
      referrer_domain: '',
      page_title: PAGE_TITLE,
      event_type: 2,
      event_name: eventName,
      // use random UUID as there is no way of mapping to a specific visit
      visit_id: uuid(),
    });
  }

  return customEvents;
}
