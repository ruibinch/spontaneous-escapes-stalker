import axios from 'axios';
import { parse } from 'node-html-parser';
import { Redemption } from './models/Redemption';
import { RedemptionPeriod } from './models/RedemptionPeriod';

import { parseRedemptionTables } from './parseRedemptionTables';
import {
  parseRedemptionEndDate,
  parseRedemptionTravelPeriod,
} from './parseRedemptionTerms';

process.env.TZ = 'UTC';

const SPONTANEOUS_ESCAPES_URL =
  'https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/';

async function run() {
  const result = await axios.get(SPONTANEOUS_ESCAPES_URL);
  const root = parse(result.data);

  const redemptionTablesInfo = parseRedemptionTables(root);
  const redemptionEndDate = parseRedemptionEndDate(root);
  const redemptionTravelPeriod = parseRedemptionTravelPeriod(root);

  const redemptions = redemptionTablesInfo.map((redemptionInfo) =>
    Redemption.create({
      ...redemptionInfo,
      redemptionEndDate,
    }),
  );
  const redemptionPeriod = RedemptionPeriod.create({
    redemptionEndDate,
    travelPeriod: redemptionTravelPeriod,
  });

  await RedemptionPeriod.upload(redemptionPeriod);

  // fs.writeFileSync('./redemptions.json', JSON.stringify(redemptions, null, 4));
  await Redemption.upload(redemptions);

  // const redemptionsJson = fs.readFileSync('./redemptions.json').toString();
  // await Redemption.upload(JSON.parse(redemptionsJson));
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
