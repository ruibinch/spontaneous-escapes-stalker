import { RedemptionInfoForMonth, SingleRedemptionInfo } from '@/index';

export type RouteHistoryDatum = SingleRedemptionInfo & {
  flightClass: string;
  month: string;
};

const flightClassCodeMap: Record<string, string> = {
  Y: 'Economy',
  PY: 'Premium Economy',
  J: 'Business',
};
const flightClassCodes = Object.keys(flightClassCodeMap);

export function makeRouteHistoryData(data: RedemptionInfoForMonth[]) {
  const historyData: RouteHistoryDatum[] = [];

  data.forEach((d) => {
    flightClassCodes.forEach((flightClassCode) => {
      // @ts-expect-error flightClassCode is Y/PY/J
      const redemptionInfoForFlightClass = d[
        flightClassCode
      ] as SingleRedemptionInfo | null;

      if (redemptionInfoForFlightClass) {
        historyData.push({
          month: d.month,
          flightClass: flightClassCodeMap[flightClassCode],
          ...redemptionInfoForFlightClass,
        });
      }
    });
  });

  // sort by latest month first
  return [...historyData].sort((a, b) => b.month.localeCompare(a.month));
}
