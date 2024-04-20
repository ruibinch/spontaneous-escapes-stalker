import { generateEventData } from './generateEventData';
import { generateSessions } from './generateSessions';
import {
  generateCustomEvents,
  generatePathEvents,
} from './generateWebsiteEvents';
import { saveGeneratedOutputToTsv } from './saveGeneratedOutputToTsv';

function runAnalyticsBackfill() {
  const sessions = generateSessions();

  const sessionIds = sessions.map((session) => session.session_id);
  const pathEvents = generatePathEvents(sessionIds);
  const customEvents = generateCustomEvents(sessionIds);
  const websiteEvents = [...pathEvents, ...customEvents];

  const eventData = generateEventData(customEvents);

  console.log(`\nSaving ${sessions.length} sessions to sessions.tsv`);
  console.log(
    `Saving ${websiteEvents.length} website events to websiteEvents.tsv`,
  );
  console.log(`Saving ${eventData.length} sessions to eventData.tsv`);
  saveGeneratedOutputToTsv(sessions, 'sessions.tsv');
  saveGeneratedOutputToTsv(websiteEvents, 'websiteEvents.tsv');
  saveGeneratedOutputToTsv(eventData, 'eventData.tsv');
}

(() => {
  runAnalyticsBackfill();
})();
