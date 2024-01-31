import { RedemptionInfoForMonth, RouteAnalysisEntry } from '@/index';
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
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/render-table-cells';
import {
  RouteHistoryDatum,
  makeRouteHistoryData,
} from './helpers/make-route-history-data';
import { TablePagination } from '../common/table-pagination';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TableRowsPerPage } from '../common/table-rows-per-page';

const columns = [
  { key: 'month', label: 'Month', allowsSorting: true },
  { key: 'flightClass', label: 'Flight Class' },
  { key: 'milesRequired', label: 'Miles Required', allowsSorting: true },
  { key: 'flightNo', label: 'Flight No.' },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
];

export function RouteHistoryTable({
  data,
}: {
  data: RedemptionInfoForMonth[];
}) {
  const routeHistoryData = makeRouteHistoryData(data);
  return <RouteHistoryTableContent data={routeHistoryData} />;
}

function RouteHistoryTableContent({
  data: inputData,
}: {
  data: RouteHistoryDatum[];
}) {
  const [data, setData] = useState<RouteHistoryDatum[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

  const [numEntries, setNumEntries] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(inputData.length / rowsPerPage);

  useEffect(() => {
    setData(inputData);
  }, [inputData]);

  useEffect(() => {
    // reset all rows/pagination props if number of entries has changed
    if (numEntries !== undefined && inputData.length !== numEntries) {
      setRowsPerPage(10);
      setPage(1);
    }
    setNumEntries(inputData.length);
  }, [inputData, numEntries]);

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

    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  const topContent = useMemo(() => {
    return (
      <div className="flex justify-between items-end">
        <div>
          <span>Total </span>
          <span className="font-bold">{`${inputData.length} entries`}</span>
        </div>

        <TableRowsPerPage
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    );
  }, [inputData.length, rowsPerPage, onRowsPerPageChange]);

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (column === 'milesRequired') {
      const dataSorted = [...inputData].sort((a, b) => {
        return direction === 'ascending'
          ? a.milesRequired - b.milesRequired
          : b.milesRequired - a.milesRequired;
      });
      setData(dataSorted);
    } else if (column === 'month') {
      const dataSorted = [...inputData].sort((a, b) => {
        return direction === 'ascending'
          ? a.month.localeCompare(b.month)
          : b.month.localeCompare(a.month);
      });
      setData(dataSorted);
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">History</h3>

      <Table
        radius="md"
        isStriped
        aria-label="Month/year frequency table for a specific route"
        topContent={topContent}
        bottomContent={
          <TablePagination pages={pages} page={page} setPage={setPage} />
        }
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
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
            <TableRow key={`${item.month}#${item.flightClass}`}>
              {(columnKey) => (
                <TableCell>
                  {(() => {
                    switch (columnKey) {
                      case 'month': {
                        const value = item[columnKey];
                        return `${value.slice(0, 4)}-${value.slice(4, 6)}`;
                      }
                      case 'flightClass':
                        return renderFlightClassCell(item[columnKey]);
                      case 'milesRequired':
                        return item[columnKey].toLocaleString();
                      case 'blackoutPeriod':
                        return renderBlackoutPeriodCell(item[columnKey]);
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
