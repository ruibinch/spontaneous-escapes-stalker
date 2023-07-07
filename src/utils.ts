import { format, formatISO, parse } from 'date-fns';

// Date

export const currentDate = () => new Date(Date.now());

export const currentDateInYYYYMMDD = () => format(currentDate(), 'yyyyMMdd');

export const dateInYYYYMM = (date: Date) => format(date, 'yyyyMM');

export const toDateISO8601 = (date: Date | number) =>
  formatISO(date, { representation: 'date' });

// e.g. output: 1 Jul 2023, 23 Aug 2023
export const formatDateDisplay = (date: Date) => format(date, 'd MMM yyyy');

// e.g. input: 1 March 2023, 28 June 2023
export const parseDateString = (dateString: string) =>
  parse(dateString, 'd MMMM yyyy', new Date());

// Misc

export const toCamelCase = (str: string) =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

export const toNumber = (str: string) => Number(str.replace(/\D/g, ''));

export const isAllDefined = (...vars: unknown[]) => vars.every(notEmpty);

export const notEmpty = <T>(value: T | null | undefined): value is T => {
  if (value === null || value === undefined) return false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: T = value;
  return true;
};
