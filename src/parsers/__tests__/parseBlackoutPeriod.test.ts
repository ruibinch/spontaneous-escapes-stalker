import { parseBlackoutPeriod } from '../parseBlackoutPeriod';

describe('parseBlackoutPeriod', () => {
  it.each([
    [
      'single date entry',
      {
        input: '7 June 2023',
        expected: [{ from: '2023-06-07', to: '2023-06-07' }],
      },
    ],
    [
      'single date range entry',
      {
        input: '9 – 10 June 2023',
        expected: [{ from: '2023-06-09', to: '2023-06-10' }],
      },
    ],
    [
      'multiple date and date range entries',
      {
        input:
          '7 June 2023, 9 – 10 June 2023, 14 June 2023, 16 – 18 June 2023, 21 June 2023, 23 – 24 June 2023, 28 June 2023',
        expected: [
          { from: '2023-06-07', to: '2023-06-07' },
          { from: '2023-06-09', to: '2023-06-10' },
          { from: '2023-06-14', to: '2023-06-14' },
          { from: '2023-06-16', to: '2023-06-18' },
          { from: '2023-06-21', to: '2023-06-21' },
          { from: '2023-06-23', to: '2023-06-24' },
          { from: '2023-06-28', to: '2023-06-28' },
        ],
      },
    ],
    [
      'single date entry, split by a single flight number',
      {
        input: 'SQ874: 7 June 2023',
        expected: [
          { from: '2023-06-07', to: '2023-06-07', flightNos: ['SQ874'] },
        ],
      },
    ],
    [
      'single date entry, split by multiple flight numbers',
      {
        input: 'SQ874: 7 June 2023 SQ875: 11 June 2023',
        expected: [
          { from: '2023-06-07', to: '2023-06-07', flightNos: ['SQ874'] },
          { from: '2023-06-11', to: '2023-06-11', flightNos: ['SQ875'] },
        ],
      },
    ],
    [
      'single date range entry, split by a single flight number',
      {
        input: 'SQ20: 9 – 10 June 2023',
        expected: [
          { from: '2023-06-09', to: '2023-06-10', flightNos: ['SQ20'] },
        ],
      },
    ],
    [
      'single date range entry, split by multiple flight numbers',
      {
        input: 'SQ20: 9 – 10 June 2023 SQ21: 12 - 14 June 2023',
        expected: [
          { from: '2023-06-09', to: '2023-06-10', flightNos: ['SQ20'] },
          { from: '2023-06-12', to: '2023-06-14', flightNos: ['SQ21'] },
        ],
      },
    ],
    [
      'multiple date and date range entries, split by a single flight number',
      {
        input: 'SQ212: 1 ‐ 7 July 2023, 14 July 2023, 18 July 2023',
        expected: [
          { from: '2023-07-01', to: '2023-07-07', flightNos: ['SQ212'] },
          { from: '2023-07-14', to: '2023-07-14', flightNos: ['SQ212'] },
          { from: '2023-07-18', to: '2023-07-18', flightNos: ['SQ212'] },
        ],
      },
    ],
    [
      'multiple date and date range entries, split by multiple flight numbers',
      {
        input:
          'SQ212: 1 ‐ 7 July 2023, 14 July 2023, 18 July 2023 SQ232: 1 ‐ 11 July 2023, 14 July 2023, 27 ‐ 28 July 2023',
        expected: [
          { from: '2023-07-01', to: '2023-07-07', flightNos: ['SQ212'] },
          // prettier-ignore
          { from: '2023-07-14', to: '2023-07-14', flightNos: ['SQ212', 'SQ232'] },
          { from: '2023-07-18', to: '2023-07-18', flightNos: ['SQ212'] },
          { from: '2023-07-01', to: '2023-07-11', flightNos: ['SQ232'] },
          { from: '2023-07-27', to: '2023-07-28', flightNos: ['SQ232'] },
        ],
      },
    ],
    [
      'dash variation 1',
      {
        input: '-',
        expected: [],
      },
    ],
    [
      'dash variation 2',
      {
        input: '‐',
        expected: [],
      },
    ],
  ])(
    'should parse blackout period correctly for %s',
    (_description, { input, expected }) => {
      const blackoutPeriods = parseBlackoutPeriod(input);
      expect(blackoutPeriods).toEqual(expected);
    },
  );
});
