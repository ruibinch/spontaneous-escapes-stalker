import { Toggle, ToggleProps } from '@/components/common/toggle';
import { Dispatch, SetStateAction } from 'react';
import { FlightClassIndicator } from '../../common/flight-class-indicator';
import { TableRowsPerPage } from '../../common/table/table-rows-per-page';

export type MonthColumnOrder = 'latest' | 'oldest';
const monthColumnOrderToggleOptions: ToggleProps<MonthColumnOrder>['options'] =
  [
    { key: 'latest', label: 'Latest first' },
    { key: 'oldest', label: 'Oldest first' },
  ];

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
          <Toggle<MonthColumnOrder>
            options={monthColumnOrderToggleOptions}
            title="Toggle month column order"
            selValue={props.monthColumnOrder}
            setSelValue={props.setMonthColumnOrder}
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
