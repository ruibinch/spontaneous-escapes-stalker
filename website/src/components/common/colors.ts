import { FlightClass } from '@/index';

export const flightClassColors: Record<FlightClass, string> = {
  Y: '#16a34a', // green-600
  W: '#2563eb', // blue-600
  J: '#b91c1c', // red-700
};

export const regionColors = {
  'South East Asia': '#84cc16', // lime-500
  'North Asia': '#22d3ee', // cyan-400
  'South Asia': '#713f12', // yellow-900
  'Middle East & Africa': '#fcd34d', // amber-300
  'Southwest Pacific': '#c026d3', // fuchsia-600
  Europe: '#1d4ed8', // blue-700
  'North America': '#ef4444', // red-500
};

export const opacityPctToHex = {
  '0': '00',
  '5': '0C',
  '10': '19',
  '15': '26',
  '20': '33',
  '25': '3F',
  '30': '4C',
  '35': '59',
  '40': '66',
  '45': '72',
  '50': '7F',
  '55': '8C',
  '60': '99',
  '65': 'A5',
  '70': 'B2',
  '75': 'BF',
  '80': 'CC',
  '85': 'D8',
  '90': 'E5',
  '95': 'F2',
  '100': 'FF',
};
