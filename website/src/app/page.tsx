'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useReducer } from 'react';
import { FlightClassChip } from '../components/flight-class-chip';
import { columns, data, isMonthDatum } from '../data';
import { TableOptions } from './table-options';
import {
  tableOptionsInitialState,
  tableOptionsReducer,
} from './table-options/reducer';

type Datum = (typeof data)[number];

export default function Content() {
  const [state, dispatch] = useReducer(
    tableOptionsReducer,
    tableOptionsInitialState,
  );

  const dataFiltered = data
    .filter((datum) => {
      if (!state.searchTerm) return datum;

      return (
        datum.from.toLowerCase().includes(state.searchTerm) ||
        datum.to.toLowerCase().includes(state.searchTerm)
      );
    })
    .map((datum) => {
      const datumUpdated = Object.entries(datum).reduce((_d, [key, value]) => {
        // @ts-expect-error key is of type string
        _d[key] = isMonthDatum(value)
          ? {
              Y: value.Y && state.flightClass.Y,
              PY: value.PY && state.flightClass.PY,
              J: value.J && state.flightClass.J,
            }
          : value;
        return _d;
      }, {} as Datum);

      return datumUpdated;
    });

  return (
    <div className="h-full px-4 pt-4 pb-8">
      <TableOptions state={state} dispatch={dispatch} />

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
                width={
                  column.key === 'from' || column.key === 'to'
                    ? '20fr'
                    : undefined
                }
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={dataFiltered}>
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
