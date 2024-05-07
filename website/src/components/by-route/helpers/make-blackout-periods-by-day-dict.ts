import { flightClassCodeOrder } from '@/components/common/flight-class-code-to-name';
import { BlackoutPeriod } from '@/index';
import { UTCDate } from '@date-fns/utc';
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  getDaysInMonth,
  isAfter,
  isBefore,
  startOfMonth,
} from 'date-fns';
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
  date: Date,
): BlackoutPeriodsByDayDict {
  const dateStringsInMonth = eachDayOfInterval({
    start: new UTCDate(startOfMonth(date)),
    end: new UTCDate(endOfMonth(date)),
  }).map((date) => date.toISOString().split('T')[0]);

  // get list of all blackout periods in the month
  const allBlackoutPeriods = redemptions.reduce(
    (_allBlackoutPeriods: BlackoutPeriodWithMetadata[], redemption) => {
      const blackoutPeriodsForRedemption = redemption.blackoutPeriod.map(
        (period) => ({
          from: period.from,
          to: period.to,
          flightNos: period.flightNos ?? redemption.flightNos,
          flightClass: redemption.flightClass,
        }),
      );
      return [..._allBlackoutPeriods, ...blackoutPeriodsForRedemption];
    },
    [],
  );

  // add render level to all blackout periods
  const allBlackoutPeriodsWithRenderLevel = allBlackoutPeriods.map(
    (period, idx) => ({
      ...period,
      renderLevel: getPeriodRenderLevel(allBlackoutPeriods, idx),
    }),
  );

  // then construct a mapping of day to blackout periods applicable on that day
  const blackoutPeriodsByDayDict = dateStringsInMonth.reduce(
    (_blackoutPeriodsByDayDict: BlackoutPeriodsByDayDict, dateString) => {
      const day = dateString.split('-')[2];
      _blackoutPeriodsByDayDict[day] = allBlackoutPeriodsWithRenderLevel
        .filter((period) => isBlackoutPeriodOverlappingDate(period, dateString))
        .sort((a, b) => a.renderLevel - b.renderLevel);
      return _blackoutPeriodsByDayDict;
    },
    {},
  );

  return blackoutPeriodsByDayDict;
}

/**
 * Returns the render level for the blackout period cell corresponding to the input index of the full blackout periods list.
 *
 * The level will be bumped up if there are other overlapping periods with this blackout period that are:
 * - of a lower flight class
 * - of the same flight class, but with a greater number of flights
 * - of the same flight class and the same number of flights, but with a greater starting flight number
 */
function getPeriodRenderLevel(
  allBlackoutPeriods: BlackoutPeriodWithMetadata[],
  periodIdx: number,
): number {
  const thisPeriod = allBlackoutPeriods[periodIdx];
  const thisPeriodFlightClassidx = flightClassCodeOrder.indexOf(
    thisPeriod.flightClass,
  );
  const thisPeriodBlackoutPeriodDuration = differenceInCalendarDays(
    new Date(thisPeriod.to),
    new Date(thisPeriod.from),
  );
  const otherBlackoutPeriods = allBlackoutPeriods.filter(
    (_, idx) => idx !== periodIdx,
  );

  const datesInPeriod = eachDayOfInterval({
    start: new UTCDate(thisPeriod.from),
    end: new UTCDate(thisPeriod.to),
  });
  const renderLevelsByDateDict = datesInPeriod.reduce(
    (_renderLevelsByDateDict: Record<string, number>, date) => {
      const dateString = date.toISOString().split('T')[0];

      const overlappingBlackoutPeriodsWithDate = otherBlackoutPeriods.filter(
        (period) => isBlackoutPeriodOverlappingDate(period, dateString),
      );
      const blackoutPeriodsAtLowerLevelsOnDate =
        overlappingBlackoutPeriodsWithDate.filter((period) => {
          const periodFlightClassIdx = flightClassCodeOrder.indexOf(
            period.flightClass,
          );
          // lower flight class at a lower level
          if (periodFlightClassIdx < thisPeriodFlightClassidx) {
            return true;
          }
          // higher flight class at a higher level
          if (periodFlightClassIdx > thisPeriodFlightClassidx) {
            return false;
          }

          // same flight class with longer blackout period at a lower level
          if (
            differenceInCalendarDays(
              new Date(period.to),
              new Date(period.from),
            ) > thisPeriodBlackoutPeriodDuration
          ) {
            return true;
          }

          // same flight class + same blackout period duration with greater starting flight number at a lower level
          return period.flightNos[0] < thisPeriod.flightNos[0];
        });

      _renderLevelsByDateDict[dateString] =
        blackoutPeriodsAtLowerLevelsOnDate.length;
      return _renderLevelsByDateDict;
    },
    {},
  );

  return Math.max(...Object.values(renderLevelsByDateDict));
}

/**
 * Returns if the input redemption's blackout period overlaps with the input date.
 */
function isBlackoutPeriodOverlappingDate(
  blackoutPeriod: BlackoutPeriod,
  dateString: string,
) {
  return (
    blackoutPeriod.from === dateString ||
    blackoutPeriod.to === dateString ||
    (isAfter(new Date(dateString), blackoutPeriod.from) &&
      isBefore(new Date(dateString), blackoutPeriod.to))
  );
}
