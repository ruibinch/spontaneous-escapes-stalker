import { Card, CardBody } from '@nextui-org/react';
import { FlightClass } from '../..';
import { FlightClassChip } from '../../components/flight-class-chip';

export function Filters({
  flightClass,
  onToggleFlightClass,
}: {
  flightClass: Record<FlightClass, boolean>;
  onToggleFlightClass: (flightClass: FlightClass) => void;
}) {
  return (
    <Card>
      <CardBody>
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
      </CardBody>
    </Card>
  );
}
