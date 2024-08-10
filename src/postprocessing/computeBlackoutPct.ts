import {
  differenceInCalendarDays,
  endOfMonth,
  getDaysInMonth,
  max,
  min,
  startOfMonth,
} from 'date-fns';
import { RedemptionJsonWithFlightNos } from './formatFlightNosField';

export type RedemptionJsonWithFlightNosAndBlackoutPct =
  RedemptionJsonWithFlightNos & {
    blackoutPct: number;
  };

/**
 * Computes the blackout percentage for each redemption.
 * - numerator = total number of blackout days for all flights
 * - denominator = total number of days in the month for all flights
 *
 * This is not a perfect calculation as it assumes that all flights have the same number of seats.
 * But it is as good of a proxy as we can get.
 */
export function computeBlackoutPct({
  redemptions,
  month,
}: {
  redemptions: RedemptionJsonWithFlightNos[];
  month: string;
}): RedemptionJsonWithFlightNosAndBlackoutPct[] {
  const monthDate = new Date(`${month.slice(0, 4)}-${month.slice(4, 6)}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return redemptions.map((redemption) => {
    if (redemption.blackoutPeriod.length === 0) {
      return {
        ...redemption,
        blackoutPct: 0,
      };
    }

    const numDaysInMonth = getDaysInMonth(
      new Date(redemption.blackoutPeriod[0].from),
    );
    const numFlights = redemption.flightNos.length;
    const totalDaysForFlights = numDaysInMonth * numFlights;

    const blackoutDays = redemption.blackoutPeriod.reduce(
      (_blackoutDays, period) => {
        // min/max is required as blackout periods can span to the previous/next month
        const numDaysInBlackoutPeriod =
          differenceInCalendarDays(
            min([monthEnd, new Date(period.to)]),
            max([monthStart, new Date(period.from)]),
          ) + 1;
        if (numDaysInBlackoutPeriod > numDaysInMonth) {
          throw new Error(
            `Invalid blackout days (${numDaysInBlackoutPeriod}) computed for ${redemption.origin}-${redemption.destination} on ${month} for blackout period ${period.from}-${period.to}`,
          );
        }
        const numFlightsForBlackoutPeriod =
          period.flightNos?.length ?? numFlights;
        const numDaysInBlackoutPeriodForFlights =
          numDaysInBlackoutPeriod * numFlightsForBlackoutPeriod;
        return _blackoutDays + numDaysInBlackoutPeriodForFlights;
      },
      0,
    );

    const blackoutPct = roundTo1Dp((blackoutDays / totalDaysForFlights) * 100);
    if (blackoutPct > 100) {
      throw new Error(
        `Invalid blackout pct (${blackoutPct}) computed for ${redemption.origin}-${redemption.destination} on ${month}`,
      );
    }

    return {
      ...redemption,
      blackoutPct,
    };
  });
}

const roundTo1Dp = (num: number) => {
  const dp = 1;
  const factor = Math.pow(10, dp);
  // always round half-up
  return Math.round(num * factor) / factor;
};
