import { RouteFrequencyByFlightClass, RouteFrequencyEntry } from '@/index';
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

const columns = [
  {
    key: 'from',
    label: 'Origin',
  },
  {
    key: 'to',
    label: 'Destination',
  },
  {
    key: 'count',
    label: 'Count',
    allowsSorting: true,
  },
];

export function RouteFrequencyTable({
  data: inputData,
}: {
  data: RouteFrequencyEntry[];
}) {
  const [data, setData] = useState<RouteFrequencyEntry[]>([]);
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
      <div className="flex justify-end">
        <TableRowsPerPage
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    );
  }, [rowsPerPage, onRowsPerPageChange]);

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (column === 'count') {
      const dataSorted = [...inputData].sort((a, b) => {
        return direction === 'ascending'
          ? a.count - b.count
          : b.count - a.count;
      });

      setData(dataSorted);
    }

    setSortDescriptor({ column, direction });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Number of occurrences by route</h3>
      <Table
        isStriped
        radius="md"
        topContent={topContent}
        bottomContent={
          <TablePagination pages={pages} page={page} setPage={setPage} />
        }
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        aria-label="Number of occurrences by route"
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
            <TableRow key={`${item.from}-${item.to}`}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
