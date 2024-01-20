import { Slider, SliderStepMark } from '@nextui-org/react';
import { Dispatch, SetStateAction, useState } from 'react';

export interface DateRangeFilterProps {
  dateRange: [number, number];
  setDateRange: Dispatch<SetStateAction<[number, number]>>;
  monthsList: string[];
}

// Marks for the start and end dates will always be shown;
const NUM_MARKS_TO_SHOW = 5;

export function DateRangeFilter({
  dateRange,
  setDateRange,
  monthsList,
}: DateRangeFilterProps) {
  // update this when user is still dragging the thumb; only call setDateRange when user stops dragging
  const [dateRangeLocal, setDateRangeLocal] =
    useState<[number, number]>(dateRange);

  const formatMonthDisplay = (month: string) =>
    `${month.slice(0, 4)}-${month.slice(4, 6)}`;

  const marksInterval = Math.ceil(monthsList.length / (NUM_MARKS_TO_SHOW - 1));
  const marks = new Array(NUM_MARKS_TO_SHOW).fill(0).map((_, markIdx) => {
    const listIdx = Math.min(marksInterval * markIdx, monthsList.length - 1);
    return {
      value: listIdx,
      label: formatMonthDisplay(monthsList[listIdx]),
    };
  });

  return (
    // TODO: add modal with list of months
    <Slider
      label="Filter by date range"
      aria-label="Filter by date range"
      minValue={0}
      maxValue={monthsList.length - 1}
      step={1}
      showSteps
      marks={marks}
      renderValue={() => (
        <span className="text-small">{`${formatMonthDisplay(
          monthsList[dateRangeLocal[0]],
        )} to ${formatMonthDisplay(monthsList[dateRangeLocal[1]])}`}</span>
      )}
      value={dateRangeLocal}
      onChange={(value) => {
        setDateRangeLocal(to2Tuple(value));
      }}
      onChangeEnd={(value) => {
        setDateRange(to2Tuple(value));
      }}
      classNames={{
        labelWrapper: 'mb-1',
        label: 'text-small text-foreground-500',
        trackWrapper: 'px-2',
        mark: 'text-xs',
      }}
    />
  );
}

function to2Tuple<T>(value: T | T[]): [T, T] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error('Invalid array to tuple conversion');
  }
  return [value[0], value[1]];
}
