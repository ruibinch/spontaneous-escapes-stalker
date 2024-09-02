import { addMonths, isWithinInterval, subDays } from 'date-fns';
import fs from 'fs';
import { escapeCharacters } from './lib/telegram/helpers';
import { scrape } from './scrape';
import { datePrefix, sleep } from './utils';
import { sendLogs } from './utils/log';
import { sendMessageToChannels } from './utils/sender';

process.env.TZ = 'UTC';
const MAX_DELAY_SECS = Number(process.env['MAX_DELAY_SECS'] ?? 0);

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

(async () => {
  const isNextMonthRedemptionsAlreadyPublished =
    checkNextMonthRedemptionsAlreadyPublished();
  // also allow if redemptions are already published but it's the first run of the day (i.e. before 0710), to cater for updates to the site
  const yesterdayDate = subDays(new Date(), 1).toISOString().split('T')[0];
  const isFirstRunOfDay = isWithinInterval(new Date(), {
    start: new Date(`${yesterdayDate}T23:00:00.000Z`),
    end: new Date(`${yesterdayDate}T23:10:00.000Z`),
  });

  if (isNextMonthRedemptionsAlreadyPublished && !isFirstRunOfDay) {
    return;
  }

  // add some delay to avoid calling the SE page at the same time everyday
  await sleep(Math.random() * MAX_DELAY_SECS);

  await sendMessageToChannels({
    message: escapeCharacters(
      `${datePrefix()} 🔍 Scraping KF SE page for new redemptions!`,
    ),
    shouldSendToProdChannel: false,
  });

  try {
    await scrape();

    await sendLogs();
    process.exit(0);
  } catch (err) {
    await sendLogs();
    process.exit(1);
  }
})();
