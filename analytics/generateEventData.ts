import { v4 as uuid } from 'uuid';
import { EVENT_NAME_TO_KEY_MAP, WEBSITE_ID } from './constants';
import { getEventNameToDataProbabilityMap } from './getVercelStats';
import { EventDatum, WebsiteEvent } from './types';
import { generateFromProbabilityMap } from './utils';

export function generateEventData(customEvents: WebsiteEvent[]) {
  const eventNamesWithData = Object.keys(EVENT_NAME_TO_KEY_MAP).filter(
    (eventName) => !!EVENT_NAME_TO_KEY_MAP[eventName],
  );
  const customEventsWithData = customEvents.filter(
    (customEvent) =>
      customEvent.event_name &&
      eventNamesWithData.includes(customEvent.event_name),
  );

  const eventNameToDataProbabilityMap = getEventNameToDataProbabilityMap();
  const eventData: EventDatum[] = [];
  console.log(`Generating ${customEventsWithData.length} event data entries`);
  customEventsWithData.forEach((customEvent) => {
    const eventName = customEvent.event_name;
    if (!eventName) {
      // should never reach here as all custom events are created with event_name
      throw new Error(
        `No event name found for custom event ${customEvent.event_id}`,
      );
    }
    const eventKey = EVENT_NAME_TO_KEY_MAP[eventName];
    if (!eventKey) {
      // should never reach here as we filter out events without event data
      throw new Error(`No event key found for event name ${eventName}`);
    }

    const eventDataProbabilityMap = eventNameToDataProbabilityMap[eventName];
    const eventDatum: EventDatum = {
      event_data_id: uuid(),
      website_id: WEBSITE_ID,
      website_event_id: customEvent.event_id,
      event_key: eventKey,
      string_value: generateFromProbabilityMap(eventDataProbabilityMap),
      data_type: 1,
      created_at: customEvent.created_at!,
    };

    eventData.push(eventDatum);
  });

  return eventData;
}
