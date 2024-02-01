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
import { useEffect, useState } from 'react';
import {
  renderBlackoutPeriodCell,
  renderFlightClassCell,
} from '../common/render-table-cells';
import { TablePagination } from '../common/table-pagination';
import {
  TableRowsPerPage,
  useRowsPerPageHandler,
} from '../common/table-rows-per-page';
import { sortByNumericField, sortByStringField } from '../common/table/sorters';

const columns = [
  { key: 'origin', label: 'Origin', allowsSorting: true },
  { key: 'destination', label: 'Destination', allowsSorting: true },
  { key: 'flightClass', label: 'Flight Class' },
  { key: 'flightNo', label: 'Flight No.' },
  { key: 'milesRequired', label: 'Miles Required', allowsSorting: true },
  { key: 'blackoutPeriod', label: 'Blackout Period' },
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

    if (column === 'milesRequired') {
      // if this is the first sort, sort descending by default
      sortDirection = sortDescriptor?.direction ? direction : 'descending';
      setData(sortByNumericField(inputData, 'milesRequired', sortDirection));
    } else if (column === 'origin' || column === 'destination') {
      setData(sortByStringField(inputData, column, direction));
    }

    setSortDescriptor({ column, direction: sortDirection });
  };

  return (
    <div className="border border-neutral-250 py-4 px-2 rounded-md">
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
            <TableColumn key={column.key} allowsSorting={column.allowsSorting}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={dataToDisplay}>
          {(item) => (
            <TableRow
              key={`${item.flightClass}#${item.origin}#${item.destination}`}
              className="border-b"
            >
              {(columnKey) => (
                <TableCell>
                  {(() => {
                    switch (columnKey) {
                      case 'flightClass':
                        return renderFlightClassCell({
                          flightClass: item[columnKey],
                        });
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
