import axios from 'axios';

import { TelegramMessageError } from '../../errors/TelegramMessageError';
import { makeTelegramApiBase } from './helpers';
import { TelegramResponseBase, TelegramSendMessageParams } from './types';

const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

export async function sendMessage(props: {
  botToken: string;
  chatId: number | string;
  message?: string | undefined;
  messageParams?: TelegramSendMessageParams | undefined;
  shouldTruncateLongMessage?: boolean;
}): Promise<void> {
  const { botToken, chatId, message: _message, messageParams } = props;
  const message = _message ?? messageParams?.text;
  if (!message) return;

  const telegramSendMessageUrl = `${makeTelegramApiBase(botToken)}/sendMessage`;
  const telegramMessages = composeTelegramMessages({
    message,
    shouldTruncateLongMessage: props.shouldTruncateLongMessage ?? false,
  });

  const responses = await telegramMessages.reduce(
    (promise, telegramMessage) =>
      promise.then((_responses) =>
        axios
          .get(telegramSendMessageUrl, {
            params: {
              chat_id: chatId,
              text: telegramMessage,
              parse_mode: 'MarkdownV2',
              reply_markup: messageParams?.reply_markup ?? {
                remove_keyboard: true,
              },
            },
          })
          .then((res) => res.data)
          .catch((error) => {
            console.error('[telegram > methods > sendMessage]', {
              telegramResponse: error.response.data,
              message,
              botToken,
              chatId,
            });
            return error.response.data;
          })
          .then((_response: TelegramResponseBase) => [
            ..._responses,
            _response,
          ]),
      ),
    Promise.resolve([] as TelegramResponseBase[]),
  );

  const errorResponses = responses.filter((res) => !res.ok);
  if (errorResponses.length > 0) {
    // just throw the first response for convenience; TODO: to improve
    throw new TelegramMessageError(errorResponses[0]);
  }
}

/**
 * Splits the message into multiple messages if it exceeds the Telegram message length limit.
 *
 * @param message - The full message
 * @param shouldTruncateLongMessage - Whether to truncate or split up the message if it exceeds the Telegram message length limit.
 * @returns An array of messages to send to the Telegram API.
 */
function composeTelegramMessages({
  message,
  shouldTruncateLongMessage,
}: {
  message: string;
  shouldTruncateLongMessage: boolean;
}): string[] {
  if (message.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
    return [message];
  }
  if (shouldTruncateLongMessage) {
    return [message.slice(0, TELEGRAM_MESSAGE_MAX_LENGTH)];
  }

  const delimiter = '\n\n';
  const messageSplit = message.split(delimiter);

  let firstMessageLength = 0;
  let splitIndex = 0;
  for (let i = 0; i < messageSplit.length; i += 1) {
    const entryLength = messageSplit[i].length + delimiter.length;

    if (firstMessageLength + entryLength > TELEGRAM_MESSAGE_MAX_LENGTH) {
      break;
    }

    firstMessageLength += entryLength;
    splitIndex = i;
  }

  // Assumption: message.length will never exceed 4096 * 2, i.e. at most 2 Telegram messages are required
  const firstMessage = messageSplit.slice(0, splitIndex + 1).join('\n\n');
  const secondMessage = messageSplit.slice(splitIndex + 1).join('\n\n');

  return [firstMessage, secondMessage];
}
