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
        .map((s) => s.trim()),
    };
  });
}
