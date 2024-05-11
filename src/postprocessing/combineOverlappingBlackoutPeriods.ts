import {
  addMilliseconds,
  areIntervalsOverlapping,
  endOfDay,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import { BlackoutPeriod, RedemptionJson } from '../utils/types';

/**
 * There may be overlapping blackout periods if the redemptions list was merged with a base set.
 *
 * This function combines overlapping periods together for a more accurate representation.
 * Only periods with the same flightNos field are combined.
 */
export function combineOverlappingBlackoutPeriods(
  redemptions: Array<
    Omit<RedemptionJson, 'flightNo'> & { flightNos: string[] }
  >,
): Array<Omit<RedemptionJson, 'flightNo'> & { flightNos: string[] }> {
  return redemptions.map((redemption) => {
    const blackoutPeriodsCombined: BlackoutPeriod[] = [];

    // sort periods first to ensure that the overlapping check works correctly
    const blackoutPeriodsSorted = sortBlackoutPeriods(
      redemption.blackoutPeriod,
    );
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

    return {
      ...redemption,
      blackoutPeriod: sortBlackoutPeriods(blackoutPeriodsCombined),
    };
  });
}

function sortBlackoutPeriods(blackoutPeriods: BlackoutPeriod[]) {
  return [...blackoutPeriods].sort((a, b) => {
    if (a.from !== b.from) {
      return a.from < b.from ? -1 : 1;
    }
    return a.to < b.to ? -1 : 1;
  });
}
