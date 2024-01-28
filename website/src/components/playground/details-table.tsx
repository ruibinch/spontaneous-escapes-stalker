import { RouteAnalysisEntry } from '@/index';
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
    let count = 0;
    Object.values(entry.details).forEach((detailsInfo) => {
      const numRedemptionsForMonth =
        Object.values(detailsInfo).filter(Boolean).length;
      count += numRedemptionsForMonth;
    });

    return {
      ...entry,
      count,
    };
  });

  return <DetailsTableContent {...restProps} data={dataWithCount} />;
}
