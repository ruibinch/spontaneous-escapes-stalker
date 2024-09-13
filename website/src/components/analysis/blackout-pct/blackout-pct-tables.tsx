import { CommonStyles } from '@/components/common/styles';
import { RoutesStats, useRoutesStats } from '@/hooks/use-routes-stats';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
  getKeyValue,
} from '@nextui-org/react';

const NUM_ROUTES_TO_DISPLAY = 10;

const columns = [
  { key: 'route', label: 'Route' },
  { key: 'numMonths', label: 'Months' },
  { key: 'numRedemptions', label: 'Redemptions' },
  { key: 'averageBlackoutPct', label: 'Average blackout %' },
];

export function BlackoutPctTables() {
  const routesStats = useRoutesStats();
  // only include routes with a decent set of redemptions
  const routesStatsFiltered = routesStats.filter(
    (stats) => stats.numRedemptions > 10,
  );

  const topRoutesWithHighestBlackoutPct = [...routesStatsFiltered]
    .sort((a, b) => b.averageBlackoutPct - a.averageBlackoutPct)
    .slice(0, NUM_ROUTES_TO_DISPLAY);
  const topRoutesWithLowestBlackoutPct = [...routesStatsFiltered]
    .filter((stats) => stats.averageBlackoutPct > 0)
    .sort((a, b) => a.averageBlackoutPct - b.averageBlackoutPct)
    .slice(0, NUM_ROUTES_TO_DISPLAY);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 xl:col-span-1">
        <BlackoutPctTable
          title={`Top ${NUM_ROUTES_TO_DISPLAY} routes with highest blackout %`}
          data={topRoutesWithHighestBlackoutPct}
        />
      </div>
      <div className="col-span-2 xl:col-span-1">
        <BlackoutPctTable
          title={`Top ${NUM_ROUTES_TO_DISPLAY} routes with lowest blackout %`}
          data={topRoutesWithLowestBlackoutPct}
        />
      </div>
    </div>
  );
}

function BlackoutPctTable({
  title,
  data,
}: {
  title: string;
  data: RoutesStats[];
}) {
  return (
    <div
      className={cn(
        CommonStyles.Border,
        'flex flex-col gap-4 px-2 pt-2 pb-4 border rounded-md shadow-sm',
      )}
    >
      <div className="flex flex-row gap-2 items-end">
        <h3 className="text-sm">{title}</h3>
        <span className="text-2xs italic">(min 10 redemptions)</span>
      </div>

      <Table
        radius="sm"
        aria-label="Percentage of redeemable routes table"
        removeWrapper
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data}>
          {(item) => (
            <TableRow
              key={`${item.fromIata}-${item.toIata}`}
              className={cn(CommonStyles.Border, 'border-b')}
            >
              {(columnKey) => (
                <TableCell className="py-1.5 text-xs">
                  {(() => {
                    switch (columnKey) {
                      case 'route':
                        return (
                          <Link
                            key={`${item.fromIata}${item.toIata}`}
                            href={`/route/${item.fromIata}${item.toIata}`}
                            size="sm"
                            underline="hover"
                            className="text-xs text-blue-500 dark:text-blue-400"
                          >
                            {`${item.from} - ${item.to}`}
                          </Link>
                        );
                      case 'averageBlackoutPct':
                        const averageBlackoutPct = getKeyValue(
                          item,
                          columnKey,
                        ) as number | null;
                        return averageBlackoutPct === null
                          ? '-'
                          : `${getKeyValue(item, columnKey)}%`;
                      default:
                        return getKeyValue(item, columnKey);
                    }
                  })()}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
