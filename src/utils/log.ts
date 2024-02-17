import fs from 'fs';

const today = new Date().toISOString().split('T')[0];
const logFilename = `${today}.log`;

/**
 * Appends all log messages to a log file. Used during scraping.
 */
export function log(_message: string, isError = false) {
  let message = _message;
  if (isError) {
    console.error(message);
    message = `🚨 ${message}`;
  } else {
    console.log(message);
  }

  fs.appendFileSync(logFilename, `${message}\n`);
}
