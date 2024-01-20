import fs from 'fs';
import { generateRouteAnalysis } from './analysis/generateRouteAnalysis';
import { generateMonthSummaryAnalysis } from './analysis/generateMonthSummaryAnalysis';

const ROUTE_ANALYSIS_OUTPUT_FILENAME = 'data/route-analysis.json';
const MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME =
  'data/month-summary-analysis.json';

export function analyse() {
  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));

  console.log(
    `🧮 Running analysis on ${redemptionsFilenames.length} redemption files\n`,
  );

  const routeAnalysis = generateRouteAnalysis(redemptionsFilenames);
  console.log(`📄 Writing to ${ROUTE_ANALYSIS_OUTPUT_FILENAME}`);
  fs.writeFileSync(
    ROUTE_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(routeAnalysis, null, 2),
  );

  const monthSummaryAnalysis =
    generateMonthSummaryAnalysis(redemptionsFilenames);
  console.log(`📄 Writing to ${MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME}`);
  fs.writeFileSync(
    MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(monthSummaryAnalysis, null, 2),
  );
}

if (require.main === module) {
  try {
    analyse();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
