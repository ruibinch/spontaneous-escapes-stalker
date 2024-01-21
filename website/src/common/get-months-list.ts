import routeAnalysisFile from '@/static/route-analysis.json';

/**
 * Returns the list of months present in the dataset.
 */
export function getMonthsList() {
  return Object.keys(routeAnalysisFile[0].details);
}
