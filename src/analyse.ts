import fs from 'fs';
import path from 'path';
import { generateMonthSummaryAnalysis } from './analysis/generateMonthSummaryAnalysis';
import { generateRouteAnalysis } from './analysis/generateRouteAnalysis';
import { RedemptionJsonPostprocessed } from './utils/types';
import { appendMonthMetadata } from './analysis/appendMonthMetadata';
import { OagDataAnalysisEntry } from './scripts/generateOagData';
import { log } from './utils/log';

const ROUTE_ANALYSIS_OUTPUT_FILENAME = 'data/route-analysis.json';
const MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME =
  'data/month-summary-analysis.json';

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

  log(
    `\n🧮 Running analysis on ${redemptionsFilenames.length} redemption files...`,
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
  console.log(`📄 Writing to ${ROUTE_ANALYSIS_OUTPUT_FILENAME}`);
  fs.writeFileSync(
    ROUTE_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(routeAnalysis, null, 2),
  );
  console.log('📄 Writing to individual route files');
  routeAnalysis.forEach((routeAnalysisEntry) => {
    const routeFilename = `data/route-${routeAnalysisEntry.originIata}${routeAnalysisEntry.destinationIata}.json`;
    fs.writeFileSync(
      routeFilename,
      JSON.stringify(routeAnalysisEntry, null, 2),
    );
  });

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

  log(`🧮 Analysis complete`);
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
