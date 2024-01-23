import { getMonthsList } from '@/common/get-data-time-range';
import {
  FlightClass,
  FlightClassSelectOption,
  RouteAnalysisEntry,
} from '@/index';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  getKeyValue,
} from '@nextui-org/react';
import NextLink from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { TablePagination } from '../common/table-pagination';
import { TableRowsPerPage } from '../common/table-rows-per-page';
import { isApplicableMonth } from './helpers/is-applicable-month';
import { EyeIcon } from '../icons/eye';
import { trackEvent } from '@/analytics';

interface Props {
  data: RouteAnalysisEntry[];
  flightClassSelectedOption: FlightClassSelectOption;
  startDate: Date;
  endDate: Date;
  months: string[];
}

const monthsList = getMonthsList();

const getColumns = (
  filters: Pick<Props, 'startDate' | 'endDate' | 'months'>,
): Array<{
  key: string;
  label: string;
}> => [
  { key: 'actions', label: '' },
  {
    key: 'from',
    label: 'FROM',
  },
  {
    key: 'to',
    label: 'TO',
  },
  ...monthsList
    .filter((month) =>
      isApplicableMonth({
        month,
        filters,
      }),
    )
    .map((month) => ({
      key: month,
      label: `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    })),
];

export function DetailsTable({
  data,
  flightClassSelectedOption,
  startDate,
  endDate,
  months,
}: Props) {
  const [numEntries, setNumEntries] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(data.length / rowsPerPage);

  useEffect(() => {
    // reset all rows/pagination props if number of entries has changed
    if (numEntries !== undefined && data.length !== numEntries) {
      setRowsPerPage(10);
      setPage(1);
    }
    setNumEntries(data.length);
  }, [data, numEntries]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const dataToDisplay = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end).map((datum) => ({
      ...datum,
      ...datum.details,
    }));
  }, [data, page, rowsPerPage]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-end">
          <div className="pl-2">
            <span className="text-default-400 text-small">
              <div className="flex flex-row gap-2 items-center">
                <FlightClassIndicator flightClassCode={'Y'} />
                {'Economy'}
              </div>
              <div className="flex flex-row gap-2 items-center">
                <FlightClassIndicator flightClassCode={'PY'} />
                {'Premium Economy'}
              </div>
              <div className="flex flex-row gap-2 items-center">
                <FlightClassIndicator flightClassCode={'J'} />
                {'Business'}
              </div>
            </span>
          </div>
          <TableRowsPerPage
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </div>
      </div>
    );
  }, [rowsPerPage, onRowsPerPageChange]);

  const columns = getColumns({ startDate, endDate, months });

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Details</h3>
      <Table
        isStriped
        radius="md"
        topContent={topContent}
        bottomContent={
          <TablePagination pages={pages} page={page} setPage={setPage} />
        }
        aria-label="Details view"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={dataToDisplay}>
          {(item) => (
            <TableRow key={`${item.from}-${item.to}`}>
              {(columnKey) => (
                <TableCell>
                  {renderCell({
                    item,
                    columnKey: columnKey.toString(),
                    flightClassSelectedOption,
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
  flightClassSelectedOption,
}: {
  item: RouteAnalysisEntry;
  columnKey: string;
  flightClassSelectedOption: FlightClassSelectOption;
}) {
  switch (columnKey) {
    case 'from':
    case 'to':
      return getKeyValue(item, columnKey);
    case 'actions': {
      return (
        <Tooltip content="View detailed route info">
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
        </Tooltip>
      );
    }
    default: {
      // @ts-expect-error assume that columnKey here represents a month
      const flightClassCodeMap = item[columnKey] as
        | Record<FlightClass, boolean>
        | undefined;
      const isFlightClassFilterValid = (flightClass: string) =>
        flightClassSelectedOption === 'ALL' ||
        flightClassSelectedOption === flightClass;

      return (
        <div className="flex flex-row gap-1">
          {flightClassCodeMap?.Y && isFlightClassFilterValid('Y') && (
            <FlightClassIndicator flightClassCode="Y" />
          )}
          {flightClassCodeMap?.PY && isFlightClassFilterValid('PY') && (
            <FlightClassIndicator flightClassCode="PY" />
          )}
          {flightClassCodeMap?.J && isFlightClassFilterValid('J') && (
            <FlightClassIndicator flightClassCode="J" />
          )}
        </div>
      );
    }
  }
}
