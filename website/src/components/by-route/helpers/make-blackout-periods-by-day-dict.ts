import { flightClassCodeOrder } from '@/components/common/flight-class-code-to-name';
import { UTCDate } from '@date-fns/utc';
import { eachDayOfInterval } from 'date-fns';
import { RouteDetailDatum } from './make-route-details-list';

type BlackoutPeriodWithMetadata = {
  from: string;
  to: string;
  flightNos: string[]; // always defined here now as it's either all flights or a subset
  flightClass: string;
};

export type BlackoutPeriodsByDayDict = Record<
  string,
  Array<BlackoutPeriodWithMetadata & { renderLevel: number }>
>;

/**
 * Creates a dict mapping the list of days for the input month to the list of blackout periods.
 */
export function makeBlackoutPeriodsByDayDict(
  redemptions: RouteDetailDatum[],
): BlackoutPeriodsByDayDict {
  // get sorted list of all blackout periods in the month
  const allBlackoutPeriods = redemptions
    .reduce((_allBlackoutPeriods: BlackoutPeriodWithMetadata[], redemption) => {
      const blackoutPeriodsForRedemption = redemption.blackoutPeriod.map(
        (period) => ({
          from: period.from,
          to: period.to,
          flightNos: period.flightNos ?? redemption.flightNos,
          flightClass: redemption.flightClass,
        }),
      );
      return [..._allBlackoutPeriods, ...blackoutPeriodsForRedemption];
    }, [])
    .sort((a, b) => {
      // sort by flightClassOrder first
      const aFlightClassIdx = flightClassCodeOrder.indexOf(a.flightClass);
      const bFlightClassIdx = flightClassCodeOrder.indexOf(b.flightClass);
      if (aFlightClassIdx !== bFlightClassIdx) {
        return aFlightClassIdx - bFlightClassIdx;
      }

      // then sort by starting flight number
      return a.flightNos[0] < b.flightNos[0] ? -1 : 1;
    });

  const blackoutPeriodsByDayDict: BlackoutPeriodsByDayDict = {};
  const dateToDayString = (date: Date) =>
    date.toISOString().split('T')[0].split('-')[2];

  allBlackoutPeriods.forEach((period) => {
    const datesInPeriod = eachDayOfInterval({
      start: new UTCDate(period.from),
      end: new UTCDate(period.to),
    });
    // first iteration through the dates list is to get the max render level for the period across all dates
    const periodRenderLevelForDates = datesInPeriod.map((date) => {
      const dayString = dateToDayString(date);
      // no existing periods on that day, so render at level 0
      if (!blackoutPeriodsByDayDict[dayString]) {
        return 0;
      }

      // else render 1 level higher than the current max render level on that day
      const existingRenderLevelsForDate = blackoutPeriodsByDayDict[
        dayString
      ].map((period) => period.renderLevel);
      return Math.max(...existingRenderLevelsForDate) + 1;
    });
    const maxPeriodRenderLevel = Math.max(...periodRenderLevelForDates);

    // second iteration through the dates list is to add the period entry to the dict
    datesInPeriod.forEach((date) => {
      const dayString = dateToDayString(date);
      blackoutPeriodsByDayDict[dayString] = [
        ...(blackoutPeriodsByDayDict[dayString] ?? []),
        {
          ...period,
          renderLevel: maxPeriodRenderLevel,
        },
      ];
    });
  });

  return blackoutPeriodsByDayDict;
}
