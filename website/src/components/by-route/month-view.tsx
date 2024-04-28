import { BlackoutPeriod } from '@/index';
import { Button, cn } from '@nextui-org/react';
import {
  addMonths,
  addYears,
  format,
  getDaysInMonth,
  isBefore,
  isSameMonth,
  startOfMonth as startOfMonthFn,
  subMonths,
  subYears,
} from 'date-fns';
import { useState } from 'react';
import { CommonStyles } from '../common/styles';
import { ChevronLeftIcon } from '../icons/chevron-left';
import { ChevronRightIcon } from '../icons/chevron-right';
import { ChevronsLeftIcon } from '../icons/chevrons-left';
import { ChevronsRightIcon } from '../icons/chevrons-right';
import { RouteDetailDatum } from './helpers/make-route-details-list';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { TooltipCustom } from '../common/tooltip-custom';
import { FlightClassIndicator } from '../common/flight-class-indicator';

export function MonthView({
  detailsListFiltered,
}: {
  detailsListFiltered: RouteDetailDatum[];
}) {
  const today = new Date();
  const [date, setDate] = useState(today);

  const redemptionsInMonth = detailsListFiltered.filter((detail) =>
    isSameMonth(yyyymmToDate(detail.month), date),
  );
  const blackoutPeriodsInMonth = redemptionsInMonth.reduce(
    (_blackoutPeriodsInMonth: BlackoutPeriod[], detail) => {
      _blackoutPeriodsInMonth.push(...detail.blackoutPeriod);
      return _blackoutPeriodsInMonth;
    },
    [],
  );

  const isBeforeCurrentMonth =
    isBefore(date, today) && !isSameMonth(date, today);
  const toPrevYear = () => setDate(subYears(date, 1));
  const toPrevMonth = () => setDate(subMonths(date, 1));
  const toNextMonth = () => setDate(addMonths(date, 1));
  const toNextYear = () =>
    setDate(new Date(Math.min(addYears(date, 1).getTime(), today.getTime())));
  const resetToCurrMonth = () => setDate(today);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Month view</h3>

      <div
        className={cn(
          CommonStyles.Border,
          'flex flex-col p-4 gap-4 border rounded-md',
        )}
      >
        <div className="flex justify-center gap-4">
          <MonthSwitchButton icon={<ChevronsLeftIcon />} onClick={toPrevYear} />
          <MonthSwitchButton icon={<ChevronLeftIcon />} onClick={toPrevMonth} />
          <div className="flex flex-col gap-2 pt-1">
            <span onClick={resetToCurrMonth} className="cursor-pointer">
              {format(date, 'MMM yyyy')}
            </span>
            <div className="flex justify-center gap-2">
              {redemptionsInMonth.map((redemption) => (
                <FlightClassIndicator
                  key={redemption.flightClass}
                  flightClassCode={redemption.flightClass}
                />
              ))}
            </div>
          </div>
          <MonthSwitchButton
            icon={<ChevronRightIcon />}
            onClick={toNextMonth}
            hideButton={!isBeforeCurrentMonth}
          />
          <MonthSwitchButton
            icon={<ChevronsRightIcon />}
            onClick={toNextYear}
            hideButton={!isBeforeCurrentMonth}
          />
        </div>

        <MonthCalendar
          date={date}
          hasRedemptionInMonth={redemptionsInMonth.length > 0}
          blackoutPeriodsInMonth={blackoutPeriodsInMonth}
        />
      </div>
    </div>
  );
}

const MAX_WEEKS_IN_MONTH = 6;
const DAYS_OF_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function MonthCalendar({
  date,
  hasRedemptionInMonth,
  blackoutPeriodsInMonth,
}: {
  date: Date;
  hasRedemptionInMonth: boolean;
  blackoutPeriodsInMonth: BlackoutPeriod[];
}) {
  const CalendarStyles = {
    Borders: cn('border-neutral-300 dark:border-neutral-400'),
  };

  const startOfMonth = startOfMonthFn(date);
  const daysInMonth = getDaysInMonth(date);
  let currentDay = 1;

  return (
    <div>
      {new Array(MAX_WEEKS_IN_MONTH).fill(null).map((_, weekIdx) => {
        if (currentDay > daysInMonth) {
          return null;
        }

        return (
          <div
            key={weekIdx}
            className={cn(
              CalendarStyles.Borders,
              'min-h-20 flex flex-row border-b',
              weekIdx === 0 && 'border-t',
            )}
          >
            {DAYS_OF_WEEK_ORDER.map((dayOfWeek, dayIdx) => {
              const dayValue = (() => {
                if (
                  // before start of month
                  (currentDay === 1 && startOfMonth.getDay() !== dayOfWeek) ||
                  // after end of month
                  currentDay > daysInMonth
                ) {
                  return null;
                }

                currentDay += 1;
                return currentDay - 1;
              })();

              return (
                <div
                  key={`${weekIdx}-${dayOfWeek}`}
                  className={cn(
                    'flex-1',
                    CalendarStyles.Borders,
                    'border-r',
                    dayIdx === 0 && 'border-l',
                    (() => {
                      if (dayValue === null) {
                        return 'bg-gray-700/10 dark:bg-sky-900/40';
                      }
                      return hasRedemptionInMonth
                        ? ''
                        : 'bg-gray-700 dark:bg-gray-800';
                    })(),
                  )}
                >
                  <TooltipCustom
                    content={
                      hasRedemptionInMonth ? '' : 'No redemption in month'
                    }
                  >
                    <div
                      className={cn(
                        'mr-1 mt-1 text-right text-xs',
                        (() => {
                          if (dayOfWeek === 6 || dayOfWeek === 0) {
                            // weekends
                            return hasRedemptionInMonth
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-rose-600/75 dark:text-rose-400/50';
                          }
                          return hasRedemptionInMonth
                            ? 'text-neutral-600/80 dark:text-neutral-400/80'
                            : 'text-neutral-500/80 dark:text-neutral-500/80';
                        })(),
                      )}
                    >
                      <span>{dayValue}</span>
                    </div>
                  </TooltipCustom>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function MonthSwitchButton({
  icon,
  onClick,
  hideButton = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  hideButton?: boolean;
}) {
  if (hideButton) {
    return <div className="w-8 h-8" />;
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      isIconOnly
      className="w-8 h-8 border-1"
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
