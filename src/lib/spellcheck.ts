import Fuse from 'fuse.js';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function spellcheckMonth(s: string) {
  const fuse = new Fuse(months);
  const results = fuse.search(s, { limit: 1 });
  return results[0].item;
}
