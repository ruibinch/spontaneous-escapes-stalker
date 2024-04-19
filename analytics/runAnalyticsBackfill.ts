import { generateSessions } from './generateSessions';
import {
  generateCustomEvents,
  generatePathEvents,
} from './generateWebsiteEvents';
import { saveGeneratedOutput } from './saveGeneratedOutput';

function runAnalyticsBackfill() {
  const sessions = generateSessions();

  const sessionIds = sessions.map((session) => session.session_id);
  const pathEvents = generatePathEvents(sessionIds);
  const customEvents = generateCustomEvents(sessionIds);
  const websiteEvents = [...pathEvents, ...customEvents];

  console.log(`\nSaving ${sessions.length} sessions to sessions.csv`);
  console.log(
    `Saving ${websiteEvents.length} website events to websiteEvents.csv`,
  );
  saveGeneratedOutput(sessions, 'sessions.csv');
  saveGeneratedOutput(websiteEvents, 'websiteEvents.csv');
}

(() => {
  runAnalyticsBackfill();
})();
