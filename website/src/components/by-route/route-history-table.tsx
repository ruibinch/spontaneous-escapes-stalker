import { formatToDp } from '@/common/format-to-dp';
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
} from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { CommonStyles } from '../common/styles';
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/table/render-table-cells';
import { sortByNumericField, sortByStringField } from '../common/table/sorters';
import { TablePagination } from '../common/table/table-pagination';
import { RouteDetailDatum } from './helpers/make-route-details-list';
import { CardWrapper } from '../common/card-wrapper';

const columns = [
  { key: 'month', label: 'Month', allowsSorting: true },
  { key: 'flightClass', label: 'Class' },
  { key: 'milesRequired', label: 'Miles', allowsSorting: true },
  { key: 'flightNos', label: 'Flight No.' },
  { key: 'blackoutPct', label: 'Blackout %' },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
];

const DEFAULT_ROWS = 20;

export function RouteHistoryTable({
  data: inputData,
}: {
  data: RouteDetailDatum[];
}) {
  const [data, setData] = useState<RouteDetailDatum[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS);
  const [currPage, setCurrPage] = useState(1);

  const pages = Math.ceil(inputData.length / rowsPerPage);
  const startIdx = (currPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setCurrPage(1);
    },
    [],
  );

  useEffect(() => {
    setData(sortByStringField(inputData, 'month', 'descending'));
    setSortDescriptor({ column: 'month', direction: 'descending' });
    setCurrPage(1);
  }, [inputData]);

  const dataToDisplay = data.slice(startIdx, endIdx);

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    if (column === 'milesRequired') {
      setData(sortByNumericField(inputData, 'milesRequired', direction));
    } else if (column === 'month') {
      setData(sortByStringField(inputData, 'month', direction));
    }
    setSortDescriptor({ column, direction });
  };

  return (
    <CardWrapper
      title="History"
      subtitle={`${inputData.length} entries`}
      content={
        <Table
          radius="sm"
          aria-label="Route redemption history table"
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          topContent={
            <div className="flex justify-end">
              <label className="items-center text-text-muted text-xs">
                <span>Rows per page: </span>
                <select
                  className="bg-transparent outline-none text-text-muted"
                  value={rowsPerPage}
                  onChange={onRowsPerPageChange}
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
            </div>
          }
          topContentPlacement="outside"
          bottomContent={
            pages > 1 ? (
              <TablePagination
                pages={pages}
                page={currPage}
                setPage={setCurrPage}
              />
            ) : null
          }
          bottomContentPlacement="outside"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                allowsSorting={column.allowsSorting}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={dataToDisplay}>
            {(item) => (
              <TableRow
                key={`${item.month}#${item.flightClass}`}
                className={cn(CommonStyles.Border, 'border-b')}
              >
                {(columnKey) => (
                  <TableCell className="text-xs">
                    {(() => {
                      switch (columnKey) {
                        case 'month': {
                          const value = item[columnKey];
                          return (
                            <Link
                              href={`/month/${value}`}
                              size="sm"
                              underline="hover"
                              className={cn(CommonStyles.Link, 'text-xs')}
                            >
                              {`${value.slice(0, 4)}-${value.slice(4, 6)}`}
                            </Link>
                          );
                        }
                        case 'flightClass':
                          return renderFlightClassCell({
                            flightClassCode: item[columnKey],
                          });
                        case 'milesRequired':
                          return item[columnKey].toLocaleString();
                        case 'blackoutPct':
                          return `${formatToDp(item[columnKey], 1)}%`;
                        case 'blackoutPeriod':
                          return renderBlackoutPeriodCell(item[columnKey]);
                        case 'flightNos':
                          return item[columnKey].join(', ');
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
