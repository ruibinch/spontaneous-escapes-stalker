import fs from 'fs';
import path from 'path';
import { EventDatum, Session, WebsiteEvent } from './types';

export function saveGeneratedOutputToTsv<
  T extends Session | WebsiteEvent | EventDatum,
>(data: T[], filename: string) {
  const keys = Object.keys(data[0]) as (keyof T)[];
  const tsv = [
    keys.join('\t'),
    ...data.map((item) => keys.map((key) => item[key]).join('\t')),
  ].join('\r\n');

  const outputFilepath = path.join('analytics', 'output', filename);
  fs.writeFileSync(outputFilepath, tsv);
}
