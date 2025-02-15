import {
  differenceInCalendarDays,
  endOfMonth,
  getDaysInMonth,
  max,
  min,
  startOfMonth,
} from 'date-fns';
import { RedemptionJsonWithRegionAndFlightNos } from './formatFlightNosField';
import { BlackoutPeriod } from '../utils/types';

export type RedemptionJsonWithRegionAndFlightNosAndBlackoutPct =
  RedemptionJsonWithRegionAndFlightNos & {
    blackoutPct: number;
    // null if there are no SIA flights for redemption in the month
    blackoutPctSiaOnly?: number | null;
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
  redemptions: RedemptionJsonWithRegionAndFlightNos[];
  month: string;
}): RedemptionJsonWithRegionAndFlightNosAndBlackoutPct[] {
  return redemptions.map((redemption) => {
    if (redemption.blackoutPeriod.length === 0) {
      return {
        ...redemption,
        blackoutPct: 0,
      };
    }

    const blackoutPct = computeBlackoutPctForFlights({
      month,
      origin: redemption.origin,
      destination: redemption.destination,
      blackoutPeriod: redemption.blackoutPeriod,
      flightNos: redemption.flightNos,
    });

    // initially thought there's a need to compute blackoutPctSiaOnly, but it's not necessary as there are no blackout periods specific to SilkAir flights
    // hence the blackoutPct will always be the same when the SilkAir flights are removed from flightNos list

    return {
      ...redemption,
      blackoutPct,
    };
  });
}

const computeBlackoutPctForFlights = ({
  month,
  origin,
  destination,
  blackoutPeriod,
  flightNos,
}: {
  month: string;
  origin: string;
  destination: string;
  blackoutPeriod: BlackoutPeriod[];
  flightNos: string[];
}) => {
  const monthDate = new Date(`${month.slice(0, 4)}-${month.slice(4, 6)}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const numDaysInMonth = getDaysInMonth(new Date(blackoutPeriod[0].from));
  const numFlights = flightNos.length;
  const totalDaysForFlights = numDaysInMonth * numFlights;

  const blackoutDays = blackoutPeriod.reduce((_blackoutDays, period) => {
    // min/max is required as blackout periods can span to the previous/next month
    const numDaysInBlackoutPeriod =
      differenceInCalendarDays(
        min([monthEnd, new Date(period.to)]),
        max([monthStart, new Date(period.from)]),
      ) + 1;
    if (numDaysInBlackoutPeriod > numDaysInMonth) {
      throw new Error(
        `Invalid blackout days (${numDaysInBlackoutPeriod}) computed for ${origin}-${destination} on ${month} for blackout period ${period.from}-${period.to}`,
      );
    }
    const numFlightsForBlackoutPeriod = period.flightNos?.length ?? numFlights;
    const numDaysInBlackoutPeriodForFlights =
      numDaysInBlackoutPeriod * numFlightsForBlackoutPeriod;
    return _blackoutDays + numDaysInBlackoutPeriodForFlights;
  }, 0);

  const blackoutPct = roundTo1Dp((blackoutDays / totalDaysForFlights) * 100);
  if (blackoutPct > 100) {
    throw new Error(
      `Invalid blackout pct (${blackoutPct}) computed for ${origin}-${destination} on ${month}`,
    );
  }

  return blackoutPct;
};

const roundTo1Dp = (num: number) => {
  const dp = 1;
  const factor = Math.pow(10, dp);
  // always round half-up
  return Math.round(num * factor) / factor;
};
