import { CardWrapper } from '@/components/common/card-wrapper';
import { CommonStyles } from '@/components/common/styles';
import { RoutesStats, useRoutesStats } from '@/hooks/use-routes-stats';
import { RouteAnalysisEntry } from '@/index';
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
} from '@heroui/react';

const NUM_ROUTES_TO_DISPLAY = 10;

const columns = [
  { key: 'route', label: 'Route' },
  { key: 'numMonths', label: 'Months' },
  { key: 'numRedemptions', label: 'Redemptions' },
  { key: 'averageBlackoutPct', label: 'Average blackout %' },
];

export function BlackoutPctTables({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const routesStats = useRoutesStats(routeAnalysisList);
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
    <CardWrapper
      title={title}
      subtitle="(min 10 redemptions)"
      style="gap-4 pb-4"
      headerStyle="items-end"
      content={
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
                key={`${item.originIata}-${item.destinationIata}`}
                className={cn(CommonStyles.Border, 'border-b')}
              >
                {(columnKey) => (
                  <TableCell className="py-1.5 text-xs">
                    {(() => {
                      switch (columnKey) {
                        case 'route':
                          return (
                            <Link
                              key={`${item.originIata}${item.destinationIata}`}
                              href={`/route/${item.originIata}${item.destinationIata}`}
                              size="sm"
                              underline="hover"
                              className={cn(CommonStyles.Link, 'text-xs')}
                            >
                              {`${item.origin} - ${item.destination}`}
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
      }
    />
  );
}
