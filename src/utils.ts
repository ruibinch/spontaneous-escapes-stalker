import { formatISO } from 'date-fns';

// Date

export const toDateISO8601 = (date: Date | number): string =>
  formatISO(date, { representation: 'date' });

// Misc

export const toCamelCase = (str: string) =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

export const toNumber = (str: string) => Number(str.replace(/\D/g, ''));

export const isAllDefined = (...vars: unknown[]) => vars.every(notEmpty);

const notEmpty = <T>(value: T | null | undefined): value is T => {
  if (value === null || value === undefined) return false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: T = value;
  return true;
};
