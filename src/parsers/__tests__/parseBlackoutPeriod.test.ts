import { parseBlackoutPeriod } from '../parseBlackoutPeriod';

describe('parseBlackoutPeriod', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-12-01').getTime());
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it.each([
    [
      'single date entry',
      {
        input: '7 December 2023',
        expected: [{ from: '2023-12-07', to: '2023-12-07' }],
      },
    ],
    [
      'single date range entry',
      {
        input: '9 – 10 December 2023',
        expected: [{ from: '2023-12-09', to: '2023-12-10' }],
      },
    ],
    [
      'single date range entry, with month attached to both from/to dates',
      {
        input: '9 December – 10 December 2023',
        expected: [{ from: '2023-12-09', to: '2023-12-10' }],
      },
    ],
    [
      'single date range entry, with varying amounts of whitespace',
      {
        input: '2 - 3  November 2025',
        expected: [{ from: '2025-11-02', to: '2025-11-03' }],
      },
    ],
    [
      'single date range entry, with different months attached to both from/to dates',
      {
        input: '31 March – 15 April 2024',
        expected: [{ from: '2024-03-31', to: '2024-04-15' }],
      },
    ],
    [
      'many single date entries sharing a single month/year component',
      {
        input: '1, 2, 5, 8, 10 December 2023',
        expected: [
          { from: '2023-12-01', to: '2023-12-01' },
          { from: '2023-12-02', to: '2023-12-02' },
          { from: '2023-12-05', to: '2023-12-05' },
          { from: '2023-12-08', to: '2023-12-08' },
          { from: '2023-12-10', to: '2023-12-10' },
        ],
      },
    ],
    [
      'multiple date and date range entries',
      {
        input:
          '7 December 2023, 9 – 10 December 2023, 14 December 2023, 16 – 18 December 2023, 21 December 2023, 23 – 24 December 2023, 28 December 2023',
        expected: [
          { from: '2023-12-07', to: '2023-12-07' },
          { from: '2023-12-09', to: '2023-12-10' },
          { from: '2023-12-14', to: '2023-12-14' },
          { from: '2023-12-16', to: '2023-12-18' },
          { from: '2023-12-21', to: '2023-12-21' },
          { from: '2023-12-23', to: '2023-12-24' },
          { from: '2023-12-28', to: '2023-12-28' },
        ],
      },
    ],
    [
      'single date entry, split by a single flight number',
      {
        input: 'SQ874: 7 December 2023',
        expected: [
          { from: '2023-12-07', to: '2023-12-07', flightNos: ['SQ874'] },
        ],
      },
    ],
    [
      'single date entry, split by multiple flight numbers',
      {
        input: 'SQ874: 7 December 2023 SQ875: 11 December 2023',
        expected: [
          { from: '2023-12-07', to: '2023-12-07', flightNos: ['SQ874'] },
          { from: '2023-12-11', to: '2023-12-11', flightNos: ['SQ875'] },
        ],
      },
    ],
    [
      'single date range entry, split by a single flight number',
      {
        input: 'SQ20: 9 – 10 December 2023',
        expected: [
          { from: '2023-12-09', to: '2023-12-10', flightNos: ['SQ20'] },
        ],
      },
    ],
    [
      'single date range entry, split by multiple flight numbers',
      {
        input: 'SQ20: 9 – 10 December 2023 SQ21: 12 - 14 December 2023',
        expected: [
          { from: '2023-12-09', to: '2023-12-10', flightNos: ['SQ20'] },
          { from: '2023-12-12', to: '2023-12-14', flightNos: ['SQ21'] },
        ],
      },
    ],
    [
      'multiple date and date range entries, split by a single flight number',
      {
        input: 'SQ212: 1 ‐ 7 January 2024, 14 January 2024, 18 January 2024',
        expected: [
          { from: '2024-01-01', to: '2024-01-07', flightNos: ['SQ212'] },
          { from: '2024-01-14', to: '2024-01-14', flightNos: ['SQ212'] },
          { from: '2024-01-18', to: '2024-01-18', flightNos: ['SQ212'] },
        ],
      },
    ],
    [
      'multiple date and date range entries, split by multiple flight numbers',
      {
        input:
          'SQ212: 1 ‐ 7 January 2024, 14 January 2024, 18 January 2024 SQ232: 1 ‐ 11 January 2024, 14 January 2024, 27 ‐ 28 January 2024',
        expected: [
          { from: '2024-01-01', to: '2024-01-07', flightNos: ['SQ212'] },
          // prettier-ignore
          { from: '2024-01-14', to: '2024-01-14', flightNos: ['SQ212', 'SQ232'] },
          { from: '2024-01-18', to: '2024-01-18', flightNos: ['SQ212'] },
          { from: '2024-01-01', to: '2024-01-11', flightNos: ['SQ232'] },
          { from: '2024-01-27', to: '2024-01-28', flightNos: ['SQ232'] },
        ],
      },
    ],
    [
      '[special case] dates with missing years',
      {
        input: '14 January 2024, 18 - 21 January',
        expected: [
          { from: '2024-01-14', to: '2024-01-14' },
          { from: '2024-01-18', to: '2024-01-21' },
        ],
      },
    ],
    [
      '[special case] dates with missing whitespace around separator and random character variation at the end',
      {
        input: '14 January 2024, 18-21 January 2024,',
        expected: [
          { from: '2024-01-14', to: '2024-01-14' },
          { from: '2024-01-18', to: '2024-01-21' },
        ],
      },
    ],
    [
      '[special case] dates with random character variations',
      {
        input: '14 January 2024s, 30 March -2024',
        expected: [
          { from: '2024-01-14', to: '2024-01-14' },
          { from: '2024-03-30', to: '2024-03-30' },
        ],
      },
    ],
    [
      '[special case] dates with a typo in the month',
      {
        input: '26 Septmeber 2023',
        expected: [{ from: '2023-09-26', to: '2023-09-26' }],
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
