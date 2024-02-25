import { trackEvent } from '@/analytics';
import { TooltipCustom } from '@/components/common/tooltip-custom';
import { FlightClass, RouteAnalysisEntry } from '@/index';
import {
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { FlightClassIndicator } from '../../common/flight-class-indicator';
import { TablePagination } from '../../common/table/table-pagination';
import { useRowsPerPageHandler } from '../../common/table/table-rows-per-page';
import {
  sortByNumericField,
  sortByStringField,
} from '../../common/table/sorters';
import { EyeIcon } from '../../icons/eye';
import { getColumns } from './columns';
import { MonthColumnOrder, TopContent } from './top-content';

type DetailsTableDatum = {
  from: string;
  fromIata: string;
  to: string;
  toIata: string;
  count: number;
} & Record<string, string>;

export interface DetailsTableContentProps {
  data: DetailsTableDatum[];
  startDate: Date;
  endDate: Date;
  months: string[];
}

export function DetailsTableContent({
  data: inputData,
  startDate,
  endDate,
  months,
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

  const columns = getColumns({ startDate, endDate, months, monthColumnOrder });

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (column === 'count') {
      setData(sortByNumericField(inputData, 'count', direction));
    } else if (column === 'from' || column === 'to') {
      setData(sortByStringField(inputData, column, direction));
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <div className="border border-neutral-250 py-4 px-2 rounded-md">
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
        aria-label="Detailed view"
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
            <TableRow key={`${item.from}#${item.to}`} className="border-b">
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
  item: DetailsTableDatum;
  columnKey: string;
}) {
  switch (columnKey) {
    case 'from':
    case 'to':
    case 'count':
      return getKeyValue(item, columnKey);
    case 'actions': {
      return (
        <TooltipCustom content="View detailed route info">
          <NextLink
            href={`/route/${item.fromIata}${item.toIata}`}
            onClick={() => {
              trackEvent(['playground', 'detailsTable', 'detailedRouteInfo'], {
                route: `${item.fromIata}${item.toIata}`,
              });
            }}
          >
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <EyeIcon />
            </span>
          </NextLink>
        </TooltipCustom>
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
