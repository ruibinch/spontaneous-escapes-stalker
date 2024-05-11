import { yyyymmToDate } from '@/common/yyyymm-to-date';
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
import { flightClassCodeOrder } from '../common/flight-class-code-to-name';
import {
  FlightClassIndicator,
  getFlightClassIndicatorColor,
} from '../common/flight-class-indicator';
import { CommonStyles } from '../common/styles';
import { ChevronLeftIcon } from '../icons/chevron-left';
import { ChevronRightIcon } from '../icons/chevron-right';
import { ChevronsLeftIcon } from '../icons/chevrons-left';
import { ChevronsRightIcon } from '../icons/chevrons-right';
import {
  BlackoutPeriodsByDayDict,
  makeBlackoutPeriodsByDayDict,
} from './helpers/make-blackout-periods-by-day-dict';
import { RouteDetailDatum } from './helpers/make-route-details-list';

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
  const blackoutPeriodsByDayDict =
    makeBlackoutPeriodsByDayDict(redemptionsInMonth);

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
        <div className="flex justify-center items-center gap-4">
          <MonthSwitchButton icon={<ChevronsLeftIcon />} onClick={toPrevYear} />
          <MonthSwitchButton icon={<ChevronLeftIcon />} onClick={toPrevMonth} />
          <span onClick={resetToCurrMonth} className="cursor-pointer">
            {format(date, 'MMM yyyy')}
          </span>
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

        <div className="flex flex-row justify-between items-center text-xs">
          <div className="flex flex-col gap-1">
            <span>Flights applicable for redemption:</span>
            {redemptionsInMonth.length === 0 ? (
              <span>-</span>
            ) : (
              flightClassCodeOrder.map((flightClassCode) => {
                const flightNosForFlightClass = redemptionsInMonth
                  .find(({ flightClass }) => flightClass === flightClassCode)
                  ?.flightNos.join(', ');

                if (!flightNosForFlightClass) return null;
                return (
                  <div
                    key={flightClassCode}
                    className="flex gap-2 items-center"
                  >
                    <FlightClassIndicator flightClassCode={flightClassCode} />
                    <span>{flightNosForFlightClass}</span>
                  </div>
                );
              })
            )}
          </div>
          {/* legend */}
          <div className="flex flex-col gap-1 items-end">
            <div className="flex flex-row gap-1">
              <span>No redemption</span>
              <div className="w-6 h-4 bg-gray-700 dark:bg-gray-800" />
            </div>
            <div className="flex flex-row gap-1">
              <span>Blackout day</span>
              <div
                className={cn(
                  'w-6 h-4 border border-neutral-300 dark:border-neutral-400',
                  'bg-gray-700/10 dark:bg-sky-900/40 bg-stripes bg-stripes-white dark:bg-stripes-sky-900',
                )}
              />
            </div>
            <div className="flex flex-row gap-1">
              <span>Blackout period for flight(s)</span>
              <div
                className={cn(
                  'flex items-center justify-center',
                  'w-6 h-4 bg-green-600 rounded-md',
                )}
              >
                <span className="text-2xs text-amber-200 ml-0.5">228</span>
              </div>
            </div>
          </div>
        </div>

        <MonthCalendar
          date={date}
          hasRedemptionInMonth={redemptionsInMonth.length > 0}
          blackoutPeriodsByDayDict={blackoutPeriodsByDayDict}
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
  blackoutPeriodsByDayDict,
}: {
  date: Date;
  hasRedemptionInMonth: boolean;
  blackoutPeriodsByDayDict: BlackoutPeriodsByDayDict;
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
              'min-h-24 flex flex-row border-b',
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
              const blackoutPeriodsForDay = dayValue
                ? blackoutPeriodsByDayDict[
                    `${dayValue < 10 ? '0' : ''}${dayValue}`
                  ] ?? []
                : [];
              const maxRenderLevel =
                blackoutPeriodsForDay.length > 0
                  ? Math.max(
                      ...blackoutPeriodsForDay.map(
                        (period) => period.renderLevel,
                      ),
                    )
                  : 0;

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
                      if (blackoutPeriodsForDay.length > 0) {
                        return 'bg-gray-700/10 dark:bg-sky-900/40 bg-stripes bg-stripes-white dark:bg-stripes-sky-900';
                      }
                      if (!hasRedemptionInMonth) {
                        return 'bg-gray-700 dark:bg-gray-800';
                      }
                      return '';
                    })(),
                  )}
                >
                  <div
                    className={cn(
                      'mr-1 mt-0.5 text-right text-xs',
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

                  <div className="flex flex-col gap-0.5 mb-1">
                    {new Array(maxRenderLevel + 1)
                      .fill(null)
                      .map((_, level) => {
                        const blackoutPeriodForLevel =
                          blackoutPeriodsForDay.find(
                            (period) => period.renderLevel === level,
                          );
                        const isStartOfBlackoutPeriod =
                          dayValue ===
                          Number(blackoutPeriodForLevel?.from.split('-')[2]);
                        const isEndOfBlackoutPeriod =
                          dayValue ===
                          Number(blackoutPeriodForLevel?.to.split('-')[2]);

                        if (!blackoutPeriodForLevel) {
                          return (
                            <div key={`${dayValue}-${level}`} className="h-4" />
                          );
                        }

                        return (
                          <div
                            key={`${dayValue}-${level}`}
                            className="flex flex-row"
                          >
                            <div
                              className={cn(
                                'flex items-center',
                                'w-full h-4',
                                getFlightClassIndicatorColor({
                                  flightClassCode:
                                    blackoutPeriodForLevel.flightClass,
                                }),
                                isStartOfBlackoutPeriod && 'rounded-l-md',
                                isEndOfBlackoutPeriod && 'rounded-r-md',
                              )}
                            >
                              <span className="text-2xs text-amber-200 ml-0.5">
                                {(isStartOfBlackoutPeriod || dayValue === 1) &&
                                  // only show flight numbers on the 1st day of blackout period
                                  // or if it's the first day of the month, as the blackout period might be spanning from the previous month
                                  blackoutPeriodForLevel.flightNos
                                    .map((flightNo) =>
                                      flightNo.replace('SQ', ''),
                                    )
                                    .join(',')}
                              </span>
                            </div>
                            {
                              // override calendar grid border if period is spanning to the next day
                              !isEndOfBlackoutPeriod && (
                                <div
                                  className={cn(
                                    '-mr-px w-px h-4',
                                    getFlightClassIndicatorColor({
                                      flightClassCode:
                                        blackoutPeriodForLevel.flightClass,
                                    }),
                                  )}
                                />
                              )
                            }
                          </div>
                        );
                      })}
                  </div>
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
