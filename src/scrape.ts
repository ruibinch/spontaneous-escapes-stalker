import axios, { isAxiosError } from 'axios';
import fs from 'fs';
import { HTMLElement, parse } from 'node-html-parser';
import { analyse } from './analyse';
import { commitDataDiffs } from './lib/git/commitDataDiffs';
import { escapeCharacters } from './lib/telegram/helpers';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';
import { parseRedemptionEndDate } from './parsers/parseRedemptionEndDate';
import { parseRedemptionTables } from './parsers/parseRedemptionTables';
import { parseRedemptionTravelPeriod } from './parsers/parseRedemptionTravelPeriod';
import { postprocessing } from './postprocessing';
import { dateInYYYYMM, datePrefix } from './utils';
import { log, sendLogs } from './utils/log';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannels,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './utils/sender';
import { TimePeriod } from './utils/types';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

// env var configs
process.env.TZ = 'UTC';
const shouldUseAws = !!process.env['USE_AWS'];
const shouldRunPostAnalysis = !!process.env['RUN_POST_ANALYSIS'];
const htmlFilepath = process.env['HTML_FILEPATH'];
const isBasicRun = !!process.env['BASIC_RUN'];

export async function scrape() {
  let html: HTMLElement | undefined;
  let isNewHtml: boolean;

  try {
    const loadHtmlResult = await loadHtml();
    html = loadHtmlResult.html;
    isNewHtml = loadHtmlResult.isNewHtml;
  } catch (err) {
    const errorMessage = isAxiosError(err) ? err.message : 'Unknown error';
    await sendMessageToChannels({
      message: escapeCharacters(`${datePrefix()} 🔥 ${errorMessage}`),
      shouldSendToProdChannel: false,
    });
    return;
  }

  // extract the latest info from the page first
  const redemptionTablesInfo = parseRedemptionTables(html);
  const redemptionEndDate = parseRedemptionEndDate(html);
  const redemptionTravelPeriod = parseRedemptionTravelPeriod(html);
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
      redemptions,
      redemptionTravelPeriod,
    });
    return;
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
    // TODO: only for debugging, to remove
    await sendMessageToChannels({
      message: escapeCharacters(`${datePrefix()} 🚫 No changes`),
      shouldSendToProdChannel: false,
    });
    return;
  }

  if (!doesRedemptionPeriodExist) {
    log(`Redemption period "${redemptionEndDate}" does not exist`);
    if (shouldUseAws) {
      await RedemptionPeriod.upload({
        redemptionEndDate,
        travelPeriod: redemptionTravelPeriod,
      });
    }
    await sendNewRedemptionPeriodNotification();
  } else {
    log(`Changes to existing redemption period "${redemptionEndDate}"`);
    await sendExistingRedemptionPeriodChangesNotification();
  }

  if (shouldUseAws) {
    await Redemption.upload(newRedemptions);
  }
  await sendRedemptionsInfoNotification({
    redemptions: newRedemptions,
    redemptionEndDate,
    travelPeriod: redemptionTravelPeriod,
  });

  // data has changed, so we save the new files
  saveDataFiles({
    html: isNewHtml ? html : undefined,
    redemptions,
    redemptionTravelPeriod,
  });

  if (shouldRunPostAnalysis) {
    postprocessing();
    analyse();
  }

  // commit new HTML/JSON and updated analysis files
  await commitDataDiffs();
}

/**
 * Fetches the latest HTML content from the SE webpage, or loads a local HTML file specified by the HTML_FILEPATH env var.
 */
async function loadHtml() {
  let html: HTMLElement;
  let isNewHtml = true;

  if (htmlFilepath) {
    const htmlFileContent = fs.readFileSync(htmlFilepath).toString();
    html = parse(htmlFileContent);
    isNewHtml = false;
  } else {
    const response = await axios.get(SPONTANEOUS_ESCAPES_URL, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.33.0',
      },
      timeout: 20000,
    });
    html = parse(response.data);
  }

  return { html, isNewHtml };
}

/**
 * Saves HTML and redemptions JSON to /data folder on local disk.
 */
function saveDataFiles({
  html,
  redemptions,
  redemptionTravelPeriod,
}: {
  html: HTMLElement | undefined;
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
  )}-redemptions.json`;
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
