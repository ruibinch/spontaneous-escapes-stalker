import { dataMonths } from '@/data';
import { CityIata, FlightClass } from '../..';

export interface TableOptionsState {
  flightClass: Record<FlightClass, boolean>;
  cityIata: CityIata;
  dateRange: [number, number];
  searchTerm: string;
}

export const tableOptionsInitialState: TableOptionsState = {
  flightClass: {
    Y: true,
    PY: true,
    J: true,
  },
  dateRange: [0, dataMonths.length - 1],
  cityIata: 'city',
  searchTerm: '',
};

export type TableOptionsAction =
  | {
      type: 'TOGGLE_FLIGHT_CLASS';
      payload: FlightClass;
    }
  | {
      type: 'TOGGLE_CITY_IATA';
      payload: CityIata;
    }
  | {
      type: 'TOGGLE_DATE_RANGE';
      payload: [number, number];
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
    case 'TOGGLE_CITY_IATA':
      return {
        ...state,
        cityIata: payload,
      };
    case 'TOGGLE_DATE_RANGE':
      return {
        ...state,
        dateRange: payload,
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
