import fs from 'fs';
import { sendMessageToChannels } from './sender';
import { escapeCharacters } from '../lib/telegram/helpers';

const today = new Date().toISOString().split('T')[0];
const logFilename = `${today}.log`;

/**
 * Appends all log messages to a log file. Used during scraping.
 */
export function log(_message: string, isError = false) {
  let message = _message;
  if (isError) {
    message = `🚨 ${message}`;
    console.error(message);
  } else {
    console.log(message);
  }

  fs.appendFileSync(logFilename, `${message}\n`);
}

export async function sendLogs() {
  if (!fs.existsSync(logFilename)) {
    // no logs to send
    return;
  }

  const content = fs.readFileSync(logFilename).toString();

  try {
    await sendMessageToChannels({
      message: escapeCharacters(content),
      shouldSendToProdChannel: false,
    });
    deleteLogs();
  } catch (err) {
    console.error(`❌ Unable to send contents for ${logFilename} log file`);
  }
}

export function deleteLogs() {
  fs.rmSync(logFilename);
}
