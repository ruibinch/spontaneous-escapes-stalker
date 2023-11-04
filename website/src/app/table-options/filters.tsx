import { Card, CardBody } from '@nextui-org/react';
import { CityIata, FlightClass } from '../..';
import { FlightClassChip } from '../../components/flight-class-chip';
import { TableOptionsState } from './reducer';
import { CityNameIataToggle } from './city-name-iata-toggle';
import { DateRangeSlider } from './date-range-slider';

interface FilterProps {
  flightClass: TableOptionsState['flightClass'];
  onToggleFlightClass: (flightClass: FlightClass) => void;
  cityIata: TableOptionsState['cityIata'];
  onToggleCityIata: (cityIata: CityIata) => void;
  dateRange: TableOptionsState['dateRange'];
  onToggleDateRange: (dateRange: [number, number]) => void;
}

export function Filters({
  flightClass,
  onToggleFlightClass,
  cityIata,
  onToggleCityIata,
  dateRange,
  onToggleDateRange,
}: FilterProps) {
  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4">
          <div>
            <div>
              <FlightClassChip
                flightClass="Y"
                highlight={flightClass.Y}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('Y')}
              />
              <span className="ml-2 text-sm cursor-default">Economy</span>
            </div>
            <div className="mt-2">
              <FlightClassChip
                flightClass="PY"
                highlight={flightClass.PY}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('PY')}
              />
              <span className="ml-2 text-sm cursor-default">
                Premium Economy
              </span>
            </div>
            <div className="mt-2">
              <FlightClassChip
                flightClass="J"
                highlight={flightClass.J}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('J')}
              />
              <span className="ml-2 text-sm cursor-default">Business</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 sm:gap-6">
            <CityNameIataToggle
              cityIata={cityIata}
              onToggleCityIata={onToggleCityIata}
            />

            <DateRangeSlider
              dateRange={dateRange}
              onToggleDateRange={onToggleDateRange}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
