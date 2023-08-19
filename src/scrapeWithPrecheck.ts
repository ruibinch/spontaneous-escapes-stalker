import { addMonths } from 'date-fns';
import fs from 'fs';
import { escapeCharacters } from './lib/telegram/helpers';
import { scrape } from './scrape';
import { sleep, utcDate } from './utils';
import { sendMessageToChannel } from './utils/sender';

process.env.TZ = 'UTC';
const MAX_DELAY_SECS = 500;

function checkNextMonthRedemptionsAlreadyPublished() {
  const redemptionsFiles = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));
  const latestRedemptionFile = redemptionsFiles[redemptionsFiles.length - 1];
  const latestRedemptionPeriod = latestRedemptionFile.split('-')[0];

  if (!/^\d{6}$/.test(latestRedemptionPeriod)) {
    throw new Error('Latest redemption period is not in YYYYMM format');
  }

  const latestRedemptionYear = Number(latestRedemptionPeriod.slice(0, 4));
  const latestRedemptionMonth = Number(latestRedemptionPeriod.slice(4, 6)) - 1;
  const latestRedemptionDate = new Date(
    latestRedemptionYear,
    latestRedemptionMonth,
  );
  const nextMonth = addMonths(new Date(), 1);

  return latestRedemptionDate.getMonth() === nextMonth.getMonth();
}

// TODO: to remove debugging messages sent to Telegram channel
(async () => {
  const isNextMonthRedemptionsAlreadyPublished =
    checkNextMonthRedemptionsAlreadyPublished();
  if (isNextMonthRedemptionsAlreadyPublished) {
    await sendMessageToChannel(
      escapeCharacters(
        `[${utcDate()}] 💤 Redemptions for next month are already published`,
      ),
    );
    return;
  }

  // add some delay to avoid calling the SE page at the same time everyday
  await sleep(Math.random() * MAX_DELAY_SECS);

  await sendMessageToChannel(
    escapeCharacters(
      `[${utcDate()}] 🔍 Scraping KF SE page for new redemptions!`,
    ),
  );
  await scrape();
})();
