import fs from 'fs';
import path from 'path';
import { appendMonthMetadata } from './analysis/appendMonthMetadata';
import { generateBlackoutPeriodsByRoute } from './analysis/generateBlackoutPeriodsByRoute';
import { generateMonthSummaryAnalysis } from './analysis/generateMonthSummaryAnalysis';
import { generateRouteAnalysis } from './analysis/generateRouteAnalysis';
import { OagDataAnalysisEntry } from './scripts/generateOagData';
import { RedemptionJsonPostprocessed } from './utils/types';

const ROUTE_ANALYSIS_OUTPUT_FILENAME = 'data/route-analysis.json';
const MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME =
  'data/month-summary-analysis.json';
const BLACKOUT_PERIODS_BY_ROUTE_OUTPUT_FILENAME =
  'data/blackout-periods-by-route.json';

export function analyse() {
  const oagDataAnalysisFileContent = fs
    .readFileSync('data/oag-data.json')
    .toString();
  const oagDataAnalysis = JSON.parse(
    oagDataAnalysisFileContent,
  ) as OagDataAnalysisEntry[];

  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions-postprocessed.json'));
  const months = redemptionsFilenames.map((filename) => filename.split('-')[0]);

  console.log(
    `🧮 Running analysis on ${redemptionsFilenames.length} redemption files\n`,
  );

  const redemptions: RedemptionJsonPostprocessed[] = [];
  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const redemptionsFileString = fs.readFileSync(filepath).toString();
    const _redemptions = JSON.parse(
      redemptionsFileString,
    ) as RedemptionJsonPostprocessed[];

    redemptions.push(..._redemptions);
  });

  const routeAnalysis = generateRouteAnalysis({
    redemptions,
    months,
    oagDataAnalysis,
  });
  console.log(`📄 Writing to ${ROUTE_ANALYSIS_OUTPUT_FILENAME}\n`);
  fs.writeFileSync(
    ROUTE_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(routeAnalysis, null, 2),
  );

  const monthSummaryAnalysis = generateMonthSummaryAnalysis({
    redemptions,
    months,
    oagDataAnalysis,
  });
  const monthSummaryAnalysisWithMetadata =
    appendMonthMetadata(monthSummaryAnalysis);
  console.log(`📄 Writing to ${MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME}\n`);
  fs.writeFileSync(
    MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(monthSummaryAnalysisWithMetadata, null, 2),
  );

  const blackoutPeriodsByRoute = generateBlackoutPeriodsByRoute({
    redemptions,
  });
  console.log(`📄 Writing to ${BLACKOUT_PERIODS_BY_ROUTE_OUTPUT_FILENAME}\n`);
  fs.writeFileSync(
    BLACKOUT_PERIODS_BY_ROUTE_OUTPUT_FILENAME,
    JSON.stringify(blackoutPeriodsByRoute, null, 2),
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
