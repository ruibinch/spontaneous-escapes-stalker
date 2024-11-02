import 'server-only';
import fs from 'fs';
import path from 'path';

/**
 * Gets a file from the /static folder.
 */
export function getStaticFileContent<T>({
  filename,
  filetype = 'json',
}: {
  filename: string;
  filetype?: 'string' | 'json';
}): T {
  const filepath = getStaticFilepath(filename);
  const file = fs.readFileSync(filepath, 'utf8');
  return filetype === 'json' ? (JSON.parse(file) as T) : (file as T);
}

export function getStaticFilepath(filename: string) {
  return path.join(process.cwd(), 'src', 'static', filename);
}
