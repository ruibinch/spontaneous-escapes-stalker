import { isAxiosError } from 'axios';
import fs from 'fs';
import { HTMLElement } from 'node-html-parser';
import { analyse } from './analyse';
import { escapeCharacters } from './lib/telegram/helpers';
import { loadHtml } from './loadHtml';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';
import { parseRedemptionEndDate } from './parsers/parseRedemptionEndDate';
import { parseRedemptionTables } from './parsers/parseRedemptionTables';
import { parseRedemptionTablesV2 } from './parsers/parseRedemptionTablesV2';
import { parseRedemptionTravelPeriod } from './parsers/parseRedemptionTravelPeriod';
import { postprocessing } from './postprocessing';
import { updateDataFiles } from './updateDataFiles';
import { dateInYYYYMM, datePrefix } from './utils';
import { getCurrentMonth } from './utils/getCurrentMonth';
import { log, sendLogs } from './utils/log';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannels,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './utils/sender';
import { TimePeriod } from './utils/types';

// env var configs
process.env.TZ = 'UTC';
const shouldUseAws = !!process.env['USE_AWS'];
const shouldUsePuppeteer = !!process.env['USE_PUPPETEER'];
const htmlFilepath = process.env['HTML_FILEPATH'];
const isBasicRun = !!process.env['BASIC_RUN'];
const shouldSendRedemptionsChangeNotificationToProd =
  !!process.env['SEND_REDEMPTIONS_CHANGE_NOTIFICATION'];

export async function scrape(): Promise<{ shouldSendLogs: boolean }> {
  let html: HTMLElement | undefined;
  let isNewHtml: boolean;
  const isOverrideHtml = !!htmlFilepath && htmlFilepath.includes('override');

  try {
    const loadHtmlResult = await loadHtml({
      htmlFilepath,
      shouldUsePuppeteer,
    });
    html = loadHtmlResult.html;
    isNewHtml = loadHtmlResult.isNewHtml;
  } catch (err) {
    const errorMessage = isAxiosError(err) ? err.message : 'Unknown error';
    await sendMessageToChannels({
      message: escapeCharacters(`${datePrefix()} 🔥 ${errorMessage}`),
      shouldSendToProdChannel: false,
    });
    return { shouldSendLogs: true };
  }

  // extract the latest info from the page first
  const redemptionTablesInfo =
    parseRedemptionTables(html) ?? parseRedemptionTablesV2(html);
  if (!redemptionTablesInfo) {
    await sendMessageToChannels({
      message: escapeCharacters(
        `${datePrefix()} 🔥 Unable to scrape any redemptions data`,
      ),
      shouldSendToProdChannel: false,
    });
    return { shouldSendLogs: true };
  }

  const currentMonth = getCurrentMonth(redemptionTablesInfo);
  const redemptionEndDate = parseRedemptionEndDate(html, currentMonth);
  const redemptionTravelPeriod = parseRedemptionTravelPeriod(
    html,
    currentMonth,
  );
  const redemptions = redemptionTablesInfo.map((redemptionInfo) =>
    Redemption.create({
      ...redemptionInfo,
      redemptionEndDate,
    }),
  );

  // in a basic run, simply save the files to local disk and return early without subsequent checks
  if (isBasicRun) {
    saveDataFiles({
      html: isNewHtml ? html : undefined,
      isOverrideHtml,
      redemptions,
      redemptionTravelPeriod,
    });
    return { shouldSendLogs: true };
  }

  // check saved data
  const doesRedemptionPeriodExist = await (shouldUseAws
    ? RedemptionPeriod.exists(redemptionEndDate)
    : RedemptionPeriod.existsLocal(redemptionTravelPeriod.from));
  const redemptionsSavedForPeriod = await (() => {
    if (!doesRedemptionPeriodExist) return [];
    return shouldUseAws
      ? Redemption.query(redemptionEndDate)
      : Redemption.queryLocal(redemptionTravelPeriod.from);
  })();

  // compare latest and saved redemptions info
  const newRedemptions = compareRedemptions(
    redemptions,
    redemptionsSavedForPeriod,
  );

  if (doesRedemptionPeriodExist && newRedemptions.length === 0) {
    // no changes, return early
    log('🚫 No changes');
    return { shouldSendLogs: false };
  }

  let isNewRelease = true;

  if (!doesRedemptionPeriodExist) {
    log(
      `Redemption period "${
        redemptionTravelPeriod.from.toISOString().split('T')[0]
      }" does not exist`,
    );
    if (shouldUseAws) {
      await RedemptionPeriod.upload({
        redemptionEndDate,
        travelPeriod: redemptionTravelPeriod,
      });
    }
    await sendNewRedemptionPeriodNotification();
  } else {
    isNewRelease = false;
    log(
      `Changes to existing redemption period "${
        redemptionTravelPeriod.from.toISOString().split('T')[0]
      }"`,
    );
    if (shouldSendRedemptionsChangeNotificationToProd) {
      await sendExistingRedemptionPeriodChangesNotification();
    }
  }

  if (shouldUseAws) {
    await Redemption.upload(newRedemptions);
  }

  /**
   * If new redemption period exists,
   * - send Telegram notifications
   * - save data files
   * - re-run postprocessing and analysis scripts
   * - update website data files with new JSONs
   * - commit changes and push to git repo
   * - deploy website to incorporate data files changes
   */

  if (isNewRelease || shouldSendRedemptionsChangeNotificationToProd) {
    await sendRedemptionsInfoNotification({
      redemptions: newRedemptions,
      redemptionEndDate,
      travelPeriod: redemptionTravelPeriod,
    });
  }

  saveDataFiles({
    html: isNewHtml ? html : undefined,
    isOverrideHtml,
    redemptions,
    redemptionTravelPeriod,
  });
  postprocessing();
  analyse();
  await updateDataFiles({ isNewRelease });

  return { shouldSendLogs: true };
}

/**
 * Saves HTML and redemptions JSON to /data folder on local disk.
 */
function saveDataFiles({
  html,
  isOverrideHtml,
  redemptions,
  redemptionTravelPeriod,
}: {
  html: HTMLElement | undefined;
  isOverrideHtml: boolean;
  redemptions: Redemption[];
  redemptionTravelPeriod: TimePeriod;
}) {
  if (html) {
    const htmlFilename = `data/${dateInYYYYMM(
      redemptionTravelPeriod.from,
    )}-content.html`;
    log(`📄 Writing to ${htmlFilename}`);
    fs.writeFileSync(htmlFilename, html.toString());
  }

  const redemptionsFilename = `data/${dateInYYYYMM(
    redemptionTravelPeriod.from,
  )}-redemptions${isOverrideHtml ? '-override' : ''}.json`;
  log(`📄 Writing to ${redemptionsFilename}`);
  fs.writeFileSync(redemptionsFilename, JSON.stringify(redemptions, null, 2));
}

/**
 * Compares latest obtained entries with the saved list of redemptions.
 * Returns list of new entries.
 */
function compareRedemptions(
  redemptions: Redemption[],
  savedRedemptions: Redemption[],
) {
  return redemptions.filter((redemption) => {
    const isRedemptionNew = savedRedemptions.every(
      (savedRedemption) => !redemption.isIdentical(savedRedemption),
    );
    return isRedemptionNew;
  });
}

if (require.main === module) {
  scrape()
    .then(async () => {
      await sendLogs();
      process.exit(0);
    })
    .catch(async (err) => {
      if (err instanceof Error) {
        log(err.message, true);
      }
      await sendLogs();
      process.exit(1);
    });
}
