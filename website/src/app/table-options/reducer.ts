import { FlightClass } from '../..';

export interface TableOptionsState {
  flightClass: Record<FlightClass, boolean>;
  searchTerm: string;
}

export const tableOptionsInitialState: TableOptionsState = {
  flightClass: {
    Y: true,
    PY: true,
    J: true,
  },
  searchTerm: '',
};

export type TableOptionsAction =
  | {
      type: 'TOGGLE_FLIGHT_CLASS';
      payload: FlightClass;
    }
  | {
      type: 'UPDATE_SEARCH_TERM';
      payload: string;
    };

export function tableOptionsReducer(
  state: TableOptionsState,
  action: TableOptionsAction,
): TableOptionsState {
  const { type, payload } = action;

  switch (type) {
    case 'TOGGLE_FLIGHT_CLASS':
      return {
        ...state,
        flightClass: {
          ...state.flightClass,
          [payload]: !state.flightClass[payload],
        },
      };
    case 'UPDATE_SEARCH_TERM':
      return {
        ...state,
        searchTerm: payload,
      };
    default:
      return state;
  }
}
