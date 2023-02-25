import axios from 'axios';
import { parse } from 'node-html-parser';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';

import { parseRedemptionTables } from './parseRedemptionTables';
import {
  parseRedemptionEndDate,
  parseRedemptionTravelPeriod,
} from './parseRedemptionTerms';
import { toDateISO8601 } from './utils';

process.env.TZ = 'UTC';

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

  if (!doesRedemptionPeriodExist) {
    // TODO: flag out on the bot prominently!

    await RedemptionPeriod.upload({
      redemptionEndDate,
      travelPeriod: redemptionTravelPeriod,
    });
  } else {
    if (newRedemptions.length > 0) {
      // TODO: flag out that travel period is the same, but some changes have been made
      // should be a rarer case
    }
  }

  sendNewRedemptions(newRedemptions);

  // TODO: figure out this bit
  await Redemption.upload(newRedemptions);
  // fs.writeFileSync('./redemptions.json', JSON.stringify(redemptions, null, 4));
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

function sendNewRedemptions(redemptions: Redemption[]) {
  // TODO: send to Telegram channel
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
