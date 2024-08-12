import { notEmpty } from '@/common/not-empty';
import { roundToDp } from '@/common/round-to-dp';
import { RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

interface RoutesStats {
  fromIata: string;
  toIata: string;
  numRedemptions: number;
  numMonths: number;
  averageBlackoutPct: number;
}

export const useRoutesStats = (): RoutesStats[] => {
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
        fromIata: entry.fromIata,
        toIata: entry.toIata,
        numRedemptions,
        numMonths,
        averageBlackoutPct,
      };
    })
    .filter(notEmpty);

  return routesStats;
};
