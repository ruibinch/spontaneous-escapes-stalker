import { FlightClass, RouteAnalysisEntry, RedemptionInfoSingle } from '@/index';
import {
  DetailsTableContent,
  DetailsTableContentProps,
} from './details-table/details-table-content';

type Props = Omit<DetailsTableContentProps, 'data'> & {
  data: RouteAnalysisEntry[];
};

export function DetailsTable(props: Props) {
  const { data, ...restProps } = props;

  const dataWithCount = data.map((entry) => {
    const monthToRedemptionDetailsMap: Record<
      string,
      Record<FlightClass, RedemptionInfoSingle | null>
    > = {};
    let count = 0;

    entry.details.forEach((detail) => {
      monthToRedemptionDetailsMap[detail.month] = detail.redemptionDetails;

      const numRedemptionsForMonth = Object.values(
        detail.redemptionDetails,
      ).filter(Boolean).length;
      count += numRedemptionsForMonth;
    });

    return {
      from: entry.from,
      fromIata: entry.fromIata,
      to: entry.to,
      toIata: entry.toIata,
      count,
      ...monthToRedemptionDetailsMap,
    };
  });

  // @ts-expect-error count is of type number
  return <DetailsTableContent {...restProps} data={dataWithCount} />;
}
