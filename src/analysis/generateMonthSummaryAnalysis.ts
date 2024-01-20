import fs from 'fs';
import path from 'path';

import { FlightClassCode, Route } from './types';
import { Redemption } from '../models/Redemption';
import { FlightClass } from '../utils/types';

type MonthSummaryAnalysis = Record<Route, Record<FlightClassCode, number>>;

export function generateMonthSummaryAnalysis(redemptionsFilenames: string[]) {
  const result: MonthSummaryAnalysis = {};

  // create result dict from data
  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsString = fs.readFileSync(filepath).toString();
    const redemptions = JSON.parse(redemptionsString) as Redemption[];

    let economyRedemptionsCount = 0;
    let premiumEconomyRedemptionsCount = 0;
    let businessRedemptionsCount = 0;

    redemptions.forEach(({ flightClass }) => {
      if (flightClass === FlightClass.ECONOMY) {
        economyRedemptionsCount += 1;
      }
      if (flightClass === FlightClass.PREMIUM_ECONOMY) {
        premiumEconomyRedemptionsCount += 1;
      }
      if (flightClass === FlightClass.BUSINESS) {
        businessRedemptionsCount += 1;
      }
    });

    result[month] = {
      Y: economyRedemptionsCount,
      PY: premiumEconomyRedemptionsCount,
      J: businessRedemptionsCount,
    };
  });

  return result;
}
