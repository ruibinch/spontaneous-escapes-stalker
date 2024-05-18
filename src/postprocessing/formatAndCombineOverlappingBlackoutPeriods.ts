import {
  addMilliseconds,
  areIntervalsOverlapping,
  endOfDay,
  isAfter,
  isBefore,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import { BlackoutPeriod } from '../utils/types';
import { RedemptionJsonWithFlightNos } from './formatFlightNosField';

/**
 * Performs 2 postprocessing steps:
 *
 * 1. Formats the blackout periods list to have the correct date
 *
 * Some periods have dates in the incorrect year as they are defined incorrectly on the SIA site
 *
 * 2. Combines overlapping blackout periods
 *
 * There may be overlapping blackout periods if the redemptions list was merged with a base set.
 *
 * This function combines overlapping periods together for a more accurate representation.
 * Only periods with the same flightNos field are combined.
 *
 * Also removes blackout periods where both from/to are outside of the current month.
 */
export function formatAndCombineOverlappingBlackoutPeriods({
  redemptions,
  month,
}: {
  redemptions: RedemptionJsonWithFlightNos[];
  month: string;
}): RedemptionJsonWithFlightNos[] {
  const monthDate = new Date(`${month.slice(0, 4)}-${month.slice(4, 6)}-01`);

  return redemptions.map((redemption) => {
    const blackoutPeriodsFormatted: BlackoutPeriod[] = formatBlackoutPeriods(
      redemption.blackoutPeriod,
      monthDate,
    );

    const blackoutPeriodsCombined: BlackoutPeriod[] = combineBlackoutPeriods(
      blackoutPeriodsFormatted,
    );

    const blackoutPeriodsFiltered = blackoutPeriodsCombined.filter(
      (period) =>
        isSameMonth(new Date(period.from), monthDate) ||
        isSameMonth(new Date(period.to), monthDate),
    );

    return {
      ...redemption,
      blackoutPeriod: blackoutPeriodsFiltered,
    };
  });
}

function formatBlackoutPeriods(
  blackoutPeriods: BlackoutPeriod[],
  monthDate: Date,
) {
  const isSameMonthButDifferentYear = (d1: Date, d2: Date) =>
    d1.getMonth() === d2.getMonth() && d1.getFullYear() !== d2.getFullYear();

  return blackoutPeriods.map((period) => {
    const from = new Date(period.from);
    const to = new Date(period.to);

    if (isSameMonthButDifferentYear(new Date(period.from), monthDate)) {
      from.setFullYear(monthDate.getFullYear());
      to.setFullYear(monthDate.getFullYear());
    }

    return {
      ...period,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  });
}

function combineBlackoutPeriods(
  blackoutPeriods: BlackoutPeriod[],
): BlackoutPeriod[] {
  const blackoutPeriodsCombined: BlackoutPeriod[] = [];

  // sort periods first to ensure that the overlapping check works correctly
  const blackoutPeriodsSorted = [...blackoutPeriods].sort((a, b) => {
    if (a.from !== b.from) {
      return a.from < b.from ? -1 : 1;
    }
    return a.to < b.to ? -1 : 1;
  });

  blackoutPeriodsSorted.forEach((thisPeriod) => {
    const overlappingPeriodIndex = blackoutPeriodsCombined.findIndex(
      (period) => {
        // flightNos have been sorted in the formatFlightNosField postprocessing step
        const isFlightNosIdentical =
          period.flightNos?.join(',') === thisPeriod.flightNos?.join(',');

        let isThisPeriodOverlapping = false;
        try {
          // startOfDay/endOfDay fns are required to handle 1-day periods
          isThisPeriodOverlapping = areIntervalsOverlapping(
            {
              start: startOfDay(new Date(period.from)),
              // add 1ms so that continguous periods will also be considered overlapping, e.g. 01-01 to 01-02, and 01-02 to 01-03
              end: addMilliseconds(endOfDay(new Date(period.to)), 1),
            },
            {
              start: startOfDay(new Date(thisPeriod.from)),
              end: endOfDay(new Date(thisPeriod.to)),
            },
            { inclusive: true },
          );
        } catch (err) {
          console.error(
            `Error comparing periods: ${period.from}-${period.to} and ${thisPeriod.from}-${thisPeriod.to}`,
          );
        }

        return isFlightNosIdentical && isThisPeriodOverlapping;
      },
    );
    if (overlappingPeriodIndex === -1) {
      blackoutPeriodsCombined.push(thisPeriod);
      return;
    }

    const overlappingPeriod = blackoutPeriodsCombined[overlappingPeriodIndex];
    const fromCombined = isBefore(
      new Date(overlappingPeriod.from),
      new Date(thisPeriod.from),
    )
      ? overlappingPeriod.from
      : thisPeriod.from;
    const toCombined = isAfter(
      new Date(overlappingPeriod.to),
      new Date(thisPeriod.to),
    )
      ? overlappingPeriod.to
      : thisPeriod.to;

    const blackoutPeriodCombined: BlackoutPeriod = {
      from: fromCombined,
      to: toCombined,
      ...(thisPeriod.flightNos && { flightNos: thisPeriod.flightNos }),
    };
    blackoutPeriodsCombined.splice(
      overlappingPeriodIndex,
      1,
      blackoutPeriodCombined,
    );
  });

  return blackoutPeriodsCombined;
}
