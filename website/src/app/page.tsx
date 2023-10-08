'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { FlightClassChip } from './components/chips';
import { columns, data } from './data';

type Datum = (typeof data)[number];

export default function Content() {
  return (
    <div className="h-full px-4 pt-4 pb-8">
      <div className="mt-4 w-full flex">
        <Table
          isStriped
          isHeaderSticky
          aria-label="Analysis table of SE redemptions history"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                align={
                  column.key === 'from' || column.key === 'to'
                    ? 'start'
                    : 'center'
                }
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={data}>
            {(item) => (
              <TableRow key={`${item.from}-${item.to}`}>
                {(columnKey) => (
                  <TableCell>
                    {renderCell({ item, columnKey: columnKey.toString() })}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function renderCell({ item, columnKey }: { item: Datum; columnKey: string }) {
  switch (columnKey) {
    case 'from':
    case 'to':
      return (
        <div>
          <span>{item[columnKey]}</span>
        </div>
      );
    default: {
      // @ts-expect-error columnKey is of generic string type
      const flightClassCodeMap = item[columnKey] as Record<
        'Y' | 'PY' | 'J',
        boolean
      >;

      return (
        <div className="flex">
          {flightClassCodeMap.Y && <FlightClassChip flightClass="Y" />}
          {flightClassCodeMap.PY && <FlightClassChip flightClass="PY" />}
          {flightClassCodeMap.J && <FlightClassChip flightClass="J" />}
        </div>
      );
    }
  }
}
