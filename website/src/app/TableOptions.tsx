import { Card, CardBody, Input } from '@nextui-org/react';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { FlightClass } from '.';
import { FlightClassChip } from './components/chips';
import { TableOptionsAction, TableOptionsState } from './tableOptionsReducer';
import useDebounce from './hooks/useDebounce';

export default function TableOptions({
  state,
  dispatch,
}: {
  state: TableOptionsState;
  dispatch: Dispatch<TableOptionsAction>;
}) {
  return (
    <div className="flex">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 justify-center w-full">
        <div className="lg:col-span-2">
          <Filters
            flightClass={state.flightClass}
            onToggleFlightClass={(flightClass) =>
              dispatch({ type: 'TOGGLE_FLIGHT_CLASS', payload: flightClass })
            }
          />
        </div>

        <div className="flex lg:col-span-1 items-end">
          <Search
            searchTerm={state.searchTerm}
            onChange={(searchTerm) =>
              dispatch({ type: 'UPDATE_SEARCH_TERM', payload: searchTerm })
            }
          />
        </div>
      </div>
    </div>
  );
}

function Filters({
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

function Search({
  searchTerm,
  onChange,
}: {
  searchTerm: string;
  onChange: (searchTerm: string) => void;
}) {
  const [value, setValue] = useState(searchTerm);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  useDebounce(
    () => {
      onChange(value.toLowerCase());
    },
    400,
    [value],
  );

  const onValueChange = (value: string) => {
    if (isSlashTrigger) {
      setSlashTrigger(false);
      return;
    }
    setValue(value);
  };

  useEffect(() => {
    function handleKeyDown(e: DocumentEventMap['keydown']) {
      if (e.key === '/') {
        setSlashTrigger(true);
        searchRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Input
      classNames={{
        input: 'w-full',
        mainWrapper: 'w-full',
      }}
      placeholder="Search"
      startContent={
        <kbd className="px-1.5 mr-1 bg-neutral-800 border rounded border-neutral-500 text-small text-foreground-500">
          /
        </kbd>
      }
      ref={searchRef}
      value={value}
      onValueChange={onValueChange}
    />
  );
}
