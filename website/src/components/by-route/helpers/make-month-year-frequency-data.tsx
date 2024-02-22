import { getYearsList } from '@/common/get-data-time-range';
import {
  FlightClass,
  RedemptionInfoForMonth,
  RedemptionInfoSingle,
} from '@/index';
import { RouteDetailDatum } from './make-route-details-list';

export interface MonthYearFrequencyDatum {
  year: string;
  '01'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '02'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '03'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '04'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '05'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '06'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '07'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '08'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '09'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '10'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '11'?: Record<FlightClass, RedemptionInfoSingle | null>;
  '12'?: Record<FlightClass, RedemptionInfoSingle | null>;
}

export function makeMonthYearFrequencyData({
  data,
  years,
}: {
  data: RouteDetailDatum[];
  years: string[];
}) {
  const yearsList = years.includes('All') ? getYearsList() : years;

  return yearsList.map((year) => {
    const datumForYear: MonthYearFrequencyDatum = {
      year,
    };

    data
      .filter((d) => d.month.startsWith(year))
      .forEach((d) => {
        const month = d.month.slice(4, 6);
        // @ts-expect-error month is an accepted key
        datumForYear[month] = {
          // @ts-expect-error month is an accepted key
          ...datumForYear[month],
          [d.flightClass]: {
            flightNos: d.flightNos,
            milesRequired: d.milesRequired,
            blackoutPeriod: d.blackoutPeriod,
          },
        };
      });

    return datumForYear;
  });
}
