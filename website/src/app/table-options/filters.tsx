import { Card, CardBody } from '@nextui-org/react';
import { CityIata, FlightClass } from '../..';
import { FlightClassChip } from '../../components/flight-class-chip';
import { CityNameIataToggle } from './city-name-iata-toggle';

interface FilterProps {
  flightClass: Record<FlightClass, boolean>;
  onToggleFlightClass: (flightClass: FlightClass) => void;
  cityIata: CityIata;
  onToggleCityIata: (cityIata: CityIata) => void;
}

export function Filters({
  flightClass,
  onToggleFlightClass,
  cityIata,
  onToggleCityIata,
}: FilterProps) {
  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4">
          <div>
            <div>
              <FlightClassChip
                flightClass="Y"
                highlight={flightClass.Y}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('Y')}
              />
              <span className="ml-2 cursor-default">Economy</span>
            </div>
            <div className="mt-2">
              <FlightClassChip
                flightClass="PY"
                highlight={flightClass.PY}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('PY')}
              />
              <span className="ml-2 cursor-default">Premium Economy</span>
            </div>
            <div className="mt-2">
              <FlightClassChip
                flightClass="J"
                highlight={flightClass.J}
                useStandardisedWidth
                onClick={() => onToggleFlightClass('J')}
              />
              <span className="ml-2 cursor-default">Business</span>
            </div>
          </div>

          <div>
            <CityNameIataToggle
              cityIata={cityIata}
              onToggleCityIata={onToggleCityIata}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
