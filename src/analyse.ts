import fs from 'fs';
import path from 'path';
import { generateMonthSummaryAnalysis } from './analysis/generateMonthSummaryAnalysis';
import { generateRouteAnalysis } from './analysis/generateRouteAnalysis';
import { appendRedemptionMonthField } from './analysis/helpers/appendRedemptionMonthField';
import { cleanupCityFields } from './analysis/helpers/cleanupCityFields';
import { standardiseRegionField } from './analysis/helpers/standardiseRegionField';
import { RedemptionJson, RedemptionJsonWithMonth } from './utils/types';

const ROUTE_ANALYSIS_OUTPUT_FILENAME = 'data/route-analysis.json';
const MONTH_SUMMARY_ANALYSIS_OUTPUT_FILENAME =
  'data/month-summary-analysis.json';

export function analyse() {
  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));
  const months = redemptionsFilenames.map((filename) => filename.split('-')[0]);

  console.log(
    `🧮 Running analysis on ${redemptionsFilenames.length} redemption files\n`,
  );

  console.log('🧹 Preprocessing - cleaning up city fields');
  console.log('🧹 Preprocessing - standardising region fields');
  console.log('🧹 Preprocessing - appending redemptionMonth field\n');
  const redemptions: RedemptionJsonWithMonth[] = [];
  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsFileString = fs.readFileSync(filepath).toString();
    const redemptionsPrecleaned = JSON.parse(
      redemptionsFileString,
    ) as RedemptionJson[];

    const redemptionsCleaned1 = cleanupCityFields(redemptionsPrecleaned);
    const redemptionsCleaned2 = standardiseRegionField(redemptionsCleaned1);
    const redemptionsCleaned3 = appendRedemptionMonthField({
      redemptions: redemptionsCleaned2,
      month,
    });
    redemptions.push(...redemptionsCleaned3);
  });

  const routeAnalysis = generateRouteAnalysis({ redemptions, months });
  console.log(`📄 Writing to ${ROUTE_ANALYSIS_OUTPUT_FILENAME}`);
  fs.writeFileSync(
    ROUTE_ANALYSIS_OUTPUT_FILENAME,
    JSON.stringify(routeAnalysis, null, 2),
  );

  const monthSummaryAnalysis = generateMonthSummaryAnalysis({
    redemptions,
    months,
  });
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
