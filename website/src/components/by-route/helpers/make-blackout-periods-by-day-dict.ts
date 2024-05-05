import {
  addDays,
  areIntervalsOverlapping,
  getDaysInMonth,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfMonth as startOfMonthFn,
} from 'date-fns';
import { RouteDetailDatum } from './make-route-details-list';
import { flightClassCodeOrder } from '@/components/common/flight-class-code-to-name';
import { BlackoutPeriod } from '@/index';

type BlackoutPeriodWithMetadata = {
  from: string;
  to: string;
  flightNos: string[]; // always defined here now as it's either all flights or a subset
  flightClass: string;
};

export type BlackoutPeriodsByDayBaseDict = Record<
  string,
  Array<BlackoutPeriodWithMetadata>
>;
export type BlackoutPeriodsByDayDict = Record<
  string,
  Array<BlackoutPeriodWithMetadata>
  // Array<BlackoutPeriodWithMetadata & { renderLevel: number }>
>;

/**
 * Creates a dict mapping the list of days for the input month to the list of blackout periods.
 */
export function makeBlackoutPeriodsByDayDict(
  redemptions: RouteDetailDatum[],
  date: Date,
): BlackoutPeriodsByDayDict {
  const dateStrings = getDateStringsList(date);

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

  // then construct a mapping of day to blackout periods on that day
  const blackoutPeriodsByDayBaseDict = dateStrings.reduce(
    (
      _blackoutPeriodsByDayBaseDict: BlackoutPeriodsByDayBaseDict,
      dateString,
    ) => {
      _blackoutPeriodsByDayBaseDict[dateString.split('-')[2]] =
        allBlackoutPeriods.filter((period) =>
          isBlackoutPeriodOverlappingDate(period, dateString),
        );
      return _blackoutPeriodsByDayBaseDict;
    },
    {},
  );

  return blackoutPeriodsByDayBaseDict;
}

/**
 * Returns a list of date strings in YYYY-MM-DD format for all dates present in the input month.
 */
function getDateStringsList(date: Date): string[] {
  const startOfMonth = startOfMonthFn(date);
  const daysInMonth = getDaysInMonth(date);

  let dateStrings: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = addDays(startOfMonth, i);
    dateStrings.push(currDate.toISOString().split('T')[0]);
  }

  return dateStrings;
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
