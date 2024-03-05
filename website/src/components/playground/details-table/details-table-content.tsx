import { trackEvent } from '@/analytics';
import { TooltipCustom } from '@/components/common/tooltip-custom';
import { FlightClass, RouteAnalysisEntry } from '@/index';
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
import NextLink from 'next/link';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FlightClassIndicator } from '../../common/flight-class-indicator';
import { TablePagination } from '../../common/table/table-pagination';
import { useRowsPerPageHandler } from '../../common/table/table-rows-per-page';
import {
  sortByNumericField,
  sortByStringField,
} from '../../common/table/sorters';
import { EyeIcon } from '../../icons/eye';
import { getColumns } from './columns';
import { MonthColumnOrder, ShowRoutesAs, TopContent } from './top-content';
import { CommonStyles } from '@/components/common/styles';

type DatumForSeparateRoutes = {
  from: string;
  fromIata: string;
  to: string;
  toIata: string;
  count: number;
};

type DatumForCombinedRoutes = {
  cities: string;
  routesIata: string[];
  count: number;
};

export interface DetailsTableContentProps {
  data: (DatumForSeparateRoutes | DatumForCombinedRoutes)[];
  startDate: Date;
  endDate: Date;
  months: string[];
  showRoutesAs: ShowRoutesAs;
  setShowRoutesAs: Dispatch<SetStateAction<ShowRoutesAs>>;
}

const isDatumForSeparateRoutes = (
  d: DatumForSeparateRoutes | DatumForCombinedRoutes,
): d is DatumForSeparateRoutes =>
  'from' in d && 'fromIata' in d && 'to' in d && 'toIata' in d && 'count' in d;

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
    // sort by count descending by default whenever input data changes
    setData(sortByNumericField(inputData, 'count', 'descending'));

    setSortDescriptor({
      column: 'count',
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
    if (column === 'count') {
      setData(sortByNumericField(inputData, 'count', direction));
    } else if (column === 'from' || column === 'to') {
      setData(sortByStringField(inputData, column, direction));
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <div className={cn(CommonStyles.Border, 'border py-4 px-2 rounded-md')}>
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
                  ? `${item.from}#${item.to}`
                  : item.cities
              }
              className={cn(CommonStyles.Border, 'border-b')}
            >
              {(columnKey) => (
                <TableCell>
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
    case 'from':
    case 'to':
    case 'count':
      return getKeyValue(item, columnKey);
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
          <TooltipCustom content="View detailed route info">
            {isDatumForSeparateRoutes(item) ? (
              <Link
                key={`${item.fromIata}${item.toIata}`}
                href={`/route/${item.fromIata}${item.toIata}`}
                size="sm"
                underline="hover"
                onClick={() => {
                  trackEvent(['playground', 'detailsTable'], {
                    route: `${item.fromIata}${item.toIata}`,
                  });
                }}
                className="text-xs text-blue-500"
              >
                {`${item.fromIata}-${item.toIata}`}
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
                    className="text-xs text-blue-500"
                  >
                    {routeIata}
                  </Link>
                ))}
              </div>
            )}
          </TooltipCustom>
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
