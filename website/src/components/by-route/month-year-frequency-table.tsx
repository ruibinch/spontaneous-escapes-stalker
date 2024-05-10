import { monthShortNameToNumMap } from '@/common/months-map';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClass, RedemptionInfoSingle } from '@/index';
import { cn } from '@nextui-org/react';
import { isBefore, isAfter } from 'date-fns';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { makeMonthYearFrequencyData } from './helpers/make-month-year-frequency-data';
import { RouteDetailDatum } from './helpers/make-route-details-list';
import { getMonthsList } from '@/common/get-data-time-range';
import { TooltipCustom } from '../common/tooltip-custom';
import {
  MONTHS_WITH_MISSING_DATA,
  MONTHS_WITH_NO_REDEMPTION,
} from '@/common/months-data-info';
import { FlightClassLegend } from '../common/flight-class-legend';
import { CommonStyles } from '../common/styles';

const monthsList = getMonthsList();

const columns = [
  { key: 'year', label: '' },
  ...Object.entries(monthShortNameToNumMap).map(([monthName, monthNum]) => ({
    key: monthNum,
    label: monthName,
  })),
];

const TableStyles = {
  Borders: cn('border-neutral-300 dark:border-neutral-400'),
  HeaderCols: cn('bg-neutral-100/75 dark:bg-neutral-700/75'),
};

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

      <div
        className={cn(
          CommonStyles.Border,
          'flex flex-col gap-2 py-4 px-1 sm:px-2 border rounded-md',
        )}
      >
        <FlightClassLegend styles="pl-2" />

        <div className={cn(TableStyles.Borders, 'border rounded-sm')}>
          <table className="table table-fixed w-full rounded-md text-center">
            <thead>
              <tr
                className={cn(
                  TableStyles.Borders,
                  TableStyles.HeaderCols,
                  'border-b',
                )}
              >
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    className={cn(
                      'py-2 text-xs sm:text-sm',
                      idx !== 0 ? cn(TableStyles.Borders, 'border-l') : '',
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
                  className={
                    idx !== 0 ? cn(TableStyles.Borders, 'border-t') : undefined
                  }
                >
                  <td className={cn(TableStyles.HeaderCols, 'py-1 text-xs')}>
                    {tableDatum.year}
                  </td>
                  {columns.slice(1).map((col) => {
                    // @ts-expect-error col.key is valid
                    const valueAtYearMonth = tableDatum[col.key] as Partial<
                      Record<FlightClass, RedemptionInfoSingle>
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
    | Partial<Record<FlightClass, RedemptionInfoSingle | null>>
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
    // FIXME: popover doesn't work here so tooltip is not viewable on mobile
    return (
      <TooltipCustom key={yyyymm} content={noDataMessage} alwaysUseTooltip>
        <td
          key={yyyymm}
          className={cn(
            TableStyles.Borders,
            'border-l',
            isAfter(monthDate, datasetEndDate)
              ? 'bg-gray-700/30 dark:bg-sky-900'
              : 'bg-gray-700 dark:bg-sky-900/50',
          )}
        />
      </TooltipCustom>
    );
  }
  if (!valueAtYearMonth) {
    return (
      <td key={yyyymm} className={cn(TableStyles.Borders, 'border-l')}></td>
    );
  }

  return (
    <td key={yyyymm} className={cn(TableStyles.Borders, 'border-l')}>
      <div className="flex justify-center">
        <div className="flex flex-row gap-0.5 sm:gap-1">
          {valueAtYearMonth.Y && <FlightClassIndicator flightClassCode="Y" />}
          {valueAtYearMonth.W && <FlightClassIndicator flightClassCode="W" />}
          {valueAtYearMonth.J && <FlightClassIndicator flightClassCode="J" />}
        </div>
      </div>
    </td>
  );
}
