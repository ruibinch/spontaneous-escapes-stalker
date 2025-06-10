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
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { CommonStyles } from '../common/styles';
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/table/render-table-cells';
import { sortByNumericField, sortByStringField } from '../common/table/sorters';
import { TablePagination } from '../common/table/table-pagination';
import {
  TableRowsPerPage,
  useRowsPerPageHandler,
} from '../common/table/table-rows-per-page';
import { RouteDetailDatum } from './helpers/make-route-details-list';
import { CardWrapper } from '../common/card-wrapper';

const columns = [
  { key: 'month', label: 'Month', allowsSorting: true },
  { key: 'flightClass', label: 'Flight Class' },
  { key: 'milesRequired', label: 'Miles Required', allowsSorting: true },
  { key: 'flightNos', label: 'Flight No.' },
  { key: 'blackoutPct', label: 'Blackout %' },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
];

export function RouteHistoryTable({
  data: inputData,
}: {
  data: RouteDetailDatum[];
}) {
  const [data, setData] = useState<RouteDetailDatum[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();

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
    // sort by month descending by default whenever input data changes
    setData(sortByStringField(inputData, 'month', 'descending'));

    setSortDescriptor({
      column: 'month',
      direction: 'descending',
    });
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
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">History</h3>

      <CardWrapper
        content={
          <Table
            radius="sm"
            aria-label="Month/year frequency table for a specific route"
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            topContent={
              <TopContent
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
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
    </div>
  );
}

function TopContent(props: {
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="flex justify-end">
      <TableRowsPerPage
        rowsPerPage={props.rowsPerPage}
        onRowsPerPageChange={props.onRowsPerPageChange}
      />
    </div>
  );
}
