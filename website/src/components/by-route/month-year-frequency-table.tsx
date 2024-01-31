import { monthNameToNumMap } from '@/common/months-map';
import {
  FlightClass,
  RedemptionInfoForMonth,
  SingleRedemptionInfo,
} from '@/index';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import {
  MonthYearFrequencyDatum,
  makeMonthYearFrequencyData,
} from './helpers/make-month-year-frequency-data';

const columns = [
  { key: 'year', label: '' },
  ...Object.entries(monthNameToNumMap).map(([monthName, monthNum]) => ({
    key: monthNum,
    label: monthName,
  })),
];

export function MonthYearFrequencyTable({
  data,
  years,
}: {
  data: RedemptionInfoForMonth[];
  years: string[];
}) {
  const tableData = makeMonthYearFrequencyData({ data, years });

  const topContent = (
    <div className="flex flex-col pl-2">
      <span className="text-default-400 text-small">
        <div className="flex flex-row gap-2 items-center">
          <FlightClassIndicator flightClassCode={'Y'} />
          {'Economy'}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <FlightClassIndicator flightClassCode={'PY'} />
          {'Premium Economy'}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <FlightClassIndicator flightClassCode={'J'} />
          {'Business'}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <NoData />
          {'No data'}
        </div>
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Calendar view</h3>
      <Table
        radius="md"
        topContent={topContent}
        aria-label="Month/year frequency table for a specific route"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={tableData}>
          {(item) => (
            <TableRow key={item.year}>
              {(columnKey) => (
                <TableCell>
                  {renderCell({
                    item,
                    columnKey: columnKey.toString(),
                  })}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function renderCell({
  item,
  columnKey,
}: {
  item: MonthYearFrequencyDatum;
  columnKey: string;
}) {
  switch (columnKey) {
    case 'year':
      return getKeyValue(item, columnKey);
    default: {
      // @ts-expect-error assume that columnKey here represents a month
      const flightClassCodeMap = item[columnKey] as
        | Record<FlightClass, SingleRedemptionInfo | null>
        | undefined;

      if (!flightClassCodeMap) {
        // no data for that month
        return <NoData />;
      }

      return (
        <div className="flex flex-row gap-1">
          {flightClassCodeMap.Y && <FlightClassIndicator flightClassCode="Y" />}
          {flightClassCodeMap.PY && (
            <FlightClassIndicator flightClassCode="PY" />
          )}
          {flightClassCodeMap.J && <FlightClassIndicator flightClassCode="J" />}
        </div>
      );
    }
  }
}

function NoData() {
  return <div className="w-2 h-2 bg-gray-500/50"></div>;
}
