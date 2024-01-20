import { FlightClass, RouteAnalysisEntry } from '@/index';
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import { useCallback, useMemo, useState } from 'react';
import { filterApplicableMonthsList } from './helpers/filter-applicable-months-list';
import { FlightClassIndicator } from '../common/flight-class-indicator';

interface Props {
  data: RouteAnalysisEntry[];
  startDate?: Date;
  endDate?: Date;
}

const getColumns = ({
  data,
  startDate,
  endDate,
}: Props): Array<{
  key: string;
  label: string;
}> => [
  {
    key: 'from',
    label: 'FROM',
  },
  {
    key: 'to',
    label: 'TO',
  },
  ...filterApplicableMonthsList({
    months: Object.keys(data[0].details),
    startDate,
    endDate,
  }).map((month) => ({
    key: month,
    label: `${month.slice(0, 4)}-${month.slice(4, 6)}`,
  })),
];

export function DetailsTable({ data, startDate, endDate }: Props) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(data.length / rowsPerPage);

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
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {`Total ${data.length} entr${data.length === 1 ? 'y' : 'ies'}`}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, data.length]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-end">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [page, pages]);

  const columns = getColumns({ data, startDate, endDate });

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Details</h3>
      <Table
        isStriped
        radius="md"
        topContent={topContent}
        bottomContent={bottomContent}
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
                  {renderDetailCell({
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

function renderDetailCell({
  item,
  columnKey,
}: {
  item: RouteAnalysisEntry;
  columnKey: string;
}) {
  switch (columnKey) {
    case 'from':
    case 'to':
      return <span>{item[columnKey]}</span>;
    default: {
      // @ts-expect-error assume that columnKey here represents a month
      const flightClassCodeMap = item[columnKey] as Record<
        FlightClass,
        boolean
      >;
      return (
        <div className="flex flex-row gap-1">
          {flightClassCodeMap.Y && <FlightClassIndicator flightClass="Y" />}
          {flightClassCodeMap.PY && <FlightClassIndicator flightClass="PY" />}
          {flightClassCodeMap.J && <FlightClassIndicator flightClass="J" />}
        </div>
      );
    }
  }
}
