import { differenceInCalendarDays, getDaysInMonth } from 'date-fns';
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
export function computeBlackoutPct(
  redemptions: RedemptionJsonWithFlightNos[],
): RedemptionJsonWithFlightNosAndBlackoutPct[] {
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
        const numDaysInBlackoutPeriod =
          differenceInCalendarDays(new Date(period.to), new Date(period.from)) +
          1;
        const numDaysInBlackoutPeriodForFlights =
          numDaysInBlackoutPeriod * numFlights;
        return _blackoutDays + numDaysInBlackoutPeriodForFlights;
      },
      0,
    );
    const blackoutPct = roundTo1Dp((blackoutDays / totalDaysForFlights) * 100);

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
