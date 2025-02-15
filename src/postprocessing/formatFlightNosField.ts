import { RedemptionJsonWithRegion } from './standardiseRegionField';

export type RedemptionJsonWithRegionAndFlightNos = Omit<
  RedemptionJsonWithRegion,
  'flightNo'
> & {
  flightNos: string[];
};

/**
 * The flightNo string can contain either "," or "/" separators,
 * hence some parsing is required to render it in a standardised format.
 *
 * Also apply the same sorter to the flightNos field in the blackoutPeriods list.
 */
export function formatFlightNosField(
  redemptions: RedemptionJsonWithRegion[],
): RedemptionJsonWithRegionAndFlightNos[] {
  return redemptions.map((redemption) => {
    const { flightNo, blackoutPeriod, ...restProps } = redemption;
    return {
      ...restProps,
      flightNos: flightNo
        .replace(/\//g, ',')
        .split(',')
        .map((s) => s.trim())
        .sort(sortFlightNos),
      blackoutPeriod: blackoutPeriod.map((period) => ({
        ...period,
        ...(period.flightNos && {
          flightNos: period.flightNos.map((s) => s.trim()).sort(sortFlightNos),
        }),
      })),
    };
  });
}

const sortFlightNos = (a: string, b: string) => {
  // SQ flights should come before MI flights
  if (a.startsWith('SQ') && b.startsWith('MI')) return -1;
  if (a.startsWith('MI') && b.startsWith('SQ')) return 1;

  const aNum = a.match(/\d+/g)?.[0];
  const bNum = b.match(/\d+/g)?.[0];
  // sort in ascending order of flight number
  return aNum && bNum ? Number(aNum) - Number(bNum) : a.localeCompare(b);
};
