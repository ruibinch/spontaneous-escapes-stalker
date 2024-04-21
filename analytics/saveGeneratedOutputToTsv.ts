import fs from 'fs';
import path from 'path';
import { EventDatum, Session, WebsiteEvent } from './types';

export function saveGeneratedOutputToTsv<
  T extends Session | WebsiteEvent | EventDatum,
>(data: T[], filename: string) {
  // find datum with the most number of columns to use as the header
  // not the most foolproof way but works for this use case
  const datumIdxWithMaxCols = data.reduce((_datumIdxWithMaxCols, d, idx) => {
    return Object.keys(d).length >
      Object.keys(data[_datumIdxWithMaxCols]).length
      ? idx
      : _datumIdxWithMaxCols;
  }, 0);

  const keys = Object.keys(data[datumIdxWithMaxCols]) as (keyof T)[];
  console.log(`Headers: ${keys}`);
  const tsv = [
    keys.join('\t'),
    ...data.map((item) => keys.map((key) => item[key]).join('\t')),
  ].join('\r\n');

  const outputFilepath = path.join('analytics', 'output', filename);
  fs.writeFileSync(outputFilepath, tsv);
}
