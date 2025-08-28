import fs from 'fs';
import { sendMessageToChannels } from './sender';
import { escapeCharacters } from '../lib/telegram/helpers';

const today = new Date().toISOString().split('T')[0];
const logFilename = `${today}.log`;

// Temporary storage for parser errors
let tempParserErrors: string[] = [];

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

/**
 * Logs parser errors to temporary storage instead of the main log file.
 * These errors will only be committed to the main log if all parsers fail.
 */
export function logParserError(message: string) {
  const errorMessage = `🚨 ${message}`;
  console.error(errorMessage);
  tempParserErrors.push(errorMessage);
}

/**
 * Commits all temporary parser errors to the main log file.
 * This should be called when it's determined that all parsers have failed.
 */
export function commitParserErrors() {
  if (tempParserErrors.length === 0) return;

  fs.appendFileSync(logFilename, `${tempParserErrors.join('\n')}\n`);
  tempParserErrors = [];
}

/**
 * Clears temporary parser errors without committing them.
 * This should be called when at least one parser succeeds.
 */
export function clearParserErrors() {
  tempParserErrors = [];
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
