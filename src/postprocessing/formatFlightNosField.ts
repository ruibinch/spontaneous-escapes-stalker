import { RedemptionJson } from '../utils/types';

/**
 * The flightNo string can contain either "," or "/" separators,
 * hence some parsing is required to render it in a standardised format.
 */
export function formatFlightNosField(redemptions: RedemptionJson[]): Array<
  Omit<RedemptionJson, 'flightNo'> & {
    flightNos: string[];
  }
> {
  return redemptions.map((redemption) => {
    const { flightNo, ...restProps } = redemption;
    return {
      ...restProps,
      flightNos: flightNo
        .replace(/\//g, ',')
        .split(',')
        .map((s) => s.trim())
        .sort((a, b) => {
          // SQ flights should come before MI flights
          if (a.startsWith('SQ') && b.startsWith('MI')) return -1;
          if (a.startsWith('MI') && b.startsWith('SQ')) return 1;

          const aNum = a.match(/\d+/g)?.[0];
          const bNum = b.match(/\d+/g)?.[0];
          // sort in ascending order of flight number
          return aNum && bNum
            ? Number(aNum) - Number(bNum)
            : a.localeCompare(b);
        }),
    };
  });
}
