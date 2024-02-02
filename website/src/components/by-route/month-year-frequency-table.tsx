import { monthShortNameToNumMap } from '@/common/months-map';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClass, SingleRedemptionInfo } from '@/index';
import { cn } from '@nextui-org/react';
import { isBefore, isAfter } from 'date-fns';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { makeMonthYearFrequencyData } from './helpers/make-month-year-frequency-data';
import { RouteDetailDatum } from './helpers/make-route-details-list';
import { getMonthsList } from '@/common/get-data-time-range';
import { TooltipDark } from '../common/tooltip-dark';
import {
  MONTHS_WITH_MISSING_DATA,
  MONTHS_WITH_NO_REDEMPTION,
} from '@/common/months-data-info';

const monthsList = getMonthsList();

const columns = [
  { key: 'year', label: '' },
  ...Object.entries(monthShortNameToNumMap).map(([monthName, monthNum]) => ({
    key: monthNum,
    label: monthName,
  })),
];

export function MonthYearFrequencyTable({
  data,
  years,
}: {
  data: RouteDetailDatum[];
  years: string[];
}) {
  const tableData = makeMonthYearFrequencyData({ data, years });

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Calendar view</h3>

      <div className="flex flex-col gap-2 py-4 px-1 sm:px-2 border border-neutral-250 rounded-md">
        <TopContent />

        <div className="border border-neutral-200 rounded-sm">
          <table className="table table-fixed w-full rounded-md text-center">
            <thead>
              <tr className="border-b bg-neutral-100/75">
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    className={cn(
                      'py-2 text-xs sm:text-sm',
                      idx !== 0 ? 'border-l' : '',
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((tableDatum, idx) => (
                <tr
                  key={tableDatum.year}
                  className={idx !== 0 ? 'border-t' : undefined}
                >
                  <td className="py-1 text-xs sm:text-sm bg-neutral-100/75">
                    {tableDatum.year}
                  </td>
                  {columns.slice(1).map((col) => {
                    // @ts-expect-error col.key is valid
                    const valueAtYearMonth = tableDatum[col.key] as Partial<
                      Record<FlightClass, SingleRedemptionInfo>
                    >;
                    const yyyymm = `${tableDatum.year}${col.key}`;

                    return renderCell(valueAtYearMonth, yyyymm);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderCell(
  valueAtYearMonth:
    | Partial<Record<FlightClass, SingleRedemptionInfo | null>>
    | undefined,
  yyyymm: string,
) {
  const monthDate = yyyymmToDate(yyyymm);
  const datasetStartDate = yyyymmToDate(monthsList[0]);
  const datasetEndDate = yyyymmToDate(monthsList[monthsList.length - 1]);

  const noDataMessage = (() => {
    if (MONTHS_WITH_MISSING_DATA.includes(yyyymm)) {
      return 'Missing data';
    }
    if (MONTHS_WITH_NO_REDEMPTION.includes(yyyymm)) {
      return 'No redemption for this month';
    }
    if (isBefore(monthDate, datasetStartDate)) {
      return 'Pre-Spontaneous Escapes era';
    }
    if (isAfter(monthDate, datasetEndDate)) {
      return "We aren't there yet";
    }
    if (!monthsList.includes(yyyymm)) {
      return 'Covid era';
    }
    return null;
  })();

  if (noDataMessage) {
    return (
      <TooltipDark key={yyyymm} content={noDataMessage}>
        <td key={yyyymm} className="border-l bg-gray-700" />
      </TooltipDark>
    );
  }
  if (!valueAtYearMonth) {
    return <td key={yyyymm} className="border-l"></td>;
  }

  return (
    <td key={yyyymm} className="border-l">
      <div className="flex justify-center">
        <div className="flex flex-row gap-0.5 sm:gap-1">
          {valueAtYearMonth.Y && <FlightClassIndicator flightClassCode="Y" />}
          {valueAtYearMonth.PY && <FlightClassIndicator flightClassCode="PY" />}
          {valueAtYearMonth.J && <FlightClassIndicator flightClassCode="J" />}
        </div>
      </div>
    </td>
  );
}

function TopContent() {
  return (
    <div className="flex flex-col pl-2 text-default-400 text-small">
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
    </div>
  );
}
