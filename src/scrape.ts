import fs from 'fs';
import { HTMLElement } from 'node-html-parser';
import { analyse } from './analyse';
import { escapeCharacters } from './lib/telegram/helpers';
import { loadHtml } from './loadHtml';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';
import { parseRedemptionEndDate } from './parsers/parseRedemptionEndDate';
import { parseRedemptionTablesV1 } from './parsers/parseRedemptionTablesV1';
import { parseRedemptionTablesV2 } from './parsers/parseRedemptionTablesV2';
import { parseRedemptionTablesV3 } from './parsers/parseRedemptionTablesV3';
import { parseRedemptionTravelPeriod } from './parsers/parseRedemptionTravelPeriod';
import { postprocessing } from './postprocessing';
import { updateDataFiles } from './updateDataFiles';
import { dateInYYYYMM, datePrefix } from './utils';
import { getCurrentMonth } from './utils/getCurrentMonth';
import { log, sendLogs, clearParserErrors, commitParserErrors } from './utils/log';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannels,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './utils/sender';

// env var configs
process.env.TZ = 'UTC';
const shouldUseAws = !!process.env['USE_AWS'];
const htmlFilepath = process.env['HTML_FILEPATH'];
const isBasicRun = !!process.env['BASIC_RUN'];
const shouldSendRedemptionsChangeNotificationToProd =
  !!process.env['SEND_REDEMPTIONS_CHANGE_NOTIFICATION'];

export async function scrape(): Promise<{ shouldSendLogs: boolean }> {
  let html: HTMLElement | undefined;
  let isNewHtml: boolean;
  const isOverrideHtml = !!htmlFilepath && htmlFilepath.includes('override');

  try {
    const loadHtmlResult = await loadHtml({ htmlFilepath });
    html = loadHtmlResult.html;
    isNewHtml = loadHtmlResult.isNewHtml;
  } catch (err) {
    const errorMessage =
      err instanceof Error && 'message' in err ? err.message : 'Unknown error';
    await sendMessageToChannels({
      message: escapeCharacters(`${datePrefix()} 🔥 ${errorMessage}`),
      shouldSendToProdChannel: false,
    });
    return { shouldSendLogs: true };
  }

  // extract the latest info from the page first
  const redemptionTablesInfo =
    parseRedemptionTablesV1(html) ?? parseRedemptionTablesV2(html) ?? parseRedemptionTablesV3(html);
  if (!redemptionTablesInfo) {
    // All parsers failed, commit the accumulated parser errors to the main log
    commitParserErrors();
    await sendMessageToChannels({
      message: escapeCharacters(
        `${datePrefix()} 🔥 Unable to scrape any redemptions data`,
      ),
      shouldSendToProdChannel: false,
    });
    return { shouldSendLogs: true };
  }

  // Reset parser errors after successful parsing
  clearParserErrors();

  const currentMonth = getCurrentMonth(redemptionTablesInfo);
  const redemptionEndDate = parseRedemptionEndDate(html, currentMonth);
  const redemptionTravelPeriod = parseRedemptionTravelPeriod(
    html,
    currentMonth,
  );
  const redemptionMonth = dateInYYYYMM(redemptionTravelPeriod.from);
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
      redemptionMonth,
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
      `Redemption period "${redemptionTravelPeriod.from.toISOString().split('T')[0]
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
      `Changes to existing redemption period "${redemptionTravelPeriod.from.toISOString().split('T')[0]
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
    redemptionMonth,
  });
  await postScrape({ redemptionMonth, isNewRelease });

  return { shouldSendLogs: true };
}

async function postScrape({ redemptionMonth, isNewRelease }: { redemptionMonth: string, isNewRelease: boolean }) {
  postprocessing();
  analyse();
  await updateDataFiles({ redemptionMonth, isNewRelease });

}

/**
 * Saves HTML and redemptions JSON to /data folder on local disk.
 */
function saveDataFiles({
  html,
  isOverrideHtml,
  redemptions,
  redemptionMonth,
}: {
  html: HTMLElement | undefined;
  isOverrideHtml: boolean;
  redemptions: Redemption[];
  redemptionMonth: string;
}) {
  if (html) {
    const htmlFilename = `data/${redemptionMonth}-content.html`;
    log(`📄 Writing to ${htmlFilename}`);
    fs.writeFileSync(htmlFilename, html.toString());
  }

  const redemptionsFilename = `data/${redemptionMonth}-redemptions${isOverrideHtml ? '-override' : ''
    }.json`;
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

(async () => {
  if (require.main === module) {
    const args = process.argv.slice(2);

    // By default, run scrape fn
    if (args.length === 0) {
      try {
        await scrape();
        // always send logs when running this file directly, regardless of returned shouldSendLogs prop from scrape fn
        await sendLogs();
        process.exit(0);
      } catch (err) {
        if (err instanceof Error) {
          log(err.message, true);
        }
        await sendLogs();
        process.exit(1);
      }
    } else {
      // Else, run postscrape fn if the number of args is correct
      if (args.length !== 3) {
        throw new Error(
          'Usage: run:postscrape postscrape <redemptionMonth> <isNewRelease> (e.g. run:postscrape postscrape 202506 true)',
        );
      }
      await postScrape({ redemptionMonth: args[1], isNewRelease: args[2] === 'true' });
    }
  }
})();
