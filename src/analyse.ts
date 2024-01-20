import fs from 'fs';
import { generateRouteAnalysis } from './analysis/generateRouteAnalysis';

const ROUTE_ANALYSIS_OUTPUT_FILENAME = 'data/route-analysis.json';

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
