import { monthNumToShortNameMap } from '@/common/months-map';
import { flightClassCodeToName } from './flight-class-code-to-name';
import { FlightClassIndicator } from './flight-class-indicator';

export function renderFlightClassCell({
  flightClass,
  flightClassCode,
}: {
  flightClass?: string;
  flightClassCode?: string;
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <FlightClassIndicator
        flightClass={flightClass}
        flightClassCode={flightClassCode}
      />
      {flightClassCode ? flightClassCodeToName[flightClassCode] : flightClass}
    </div>
  );
}

export function renderBlackoutPeriodCell(
  blackoutPeriod: Array<{
    from: string;
    to: string;
    flightNos?: string[];
  }>,
) {
  if (blackoutPeriod.length === 0) return '-';

  return blackoutPeriod.map(({ from, to, flightNos }) => {
    const fromFormatted = `${from.slice(8, 10)} ${
      monthNumToShortNameMap[from.slice(5, 7)]
    }`;
    const toFormatted = `${to.slice(8, 10)} ${
      monthNumToShortNameMap[to.slice(5, 7)]
    }`;
    const blackoutPeriodFormatted =
      from === to ? fromFormatted : `${fromFormatted} - ${toFormatted}`;

    return (
      <div key={`${from}-${to}`}>
        {flightNos && `${flightNos.join('/')}: `}
        {blackoutPeriodFormatted}
      </div>
    );
  });
}
