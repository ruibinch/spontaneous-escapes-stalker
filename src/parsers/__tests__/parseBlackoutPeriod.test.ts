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
