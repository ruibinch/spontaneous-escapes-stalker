import axios from 'axios';
import fs from 'fs';
import { parse } from 'node-html-parser';
import { escapeCharacters } from './lib/telegram/helpers';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';

import { parseRedemptionTables } from './parseRedemptionTables';
import {
  parseRedemptionEndDate,
  parseRedemptionTravelPeriod,
} from './parseRedemptionTerms';
import {
  sendExistingRedemptionPeriodChangesNotification,
  sendMessageToChannel,
  sendNewRedemptionPeriodNotification,
  sendRedemptionsInfoNotification,
} from './sender';
import { currentDateInYYYYMMDD, toDateISO8601 } from './utils';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

async function run() {
  const result = await axios.get(SPONTANEOUS_ESCAPES_URL);
  const root = parse(result.data);

  // extract the latest info from the page first
  const redemptionTablesInfo = parseRedemptionTables(root);
  const redemptionEndDate = parseRedemptionEndDate(root);
  const redemptionTravelPeriod = parseRedemptionTravelPeriod(root);
  const redemptions = redemptionTablesInfo.map((redemptionInfo) =>
    Redemption.create({
      ...redemptionInfo,
      redemptionEndDate,
    }),
  );

  if (process.env['LOCAL_RUN']) {
    fs.writeFileSync(
      `./${currentDateInYYYYMMDD()}-redemptions.json`,
      JSON.stringify(redemptions, null, 4),
    );
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
  await sendRedemptionsInfoNotification(newRedemptions);
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
