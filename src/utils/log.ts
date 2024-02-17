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
    console.error(message);
    message = `🚨 ${message}`;
  } else {
    console.log(message);
  }

  fs.appendFileSync(logFilename, `${message}\n`);
}

export async function sendLogs() {
  const content = fs.readFileSync(logFilename).toString();

  try {
    await sendMessageToChannels({
      message: escapeCharacters(content),
      shouldSendToProdChannel: false,
    });
    fs.rmSync(logFilename);
  } catch (err) {
    console.error(`❌ Unable to send contents for ${logFilename} log file`);
  }
}
