import axios from 'axios';
import fs from 'fs';
import { parse } from 'node-html-parser';
import { Redemption } from './models/Redemption';

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

  const redemptions: Redemption[] = redemptionTablesInfo.map((redemptionInfo) =>
    Redemption.create({
      ...redemptionInfo,
      redemptionEndDate,
    }),
  );

  fs.writeFileSync('./redemptions.json', JSON.stringify(redemptions, null, 4));
}

if (require.main === module) {
  run()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
