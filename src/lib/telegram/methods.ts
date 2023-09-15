import axios from 'axios';
import dotenv from 'dotenv';

import { TelegramMessageError } from '../../errors/TelegramMessageError';
import { makeTelegramApiBase } from './helpers';
import { TelegramResponseBase, TelegramSendMessageParams } from './types';

dotenv.config();
const { TELEGRAM_BOT_TOKEN } = process.env;

export async function sendMessage(props: {
  chatId: number | string;
  message?: string | undefined;
  messageParams?: TelegramSendMessageParams | undefined;
}): Promise<void> {
  const { chatId, message: _message, messageParams } = props;
  const message = _message ?? messageParams?.text;
  if (!message) return;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error(
      '[telegram > methods > sendMessage] TELEGRAM_BOT_TOKEN not defined',
    );
  }
  const telegramSendMessageUrl = `${makeTelegramApiBase(
    TELEGRAM_BOT_TOKEN,
  )}/sendMessage`;

  const response: TelegramResponseBase = await axios
    .get(telegramSendMessageUrl, {
      params: {
        chat_id: chatId,
        text: message,
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
      });
      return error.response.data;
    });

  if (!response.ok) {
    throw new TelegramMessageError(response);
  }
}
