import { trackEvent } from '@/analytics';
import { formatToDp } from '@/common/format-to-dp';
import { CommonStyles } from '@/components/common/styles';
import { TooltipOrPopover } from '@/components/common/tooltip-or-popover';
import { FlightClass } from '@/index';
import {
  Link,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
  getKeyValue,
} from '@nextui-org/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FlightClassIndicator } from '../../common/flight-class-indicator';
import {
  sortByNumericField,
  sortByStringField,
} from '../../common/table/sorters';
import { TablePagination } from '../../common/table/table-pagination';
import { useRowsPerPageHandler } from '../../common/table/table-rows-per-page';
import { getColumns } from './columns';
import { MonthColumnOrder, ShowRoutesAs, TopContent } from './top-content';

export type DatumForSeparateRoutes = {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  numRedemptions: number;
  numMonths: number;
  averageBlackoutPct: number;
};

export type DatumForCombinedRoutes = {
  cities: string;
  routesIata: string[];
  numMonths: number;
  averageBlackoutPct: number;
};

export interface DetailsTableContentProps {
  data: (DatumForSeparateRoutes | DatumForCombinedRoutes)[]; // in addition to per-month data
  startDate: Date;
  endDate: Date;
  months: string[];
  showRoutesAs: ShowRoutesAs;
  setShowRoutesAs: Dispatch<SetStateAction<ShowRoutesAs>>;
}

const isDatumForSeparateRoutes = (
  d: DatumForSeparateRoutes | DatumForCombinedRoutes,
): d is DatumForSeparateRoutes =>
  'origin' in d &&
  'originIata' in d &&
  'destination' in d &&
  'destinationIata' in d;

export function DetailsTableContent({
  data: inputData,
  startDate,
  endDate,
  months,
  showRoutesAs,
  setShowRoutesAs,
}: DetailsTableContentProps) {
  const [data, setData] = useState<DetailsTableContentProps['data']>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const [monthColumnOrder, setMonthColumnOrder] =
    useState<MonthColumnOrder>('latest');

  const {
    rowsPerPage,
    currPage,
    setCurrPage,
    pages,
    startIdx,
    endIdx,
    onRowsPerPageChange,
  } = useRowsPerPageHandler(inputData);

  useEffect(() => {
    // sort by numMonths descending by default whenever input data changes
    setData(sortByNumericField(inputData, 'numMonths', 'descending'));

    setSortDescriptor({
      column: 'numMonths',
      direction: 'descending',
    });
  }, [inputData]);

  const dataToDisplay = data.slice(startIdx, endIdx);

  const columns = getColumns({
    startDate,
    endDate,
    months,
    monthColumnOrder,
    showRoutesAs,
  });

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (typeof column !== 'string') return;

    const columnsWithSortingByNumber = columns
      .filter((col) => col.sortBy === 'number')
      .map((col) => col.key);
    const columnsWithSortingByString = columns
      .filter((col) => col.sortBy === 'string')
      .map((col) => col.key);

    if (columnsWithSortingByNumber.includes(column)) {
      setData(sortByNumericField(inputData, column, direction));
    } else if (columnsWithSortingByString.includes(column)) {
      setData(sortByStringField(inputData, column, direction));
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <div
      className={cn(
        CommonStyles.Border,
        'border py-4 px-2 rounded-md shadow-md',
      )}
    >
      <Table
        radius="sm"
        isHeaderSticky
        // removeWrapper
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        topContent={
          <TopContent
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            monthColumnOrder={monthColumnOrder}
            setMonthColumnOrder={setMonthColumnOrder}
            showRoutesAs={showRoutesAs}
            setShowRoutesAs={setShowRoutesAs}
          />
        }
        topContentPlacement="outside"
        bottomContent={
          <TablePagination
            pages={pages}
            page={currPage}
            setPage={setCurrPage}
          />
        }
        bottomContentPlacement="outside"
        aria-label="Details table"
        classNames={{
          th: 'px-1 py-1.5',
          td: 'px-1 py-1.5',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} allowsSorting={column.allowsSorting}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={dataToDisplay}>
          {(item) => (
            <TableRow
              key={
                isDatumForSeparateRoutes(item)
                  ? `${item.origin}#${item.destination}`
                  : item.cities
              }
              className={cn(CommonStyles.Border, 'border-b')}
            >
              {(columnKey) => (
                <TableCell className="text-xs">
                  {renderCell({
                    item,
                    columnKey: columnKey.toString(),
                  })}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function renderCell({
  item,
  columnKey,
}: {
  item: DatumForSeparateRoutes | DatumForCombinedRoutes;
  columnKey: string;
}) {
  switch (columnKey) {
    case 'origin':
    case 'destination':
    case 'numRedemptions':
    case 'numMonths':
      return getKeyValue(item, columnKey);
    case 'averageBlackoutPct':
      const averageBlackoutPct = getKeyValue(item, columnKey) as number | null;
      return averageBlackoutPct === null
        ? '-'
        : `${formatToDp(getKeyValue(item, columnKey), 1)}%`;
    case 'cities':
      return (
        <div className="w-32">
          {(item as DatumForCombinedRoutes)[columnKey]
            ?.split('/')
            ?.map((city, idx) => (
              <div key={city}>{`${city} ${idx === 0 ? ' /' : ''}`}</div>
            ))}
        </div>
      );
    case 'actions': {
      return (
        <div className="w-14">
          <TooltipOrPopover content="View detailed route info">
            {isDatumForSeparateRoutes(item) ? (
              <Link
                key={`${item.originIata}${item.destinationIata}`}
                href={`/route/${item.originIata}${item.destinationIata}`}
                size="sm"
                underline="hover"
                onClick={() => {
                  trackEvent(['playground', 'detailsTable'], {
                    route: `${item.originIata}${item.destinationIata}`,
                  });
                }}
                className="text-xs text-blue-500 dark:text-blue-400"
              >
                {`${item.originIata}-${item.destinationIata}`}
              </Link>
            ) : (
              <div className="flex flex-col gap-1">
                {item.routesIata.map((routeIata) => (
                  <Link
                    key={routeIata}
                    href={`/route/${routeIata.replace('-', '')}`}
                    size="sm"
                    underline="hover"
                    onClick={() => {
                      trackEvent(['playground', 'detailsTable'], {
                        route: routeIata,
                      });
                    }}
                    className="text-xs text-blue-500 dark:text-blue-400"
                  >
                    {routeIata}
                  </Link>
                ))}
              </div>
            )}
          </TooltipOrPopover>
        </div>
      );
    }
    default: {
      // @ts-expect-error assume that columnKey here represents a month
      const flightClassCodeMap = item[columnKey] as
        | Record<FlightClass, boolean>
        | undefined;

      return (
        <div className="flex flex-row gap-1">
          {flightClassCodeMap?.Y && (
            <FlightClassIndicator flightClassCode="Y" />
          )}
          {flightClassCodeMap?.W && (
            <FlightClassIndicator flightClassCode="W" />
          )}
          {flightClassCodeMap?.J && (
            <FlightClassIndicator flightClassCode="J" />
          )}
        </div>
      );
    }
  }
}
