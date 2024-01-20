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
  },
];

export function RouteFrequencyTable({
  data,
}: {
  data: Array<{
    from: string;
    to: string;
    fromIata: string;
    toIata: string;
    count: number;
  }>;
}) {
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

    return data.slice(start, end);
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

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Number of occurrences by route</h3>
      <Table
        isStriped
        radius="md"
        topContent={topContent}
        bottomContent={bottomContent}
        aria-label="Number of occurrences by route"
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
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
