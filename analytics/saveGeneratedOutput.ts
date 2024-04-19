import fs from 'fs';
import path from 'path';
import { Session, WebsiteEvent } from './types';

export function saveGeneratedOutput<T extends Session | WebsiteEvent>(
  data: T[],
  filename: string,
) {
  const keys = Object.keys(data[0]) as (keyof T)[];
  const csv = [
    keys.join(','),
    ...data.map((item) => keys.map((key) => item[key]).join(',')),
  ].join('\r\n');

  const outputFilepath = path.join('analytics', 'output', filename);
  fs.writeFileSync(outputFilepath, csv);
}
