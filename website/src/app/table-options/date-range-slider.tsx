import { dataMonths } from '@/data';
import { Slider, SliderStepMark } from '@nextui-org/react';
import { TableOptionsState } from './reducer';

export function DateRangeSlider({
  dateRange,
  onToggleDateRange,
}: {
  dateRange: TableOptionsState['dateRange'];
  onToggleDateRange: (dateRange: [number, number]) => void;
}) {
  // only show marks for Jan/Jul months
  const marks = dataMonths.reduce((_marks: SliderStepMark[], month, idx) => {
    if (/(01|07)$/.test(month)) {
      _marks.push({
        value: idx,
        label: `${month.slice(0, 4)}-${month.slice(4, 6)}`,
      });
    }
    return _marks;
  }, []);

  return (
    <Slider
      aria-label="Select filter date range"
      minValue={0}
      maxValue={dataMonths.length - 1}
      step={1}
      showSteps
      marks={marks}
      color="primary"
      value={dateRange}
      onChange={(value) => {
        onToggleDateRange(to2Tuple(value));
      }}
      classNames={{
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
