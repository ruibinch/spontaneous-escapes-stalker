import fs from 'fs';
import {
  FlightClass,
  RedemptionJsonPostprocessed,
  Region,
} from '../utils/types';
import { FlightClassCode } from './types';
import { OagDataAnalysisEntry } from '../scripts/generateOagData';

const PRINT_ROUTES_NOT_AVAILABLE_FOR_REDEMPTION_IN_MONTHS: string[] = [];
const PRINT_PERCENTAGE_OF_ROUTES_AVAILABLE_FOR_REDEMPTION =
  process.env['PRINT_PERCENTAGE_OF_ROUTES_AVAILABLE_FOR_REDEMPTION'] ?? false;

export type MonthSummaryAnalysisEntry = {
  month: string;
  count: number;
  byUniqueRoutes: {
    availableForRedemption: {
      total: number;
      sia: number;
    };
    routeNetworkSize: {
      total?: number | undefined;
      sia?: number | undefined;
    };
  };
  byFlightClass: Record<FlightClassCode, number>;
  byRegion: Record<Region, number>;
};

export function generateMonthSummaryAnalysis({
  redemptions,
  months,
  oagDataAnalysis,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  months: string[];
  oagDataAnalysis: OagDataAnalysisEntry[];
}) {
  const result: MonthSummaryAnalysisEntry[] = [];

  months.forEach((month) => {
    const redemptionsForMonth = redemptions.filter(
      (redemption) => redemption.redemptionMonth === month,
    );

    const routesSet = new Set<string>();
    const routesWithOnlySiaRedemptionsSet = new Set<string>();
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

    redemptionsForMonth.forEach(
      ({ originIata, destinationIata, flightClass, region, flightNos }) => {
        const routeIata = `${originIata}-${destinationIata}`;
        routesSet.add(routeIata);
        if (flightNos.every((flightNo) => flightNo.startsWith('SQ'))) {
          routesWithOnlySiaRedemptionsSet.add(routeIata);
        }

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
      },
    );

    const oagDataAnalysisEntryForMonth = oagDataAnalysis.find(
      (entry) => entry.month === month,
    );
    printRoutesNotAvailableForRedemption({
      month,
      oagDataAnalysisEntryForMonth,
      routes: routesSet,
    });

    const siaAndSilkairRouteNetworkSize =
      oagDataAnalysisEntryForMonth?.routes.length;
    const siaOnlyRouteNetworkSize = oagDataAnalysisEntryForMonth?.routes.filter(
      (routeEntry) => {
        const hasOnlySiaFlightsForRoute = routeEntry.flightNos.every(
          ({ flightNo }) => flightNo.startsWith('SQ'),
        );
        return hasOnlySiaFlightsForRoute;
      },
    ).length;

    result.push({
      month,
      count: redemptionsForMonth.length,
      byUniqueRoutes: {
        availableForRedemption: {
          total: routesSet.size,
          sia: routesWithOnlySiaRedemptionsSet.size,
        },
        routeNetworkSize: {
          total: siaAndSilkairRouteNetworkSize,
          sia: siaOnlyRouteNetworkSize,
        },
      },
      byFlightClass: {
        Y: economyClassCount,
        W: premiumEconomyClassCount,
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

  printPercentageOfRoutesAvailableForRedemption(result);
  return result;
}

function printRoutesNotAvailableForRedemption({
  month,
  oagDataAnalysisEntryForMonth,
  routes,
}: {
  month: string;
  oagDataAnalysisEntryForMonth: OagDataAnalysisEntry | undefined;
  routes: Set<String>;
}) {
  if (PRINT_ROUTES_NOT_AVAILABLE_FOR_REDEMPTION_IN_MONTHS.includes(month)) {
    const routesNotAvailableForRedemption = oagDataAnalysisEntryForMonth?.routes
      .filter(({ route }) => !routes.has(route))
      .map(({ route }) => route);
    console.log(
      `Routes not for redemption in ${month}: ${routesNotAvailableForRedemption?.join(
        ', ',
      )}`,
    );
  }
}

function printPercentageOfRoutesAvailableForRedemption(
  result: MonthSummaryAnalysisEntry[],
) {
  if (!PRINT_PERCENTAGE_OF_ROUTES_AVAILABLE_FOR_REDEMPTION) return;

  result.map(
    ({
      month,
      byUniqueRoutes: { routeNetworkSize, availableForRedemption },
    }) => {
      console.log(
        `${month}: ${availableForRedemption}/${routeNetworkSize.total} = ${(
          (availableForRedemption.total / (routeNetworkSize.total ?? 1)) *
          100
        ).toFixed(2)}%`,
      );
    },
  );
}
