import dotenv from 'dotenv';
import { formatDateDisplay, notEmpty } from '.';
import {
  escapeCharacters,
  makeTelegramChannelId,
} from '../lib/telegram/helpers';
import { sendMessage } from '../lib/telegram/methods';
import { Redemption } from '../models/Redemption';
import { FLIGHT_CLASS_SORT_ORDER, REGION_SORT_ORDER } from '../postprocessing/sortRedemptionsList';
import { getRegion } from '../postprocessing/standardiseRegionField';
import { FlightClass, TimePeriod } from './types';

dotenv.config();
const { TELEGRAM_DEBUG_BOT_TOKEN, TELEGRAM_PROD_BOT_TOKEN } = process.env;
const TELEGRAM_DEBUG_CHANNEL_ID = makeTelegramChannelId(
  process.env['TELEGRAM_DEBUG_CHANNEL_ID'],
);
const TELEGRAM_PROD_CHANNEL_ID = makeTelegramChannelId(
  process.env['TELEGRAM_PROD_CHANNEL_ID'],
);

/**
 * Always send messages to debug channel, as long as bot token is provided.
 * Do not send messages to prod channel, unless specified via the shouldSendToProdChannel prop.
 */
export async function sendMessageToChannels(props: {
  message: string;
  shouldSendToProdChannel: boolean;
}) {
  const shouldSendToDebugChannel =
    TELEGRAM_DEBUG_BOT_TOKEN && TELEGRAM_DEBUG_CHANNEL_ID;
  const shouldSendToProdChannel =
    TELEGRAM_PROD_BOT_TOKEN &&
    TELEGRAM_PROD_CHANNEL_ID &&
    props.shouldSendToProdChannel;

  if (shouldSendToDebugChannel) {
    console.info(`ℹ️ Sending message to debug channel`);
    await sendMessage({
      botToken: TELEGRAM_DEBUG_BOT_TOKEN,
      chatId: TELEGRAM_DEBUG_CHANNEL_ID,
      message: props.message,
      shouldTruncateLongMessage: true,
    });
  }

  if (shouldSendToProdChannel) {
    console.info(`ℹ️ Sending message to prod channel`);
    await sendMessage({
      botToken: TELEGRAM_PROD_BOT_TOKEN,
      chatId: TELEGRAM_PROD_CHANNEL_ID,
      message: props.message,
    });
  }
}

export async function sendNewRedemptionPeriodNotification() {
  await sendMessageToChannels({
    message: '‼️ *New redemptions available* ‼️',
    shouldSendToProdChannel: true,
  });
}

export async function sendExistingRedemptionPeriodChangesNotification() {
  await sendMessageToChannels({
    message: '‼️ *Changes to existing redemption period* ‼️',
    shouldSendToProdChannel: true,
  });
}

export async function sendRedemptionsInfoNotification({
  redemptions,
  redemptionEndDate,
  travelPeriod,
}: {
  redemptions: Redemption[];
  redemptionEndDate: Date;
  travelPeriod: TimePeriod;
}) {
  const generateRedemptionsInfo = (flightClass: FlightClass) => {
    const redemptionsForFlightClass = redemptions.filter(
      (r) => r.flightClass === flightClass,
    );
    if (redemptionsForFlightClass.length === 0) return undefined;

    const redemptionsInfoForFlightClass = [...redemptionsForFlightClass]
      .sort((a, b) => a.milesRequired - b.milesRequired)
      .map(({ origin, destination, milesRequired }) => {
        // consider IATA codes
        return escapeCharacters(
          `· ${origin} - ${destination}; ${milesRequired.toLocaleString()}`,
        );
      })
      .join('\n');

    return `*${flightClass}*\n${redemptionsInfoForFlightClass}`;
  };

  const redemptionTerms = [
    `Valid for travel from *${formatDateDisplay(
      travelPeriod.from,
    )} to ${formatDateDisplay(travelPeriod.to)}*`,
    `Redemption ends on ${formatDateDisplay(redemptionEndDate)}`,
  ].join('\n');

  const redemptionsInfo = [
    redemptionTerms,
    generateRedemptionsInfo(FlightClass.ECONOMY),
    generateRedemptionsInfo(FlightClass.PREMIUM_ECONOMY),
    generateRedemptionsInfo(FlightClass.BUSINESS),
  ]
    .filter(notEmpty)
    .join('\n\n');

  await sendMessageToChannels({
    message: redemptionsInfo,
    shouldSendToProdChannel: true,
  });
}
