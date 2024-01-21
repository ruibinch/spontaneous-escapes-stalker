import fs from 'fs';
import path from 'path';
import { RedemptionJson } from './utils/types';
import { cleanupCityFields } from './postprocessing/cleanupCityFields';
import { standardiseRegionField } from './postprocessing/standardiseRegionField';
import { appendAndRemoveFields } from './postprocessing/appendAndRemoveFields';

/**
 * Reads in the full list of redemptions.json files and generates a redemptions-postprocessed.json version.
 */
export function postprocessing() {
  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));

  console.log('🧹 Postprocessing - cleaning up city fields');
  console.log('🧹 Postprocessing - standardising region fields');
  console.log('🧹 Postprocessing - appending redemptionMonth field\n');

  redemptionsFilenames.forEach((filename) => {
    const filepath = path.join('data', filename);
    const month = filename.split('-')[0];
    const redemptionsFileString = fs.readFileSync(filepath).toString();
    const redemptions = JSON.parse(redemptionsFileString) as RedemptionJson[];

    const redemptionsPostprocessed1 = cleanupCityFields(redemptions);
    const redemptionsPostprocessed2 = standardiseRegionField(
      redemptionsPostprocessed1,
    );
    const redemptionsPostprocessed3 = appendAndRemoveFields({
      redemptions: redemptionsPostprocessed2,
      month,
    });

    const redemptionPostprocessedFilename = `data/${month}-redemptions-postprocessed.json`;
    console.log(`📄 Writing to ${redemptionPostprocessedFilename}`);
    fs.writeFileSync(
      redemptionPostprocessedFilename,
      JSON.stringify(redemptionsPostprocessed3, null, 2),
    );
  });
}

if (require.main === module) {
  try {
    postprocessing();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
