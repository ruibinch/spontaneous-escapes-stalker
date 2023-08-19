import axios from 'axios';
import fs from 'fs';
import { HTMLElement, parse } from 'node-html-parser';
import { escapeCharacters } from './lib/telegram/helpers';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';
import { parseRedemptionEndDate } from './parsers/parseRedemptionEndDate';
import { parseRedemptionTables } from './parsers/parseRedemptionTables';
import { parseRedemptionTravelPeriod } from './parsers/parseRedemptionTravelPeriod';
import { dateInYYYYMM, toDateISO8601 } from './utils';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannel,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './utils/sender';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

// env var configs
const isLocalRun = !!process.env['LOCAL_RUN'];
const htmlFilepath = process.env['HTML_FILEPATH'];

/**
 * Fetches the latest HTML conent from the webpage, or loads a local HTML file specified by the HTML_FILEPATH env var.
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

async function run() {
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

  if (isNewHtml) {
    // save new HTML pages for reference
    fs.writeFileSync(
      `data/${dateInYYYYMM(redemptionTravelPeriod.from)}-content.html`,
      html.toString(),
    );

    fs.writeFileSync(
      `data/${dateInYYYYMM(redemptionTravelPeriod.from)}-redemptions.json`,
      JSON.stringify(redemptions, null, 2),
    );
  }

  if (isLocalRun) {
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
      escapeCharacters(`[${new Date().toUTCString()}] 🚫 No changes`),
    );
    return;
  }

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

// Lambda handler
export async function pollUpdates() {
  await run();
}

if (require.main === module) {
  run()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}
