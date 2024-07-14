import { dateToYyyymm } from '@/common/date-to-yyyymm';
import { getMonthsWithRouteNetworkData } from '@/common/get-months-with-route-network-data';
import { getMostCommonElementInArray } from '@/common/get-most-common-element-in-array';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { useSearchParams } from '@/hooks/use-search-params';
import { Button, cn } from '@nextui-org/react';
import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameMonth,
  max,
  min,
  startOfMonth as startOfMonthFn,
  subMonths,
  subYears,
} from 'date-fns';
import { useRouter } from 'next/navigation';
import { YEAR_ALL } from '../common/filters/year-filter';
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
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();

  const year = searchParams.get('year') ?? YEAR_ALL;
  const monthsWithRouteNetworkData = getMonthsWithRouteNetworkData(
    year.split(','),
  );
  const minMonth = yyyymmToDate(Array.from(monthsWithRouteNetworkData)[0]);

  const today = new Date();
  const monthView = searchParams.get('monthView') ?? dateToYyyymm(today);
  const currDate = yyyymmToDate(monthView);
  const updateMonthView = (newDate: Date) => {
    const url = generateUrlWithUpdatedSearchParams(
      'monthView',
      dateToYyyymm(newDate),
    );
    router.push(url, { scroll: false });
  };

  const redemptionsInMonth = detailsListFiltered.filter((detail) =>
    isSameMonth(yyyymmToDate(detail.month), currDate),
  );
  const blackoutPeriodsByDayDict = makeBlackoutPeriodsByDayDict(
    redemptionsInMonth,
    currDate,
  );

  const isAfterMinMonth = isAfter(currDate, minMonth);
  const isBeforeCurrentMonth =
    isBefore(currDate, today) && !isSameMonth(currDate, today);
  const toPrevYear = () =>
    updateMonthView(max([minMonth, subYears(currDate, 1)]));
  const toPrevMonth = () => updateMonthView(subMonths(currDate, 1));
  const toNextMonth = () => updateMonthView(addMonths(currDate, 1));
  const toNextYear = () => updateMonthView(min([today, addYears(currDate, 1)]));
  const resetToCurrMonth = () => updateMonthView(today);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Month view</h3>

      <div
        className={cn(
          CommonStyles.Border,
          'flex flex-col py-4 px-1 sm:px-2 gap-4 border rounded-md',
        )}
      >
        {/* month controls */}
        <div className="flex justify-center items-center gap-4">
          <MonthSwitchButton
            icon={<ChevronsLeftIcon />}
            onClick={toPrevYear}
            hideButton={!isAfterMinMonth}
          />
          <MonthSwitchButton
            icon={<ChevronLeftIcon />}
            onClick={toPrevMonth}
            hideButton={!isAfterMinMonth}
          />
          <span onClick={resetToCurrMonth} className="cursor-pointer">
            {format(currDate, 'MMM yyyy')}
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

        {/* info and legend */}
        <div className="flex flex-row justify-between items-start text-xs">
          <div className="flex flex-col gap-1">
            <span>Redemption flights, with blackout %:</span>
            {redemptionsInMonth.length === 0 ? (
              <span>-</span>
            ) : (
              flightClassCodeOrder.map((flightClassCode) => {
                const redemptionForFlightClass = redemptionsInMonth.find(
                  ({ flightClass }) => flightClass === flightClassCode,
                );
                if (!redemptionForFlightClass) return null;

                const { flightNos, blackoutPct } = redemptionForFlightClass;

                return (
                  <div
                    key={flightClassCode}
                    className="flex gap-2 items-center"
                  >
                    <FlightClassIndicator flightClassCode={flightClassCode} />
                    <span>{flightNos.join(', ')}</span>
                    <span className="font-semibold">[{blackoutPct}%]</span>
                  </div>
                );
              })
            )}
          </div>
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
              <span className="text-end">Blackout period for flight(s)</span>
              <div
                className={cn(
                  'flex items-center justify-center',
                  'w-6 h-4 bg-green-600 rounded-md',
                )}
              >
                <span className="text-2xs text-amber-200">
                  {(() => {
                    // use the most occurring flight number as the example
                    const flightNos = detailsListFiltered
                      .map(({ flightNos }) => flightNos)
                      .flat();
                    const mostOccurringFlightNo =
                      getMostCommonElementInArray(flightNos);
                    return mostOccurringFlightNo?.replace('SQ', '');
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <MonthCalendar
          monthDate={currDate}
          hasRedemptionInMonth={redemptionsInMonth.length > 0}
          blackoutPeriodsByDayDict={blackoutPeriodsByDayDict}
        />
      </div>
    </div>
  );
}

function MonthCalendar({
  monthDate,
  hasRedemptionInMonth,
  blackoutPeriodsByDayDict,
}: {
  monthDate: Date;
  hasRedemptionInMonth: boolean;
  blackoutPeriodsByDayDict: BlackoutPeriodsByDayDict;
}) {
  const MAX_WEEKS_IN_MONTH = 6;
  const DAYS_OF_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const CalendarStyles = {
    Borders: cn('border-neutral-300 dark:border-neutral-400'),
  };

  const startOfMonth = startOfMonthFn(monthDate);
  const daysInMonth = getDaysInMonth(monthDate);

  // create 2D matrix of calendar
  const calendar: Array<Array<string | null> | null> = (() => {
    let currentDay = 1;

    return new Array(MAX_WEEKS_IN_MONTH).fill(null).map(() => {
      if (currentDay > daysInMonth) return null;

      return DAYS_OF_WEEK_ORDER.map((dayOfWeek) => {
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

        return dayValue ? `${dayValue < 10 ? '0' : ''}${dayValue}` : null;
      });
    });
  })();

  return (
    <div>
      {calendar.map((week, weekIdx) => {
        if (!week) return null;

        return (
          <div key={week.join(',')} className="w-full relative">
            {/* calendar grid */}
            <div
              className={cn(
                CalendarStyles.Borders,
                'min-h-24 flex flex-row border-b',
                weekIdx === 0 && 'border-t',
              )}
            >
              {week.map((day, dayIdx) => {
                const blackoutPeriodsForDay = day
                  ? blackoutPeriodsByDayDict[day] ?? []
                  : [];

                return (
                  <div
                    key={day}
                    className={cn(
                      CalendarStyles.Borders,
                      'flex-1 border-r',
                      dayIdx === 0 && 'border-l',
                      (() => {
                        if (day === null) {
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
                          if (dayIdx === 5 || dayIdx === 6) {
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
                      {day && <span>{Number(day)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* blackout periods on top of the calendar */}
            <BlackoutPeriods
              monthDate={monthDate}
              week={week}
              blackoutPeriodsByDayDict={blackoutPeriodsByDayDict}
            />
          </div>
        );
      })}
    </div>
  );
}

function BlackoutPeriods({
  monthDate,
  week,
  blackoutPeriodsByDayDict,
}: {
  monthDate: Date;
  week: Array<string | null>;
  blackoutPeriodsByDayDict: BlackoutPeriodsByDayDict;
}) {
  const getDayFromDateString = (dateString: string) =>
    Number(dateString.split('-')[2]);

  return week.map((day, dayIdx) => {
    const blackoutPeriodsForDay = day
      ? blackoutPeriodsByDayDict[day] ?? []
      : [];

    if (!day || blackoutPeriodsForDay.length === 0) return null;

    return (
      <div key={day}>
        {blackoutPeriodsForDay.map((period) => {
          const isFirstDayOfWeek = dayIdx === 0;
          const isStartOfPeriod =
            getDayFromDateString(period.from) === Number(day);

          // only render period bar when it's the period start,
          // or it's the first day of the week, i.e. period has overflowed from the previous week
          if (!isStartOfPeriod && !isFirstDayOfWeek) return null;

          const periodDuration = (() => {
            // period.from might be in the previous week/month, hence we override it when isFirstDayOfWeek=true
            const fromDate = isFirstDayOfWeek
              ? new Date(monthDate.setDate(Number(day)))
              : new Date(period.from);
            const toDate = new Date(period.to);
            return differenceInCalendarDays(toDate, fromDate) + 1;
          })();
          // prevent period bar from overflowing beyond the week
          const periodDurationToRender = Math.min(
            periodDuration,
            week.length - dayIdx,
          );
          const isPeriodOverflowingToNextWeek =
            periodDuration > periodDurationToRender;

          return (
            <div
              key={`${day}-${period.renderLevel}`}
              className={cn(
                'flex items-center absolute top-5 h-4',
                getFlightClassIndicatorColor({
                  flightClassCode: period.flightClass,
                }),
                isStartOfPeriod && 'rounded-l-md',
                !isPeriodOverflowingToNextWeek && 'rounded-r-md',
              )}
              style={{
                width: `calc(100% / 7 * ${periodDurationToRender})`,
                marginLeft: `calc(100% / 7 * ${dayIdx})`,
                marginTop: `calc(1.125rem * ${period.renderLevel})`, // h-4 + gap-0.5
              }}
            >
              {/* TODO: try to wrap text on small-width screens */}
              <p className="text-2xs text-amber-300 ml-0.5">
                {period.flightNos
                  .map((flightNo) => flightNo.replace('SQ', ''))
                  .join(',')}
              </p>
            </div>
          );
        })}
      </div>
    );
  });
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
