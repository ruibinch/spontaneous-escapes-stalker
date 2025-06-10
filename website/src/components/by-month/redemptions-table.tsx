import { RedemptionEntry } from '@/index';
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
import { useEffect, useState } from 'react';
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/table/render-table-cells';
import { TablePagination } from '../common/table/table-pagination';
import {
  TableRowsPerPage,
  useRowsPerPageHandler,
} from '../common/table/table-rows-per-page';
import { sortByNumericField, sortByStringField } from '../common/table/sorters';
import { CommonStyles } from '../common/styles';
import { formatToDp } from '@/common/format-to-dp';
import { CardWrapper } from '../common/card-wrapper';

const columns = [
  { key: 'actions', label: 'Route' },
  { key: 'origin', label: 'Origin', allowsSorting: true },
  { key: 'destination', label: 'Destination', allowsSorting: true },
  { key: 'flightClass', label: 'Flight Class' },
  { key: 'flightNos', label: 'Flight No.' },
  { key: 'milesRequired', label: 'Miles Required', allowsSorting: true },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
  { key: 'blackoutPct', label: 'Blackout %', allowsSorting: true },
  { key: 'region', label: 'Region' },
];

export function RedemptionsTable({
  data: inputData,
}: {
  data: RedemptionEntry[];
}) {
  const [data, setData] = useState<RedemptionEntry[]>([]);
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
    setData(inputData);
  }, [inputData]);

  const dataToDisplay = data.slice(startIdx, endIdx);

  const handleSortChange = ({ column, direction }: SortDescriptor) => {
    let sortDirection = direction;

    if (column === 'milesRequired' || column === 'blackoutPct') {
      // if this is the first sort, sort descending by default
      sortDirection = sortDescriptor?.direction ? direction : 'descending';
      setData(sortByNumericField(inputData, column, sortDirection));
    } else if (column === 'origin' || column === 'destination') {
      setData(sortByStringField(inputData, column, direction));
    }

    setSortDescriptor({ column, direction: sortDirection });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Details</h3>

      <CardWrapper
        content={
          <Table
            radius="sm"
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
            aria-label="By-month redemptions table"
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
                  key={`${item.flightClass}#${item.origin}#${item.destination}`}
                  className={cn(CommonStyles.Border, 'border-b')}
                >
                  {(columnKey) => (
                    <TableCell className="text-xs">
                      {(() => {
                        switch (columnKey) {
                          case 'actions':
                            return (
                              <div className="w-14">
                                <Link
                                  key={`${item.originIata}${item.destinationIata}`}
                                  href={`/route/${item.originIata}${item.destinationIata}`}
                                  size="sm"
                                  underline="hover"
                                  className={cn(
                                    CommonStyles.Link,
                                    'text-xs w-14',
                                  )}
                                >
                                  {`${item.originIata}-${item.destinationIata}`}
                                </Link>
                              </div>
                            );
                          case 'flightClass':
                            return renderFlightClassCell({
                              flightClass: item[columnKey],
                            });
                          case 'milesRequired':
                            return item[columnKey].toLocaleString();
                          case 'blackoutPeriod':
                            return renderBlackoutPeriodCell(item[columnKey]);
                          case 'blackoutPct':
                            return `${formatToDp(item[columnKey], 1)}%`;
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
