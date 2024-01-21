import fs from 'fs';
import path from 'path';

import { FlightClassCode, Route } from './types';
import { Redemption } from '../models/Redemption';
import { FlightClass, Region } from '../utils/types';

type MonthSummaryAnalysis = Record<
  Route,
  {
    flightClass: Record<FlightClassCode, number>;
    region: Record<Region, number>;
  }
>;

export function generateMonthSummaryAnalysis(redemptionsFilenames: string[]) {
  const result: MonthSummaryAnalysis = {};

  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsString = fs.readFileSync(filepath).toString();
    const redemptions = JSON.parse(redemptionsString) as Redemption[];

    // flightClass
    let economyClassCount = 0;
    let premiumEconomyClassCount = 0;
    let businessClassCount = 0;
    // region
    let southEastAsiaRegionCount = 0;
    let northAsiaRegionCount = 0;
    let southAsiaRegionCount = 0;
    let middleEastAndAfricaRegionCount = 0;
    let southwestPacificRegionCount = 0;
    let europeRegionCount = 0;
    let usaRegionCount = 0;

    redemptions.forEach(({ flightClass, region }) => {
      switch (flightClass) {
        case FlightClass.ECONOMY:
          economyClassCount += 1;
          break;
        case FlightClass.PREMIUM_ECONOMY:
          premiumEconomyClassCount += 1;
          break;
        case FlightClass.BUSINESS:
          businessClassCount += 1;
          break;
        default:
          break;
      }

      switch (region) {
        case Region.SOUTH_EAST_ASIA:
          southEastAsiaRegionCount += 1;
          break;
        case Region.NORTH_ASIA:
          northAsiaRegionCount += 1;
          break;
        case Region.SOUTH_ASIA:
          southAsiaRegionCount += 1;
          break;
        case Region.MIDDLE_EAST_AND_AFRICA:
          middleEastAndAfricaRegionCount += 1;
          break;
        case Region.SOUTHWEST_PACIFIC:
          southwestPacificRegionCount += 1;
          break;
        case Region.EUROPE:
          europeRegionCount += 1;
          break;
        case Region.USA:
          usaRegionCount += 1;
          break;
        default:
          break;
      }
    });

    result[month] = {
      flightClass: {
        Y: economyClassCount,
        PY: premiumEconomyClassCount,
        J: businessClassCount,
      },
      region: {
        'South East Asia': southEastAsiaRegionCount,
        'North Asia': northAsiaRegionCount,
        'South Asia': southAsiaRegionCount,
        'Middle East & Africa': middleEastAndAfricaRegionCount,
        'Southwest Pacific': southwestPacificRegionCount,
        Europe: europeRegionCount,
        USA: usaRegionCount,
      },
    };
  });

  return result;
}
