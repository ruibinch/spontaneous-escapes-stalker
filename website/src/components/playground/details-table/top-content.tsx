import { FlightClassLegend } from '@/components/common/flight-class-legend';
import { Toggle, ToggleProps } from '@/components/common/toggle';
import { Dispatch, SetStateAction } from 'react';
import { TableRowsPerPage } from '../../common/table/table-rows-per-page';

export type MonthColumnOrder = 'latest' | 'oldest';
const monthColumnOrderToggleOptions: ToggleProps<MonthColumnOrder>['options'] =
  [
    { key: 'latest', label: 'Latest first' },
    { key: 'oldest', label: 'Oldest first' },
  ];

export type ShowRoutesAs = 'separate' | 'combined';
const showRoutesAsToggleOptions: ToggleProps<ShowRoutesAs>['options'] = [
  { key: 'separate', label: 'Separate' },
  { key: 'combined', label: 'Combined' },
];

export function TopContent(props: {
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  monthColumnOrder: MonthColumnOrder;
  setMonthColumnOrder: Dispatch<SetStateAction<MonthColumnOrder>>;
  showRoutesAs: ShowRoutesAs;
  setShowRoutesAs: Dispatch<SetStateAction<ShowRoutesAs>>;
}) {
  return (
    <div className="flex flex-col pl-2 gap-4 md:flex-row md:justify-between md:items-end">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 lg:items-end">
        <FlightClassLegend />

        <Toggle<MonthColumnOrder>
          options={monthColumnOrderToggleOptions}
          title="Toggle month column order"
          selValue={props.monthColumnOrder}
          setSelValue={props.setMonthColumnOrder}
        />

        <Toggle<ShowRoutesAs>
          options={showRoutesAsToggleOptions}
          title="Show routes as"
          selValue={props.showRoutesAs}
          setSelValue={props.setShowRoutesAs}
        />
      </div>

      <TableRowsPerPage
        rowsPerPage={props.rowsPerPage}
        onRowsPerPageChange={props.onRowsPerPageChange}
      />
    </div>
  );
}
