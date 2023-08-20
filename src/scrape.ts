import axios from 'axios';
import fs from 'fs';
import { HTMLElement, parse } from 'node-html-parser';
import { escapeCharacters } from './lib/telegram/helpers';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';
import { parseRedemptionEndDate } from './parsers/parseRedemptionEndDate';
import { parseRedemptionTables } from './parsers/parseRedemptionTables';
import { parseRedemptionTravelPeriod } from './parsers/parseRedemptionTravelPeriod';
import { dateInYYYYMM, toDateISO8601, datePrefix } from './utils';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannel,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './utils/sender';
import { TimePeriod } from './utils/types';
import { analyse } from './analyse';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

// env var configs
const htmlFilepath = process.env['HTML_FILEPATH'];
const shouldRunPostAnalysis = !!process.env['RUN_POST_ANALYSIS'];
const isBasicRun = !!process.env['BASIC_RUN'];

export async function scrape() {
  const { html, isNewHtml } = await loadHtml();

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
    saveFilesToLocal({
      html: isNewHtml ? html : undefined,
      redemptions,
      redemptionTravelPeriod,
    });
    return;
  }

  // check saved data
  const doesRedemptionPeriodExist = await RedemptionPeriod.exists(
    toDateISO8601(redemptionEndDate),
  );
  const redemptionsSavedForPeriod = doesRedemptionPeriodExist
    ? (await Redemption.query(toDateISO8601(redemptionEndDate))) ?? []
    : [];

  // compare latest and saved redemptions info
  const newRedemptions = compareRedemptions(
    redemptions,
    redemptionsSavedForPeriod,
  );

  if (doesRedemptionPeriodExist && newRedemptions.length === 0) {
    // no changes, return early
    // TODO: only for debugging, to remove
    await sendMessageToChannel(
      escapeCharacters(`${datePrefix()} 🚫 No changes`),
    );
    return;
  }

  // data has changed, so we save the new files
  saveFilesToLocal({
    html: isNewHtml ? html : undefined,
    redemptions,
    redemptionTravelPeriod,
  });

  if (!doesRedemptionPeriodExist) {
    console.log(`Redemption period "${redemptionEndDate}" does not exist`);
    await RedemptionPeriod.upload({
      redemptionEndDate,
      travelPeriod: redemptionTravelPeriod,
    });
    await sendNewRedemptionPeriodNotification();
  } else {
    console.log(`Changes to existing redemption period "${redemptionEndDate}"`);
    await sendExistingRedemptionPeriodChangesNotification();
  }

  await Redemption.upload(newRedemptions);
  await sendRedemptionsInfoNotification({
    redemptions: newRedemptions,
    redemptionEndDate,
    travelPeriod: redemptionTravelPeriod,
  });

  if (shouldRunPostAnalysis) {
    analyse();
  }
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
    const response = await axios.get(SPONTANEOUS_ESCAPES_URL);
    html = parse(response.data);
  }

  return { html, isNewHtml };
}

/**
 * Saves HTML and redemptions JSON to local disk.
 */
function saveFilesToLocal({
  html,
  redemptions,
  redemptionTravelPeriod,
}: {
  html: HTMLElement | undefined;
  redemptions: Redemption[];
  redemptionTravelPeriod: TimePeriod;
}) {
  if (html) {
    fs.writeFileSync(
      `data/${dateInYYYYMM(redemptionTravelPeriod.from)}-content.html`,
      html.toString(),
    );
  }

  fs.writeFileSync(
    `data/${dateInYYYYMM(redemptionTravelPeriod.from)}-redemptions.json`,
    JSON.stringify(redemptions, null, 2),
  );
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
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
