import { format, formatISO } from 'date-fns';

// Date

export const currentDate = () => new Date(Date.now());

export const currentDateInYYYYMMDD = () => format(currentDate(), 'yyyyMMdd');

export const toDateISO8601 = (date: Date | number) =>
  formatISO(date, { representation: 'date' });

// e.g. 1 Jul 2023, 23 Aug 2023
export const formatDateDisplay = (date: Date) => format(date, 'd MMM yyyy');

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
