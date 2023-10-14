import { Dispatch } from 'react';
import { Filters } from './filters';
import { TableOptionsAction, TableOptionsState } from './reducer';
import { Search } from './search';

export function TableOptions({
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
            cityIata={state.cityIata}
            onToggleCityIata={(cityIata) =>
              dispatch({ type: 'TOGGLE_CITY_IATA', payload: cityIata })
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
