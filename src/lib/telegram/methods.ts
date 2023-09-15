import axios from 'axios';

import { TelegramMessageError } from '../../errors/TelegramMessageError';
import { makeTelegramApiBase } from './helpers';
import { TelegramResponseBase, TelegramSendMessageParams } from './types';

export async function sendMessage(props: {
  botToken: string;
  chatId: number | string;
  message?: string | undefined;
  messageParams?: TelegramSendMessageParams | undefined;
}): Promise<void> {
  const { botToken, chatId, message: _message, messageParams } = props;
  const message = _message ?? messageParams?.text;
  if (!message) return;

  const telegramSendMessageUrl = `${makeTelegramApiBase(botToken)}/sendMessage`;

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
        botToken,
        chatId,
      });
      return error.response.data;
    });

  if (!response.ok) {
    throw new TelegramMessageError(response);
  }
}
