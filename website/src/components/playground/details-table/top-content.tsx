import { cn } from '@nextui-org/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FlightClassIndicator } from '../../common/flight-class-indicator';
import { TableRowsPerPage } from '../../common/table/table-rows-per-page';

export function TopContent(props: {
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  monthColumnOrder: MonthColumnOrder;
  setMonthColumnOrder: Dispatch<SetStateAction<MonthColumnOrder>>;
}) {
  return (
    <div className="flex flex-col pl-2 gap-4 sm:flex-row sm:justify-between sm:items-end">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="text-default-400 text-small">
          <div className="flex flex-row gap-2 items-center">
            <FlightClassIndicator flightClassCode={'Y'} />
            {'Economy'}
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FlightClassIndicator flightClassCode={'W'} />
            {'Premium Economy'}
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FlightClassIndicator flightClassCode={'J'} />
            {'Business'}
          </div>
        </div>

        <div className="md:pl-4 lg:pl-6 xl:pl-8">
          <MonthColumnOrderToggle
            monthColumnOrder={props.monthColumnOrder}
            setMonthColumnOrder={props.setMonthColumnOrder}
          />
        </div>
      </div>

      <TableRowsPerPage
        rowsPerPage={props.rowsPerPage}
        onRowsPerPageChange={props.onRowsPerPageChange}
      />
    </div>
  );
}

export type MonthColumnOrder = 'latest' | 'oldest';

function MonthColumnOrderToggle({
  monthColumnOrder,
  setMonthColumnOrder,
}: {
  monthColumnOrder: MonthColumnOrder;
  setMonthColumnOrder: Dispatch<SetStateAction<MonthColumnOrder>>;
}) {
  const handleOrderToggle = (orderUpdated: MonthColumnOrder) => {
    setMonthColumnOrder(orderUpdated);
  };

  const addBackgroundStyle = (order: MonthColumnOrder) =>
    cn(
      'px-4 py-0.5 border-y hover:border-blue-600',
      order === monthColumnOrder
        ? 'border-blue-600 bg-blue-50'
        : 'border-neutral-400',
    );

  const addTextStyle = (order: MonthColumnOrder) =>
    cn(
      'text-sm hover:text-blue-600',
      order === monthColumnOrder ? 'text-blue-600 font-medium' : '',
    );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-default-400 text-small">
        Toggle month column order
      </span>
      <a className="flex cursor-pointer">
        <div
          className={cn('rounded-l-md border-l', addBackgroundStyle('latest'))}
          onClick={() => {
            handleOrderToggle('latest');
          }}
        >
          <span className={addTextStyle('latest')}>Latest first</span>
        </div>
        <div className="border-l-1 border-blue-600" />
        <div
          className={cn('rounded-r-md border-r', addBackgroundStyle('oldest'))}
          onClick={() => {
            handleOrderToggle('oldest');
          }}
        >
          <span className={addTextStyle('oldest')}>Oldest first</span>
        </div>
      </a>
    </div>
  );
}
