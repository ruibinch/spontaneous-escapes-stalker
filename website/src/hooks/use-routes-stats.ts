import { notEmpty } from '@/common/not-empty';
import { roundToDp } from '@/common/round-to-dp';
import { RouteAnalysisEntry } from '@/index';
import { useMemo } from 'react';

export interface RoutesStats {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  numRedemptions: number;
  numMonths: number;
  averageBlackoutPct: number;
  numRedemptionsRank: number;
  numMonthsRank: number;
  averageBlackoutPctRank: number;
  isNumRedemptionsRankShared: boolean;
  isNumMonthsRankShared: boolean;
  isAverageBlackoutPctRankShared: boolean;
}

export const useRoutesStats = (
  routeAnalysisList: RouteAnalysisEntry[],
): RoutesStats[] => {
  return useMemo(
    () => calculateRoutesStats(routeAnalysisList),
    [routeAnalysisList],
  );
};

const calculateRoutesStats = (routeAnalysisList: RouteAnalysisEntry[]) => {
  console.log('[calculateRoutesStats] running');
  const routesStats = routeAnalysisList
    .map((entry) => {
      let numRedemptions = 0;
      let numMonths = 0;
      let averageBlackoutPctSumAcrossMonths = 0;

      entry.details.forEach(({ redemptionDetails }) => {
        const numRedemptionsInMonth =
          Object.values(redemptionDetails).filter(Boolean).length;
        numRedemptions += numRedemptionsInMonth;
        if (numRedemptionsInMonth > 0) {
          numMonths += 1;
        }

        const blackoutPctSumForMonth =
          (redemptionDetails.Y?.blackoutPct ?? 0) +
          (redemptionDetails.W?.blackoutPct ?? 0) +
          (redemptionDetails.J?.blackoutPct ?? 0);
        const averageBlackoutPctForMonth =
          numRedemptionsInMonth > 0
            ? blackoutPctSumForMonth / numRedemptionsInMonth
            : 0;
        averageBlackoutPctSumAcrossMonths += averageBlackoutPctForMonth;
      });

      if (numRedemptions === 0 && numMonths === 0) {
        return null;
      }

      const averageBlackoutPct =
        averageBlackoutPctSumAcrossMonths > 0 && numMonths > 0
          ? roundToDp(averageBlackoutPctSumAcrossMonths / numMonths, 1)
          : 0;

      return {
        origin: entry.origin,
        originIata: entry.originIata,
        destination: entry.destination,
        destinationIata: entry.destinationIata,
        numRedemptions,
        numMonths,
        averageBlackoutPct,
      };
    })
    .filter(notEmpty);

  const numRedemptionsList = routesStats
    .map((stats) => stats.numRedemptions)
    .sort((a, b) => b - a);
  const numMonthsList = routesStats
    .map((stats) => stats.numMonths)
    .sort((a, b) => b - a);
  const averageBlackoutPctList = routesStats
    .map((stats) => stats.averageBlackoutPct)
    .sort((a, b) => b - a);

  return routesStats.map((stats) => ({
    ...stats,
    numRedemptionsRank: getRank(numRedemptionsList, stats.numRedemptions),
    numMonthsRank: getRank(numMonthsList, stats.numMonths),
    averageBlackoutPctRank: getRank(
      averageBlackoutPctList,
      stats.averageBlackoutPct,
    ),
    isNumRedemptionsRankShared: getIsRankShared(
      numRedemptionsList,
      stats.numRedemptions,
    ),
    isNumMonthsRankShared: getIsRankShared(numMonthsList, stats.numMonths),
    isAverageBlackoutPctRankShared: getIsRankShared(
      averageBlackoutPctList,
      stats.averageBlackoutPct,
    ),
  }));
};

const getRank = (list: number[], value: number) => list.indexOf(value) + 1;

const getIsRankShared = (list: number[], value: number) =>
  list.filter((v) => v === value).length > 1;
