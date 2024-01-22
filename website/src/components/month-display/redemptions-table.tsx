import { monthNumToShortNameMap } from '@/common/months-map';
import { RedemptionEntry } from '@/index';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TablePagination } from '../common/table-pagination';
import { TableRowsPerPage } from '../common/table-rows-per-page';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/render-table-cells';

const columns = [
  { key: 'origin', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'flightClass', label: 'Flight Class' },
  { key: 'flightNo', label: 'Flight No.' },
  { key: 'milesRequired', label: 'Miles Required', allowsSorting: true },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
  { key: 'region', label: 'Region' },
];

export function RedemptionsTable({
  data: inputData,
  tableSummaryComponent,
}: {
  data: RedemptionEntry[];
  tableSummaryComponent: React.ReactNode;
}) {
  const [data, setData] = useState<RedemptionEntry[]>([]);
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
      <div className="flex justify-between">
        {tableSummaryComponent}
        <TableRowsPerPage
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    );
  }, [tableSummaryComponent, rowsPerPage, onRowsPerPageChange]);

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (column === 'milesRequired') {
      const dataSortedByMilesRequired = [...inputData].sort((a, b) => {
        return direction === 'ascending'
          ? a.milesRequired - b.milesRequired
          : b.milesRequired - a.milesRequired;
      });

      setData(dataSortedByMilesRequired);
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <Table
      isStriped
      radius="md"
      topContent={topContent}
      bottomContent={
        <TablePagination pages={pages} page={page} setPage={setPage} />
      }
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
      aria-label="Details view"
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
            key={`${item.flightClass}#${item.origin}#${item.destination}`}
          >
            {(columnKey) => (
              <TableCell>
                {(() => {
                  switch (columnKey) {
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
  );
}
