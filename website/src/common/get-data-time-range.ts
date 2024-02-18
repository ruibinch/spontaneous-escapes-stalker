import routeAnalysisFile from '@/static/route-analysis.json';

/**
 * Returns the list of months present in the dataset.
 */
export function getMonthsList() {
  return routeAnalysisFile[0].details.map(({ month }) => month);
}

/**
 * Returns the list of years present in the dataset.
 * 2021 is manually added as there were no offers during the Covid period.
 */
export function getYearsList() {
  const monthsList = getMonthsList();
  const yearsSet = monthsList.reduce((_yearsSet, yyyymm) => {
    _yearsSet.add(yyyymm.slice(0, 4));
    return _yearsSet;
  }, new Set<string>(['2021']));
  return [...Array.from(yearsSet)].sort();
}
