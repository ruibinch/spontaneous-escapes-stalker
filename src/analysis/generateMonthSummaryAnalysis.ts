import {
  FlightClass,
  RedemptionJsonPostprocessed,
  Region,
} from '../utils/types';
import { FlightClassCode } from './types';

export type MonthSummaryAnalysisEntry = {
  month: string;
  total: number;
  byFlightClass: Record<FlightClassCode, number>;
  byRegion: Record<Region, number>;
};

export function generateMonthSummaryAnalysis({
  redemptions,
  months,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  months: string[];
}) {
  const result: MonthSummaryAnalysisEntry[] = [];

  months.forEach((month) => {
    const redemptionsForMonth = redemptions.filter(
      (redemption) => redemption.redemptionMonth === month,
    );

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
    let northAmericaRegionCount = 0;

    redemptionsForMonth.forEach(({ flightClass, region }) => {
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
        case Region.NORTH_AMERICA:
          northAmericaRegionCount += 1;
          break;
        default:
          break;
      }
    });

    result.push({
      month,
      total: redemptionsForMonth.length,
      byFlightClass: {
        Y: economyClassCount,
        PY: premiumEconomyClassCount,
        J: businessClassCount,
      },
      byRegion: {
        'South East Asia': southEastAsiaRegionCount,
        'North Asia': northAsiaRegionCount,
        'South Asia': southAsiaRegionCount,
        'Middle East & Africa': middleEastAndAfricaRegionCount,
        'Southwest Pacific': southwestPacificRegionCount,
        Europe: europeRegionCount,
        'North America': northAmericaRegionCount,
      },
    });
  });

  return result;
}
