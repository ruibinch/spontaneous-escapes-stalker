import fs from 'fs';
import path from 'path';
import { RedemptionJson } from './utils/types';
import { cleanupCityFields } from './postprocessing/cleanupCityFields';
import { standardiseRegionField } from './postprocessing/standardiseRegionField';
import { appendAndRemoveFields } from './postprocessing/appendAndRemoveFields';
import { removeRedemptionsMissingFromOagRoutesDataset } from './postprocessing/removeRedemptionsMissingFromOagRoutesDataset';
import { formatFlightNosField } from './postprocessing/formatFlightNosField';
import { combineRedemptionsForSameRoute } from './postprocessing/combineRedemptionsForSameRoute';

/**
 * Reads in the full list of redemptions.json files and generates a redemptions-postprocessed.json version.
 */
export function postprocessing() {
  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));
  const redemptionsOverrideFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions-override.json'));

  // Some months have a redemptions-override.json, which will take precedence over the base redemptions.json file
  const redemptionsFilenamesToReadFrom = (() => {
    const monthsUnique = Array.from(
      new Set([
        ...redemptionsFilenames.map((filename) => filename.split('-')[0]),
        ...redemptionsOverrideFilenames.map(
          (filename) => filename.split('-')[0],
        ),
      ]),
    );
    return [...monthsUnique].sort().map((month) => {
      const filenameToReadFromForMonth =
        redemptionsOverrideFilenames.find((overrideFilename) =>
          overrideFilename.startsWith(month),
        ) ??
        redemptionsFilenames.find((filename) => filename.startsWith(month));
      if (!filenameToReadFromForMonth) {
        throw new Error(`No redemption filename found for ${month}`);
      }
      return filenameToReadFromForMonth;
    });
  })();

  console.log('🧹 Postprocessing - cleaning up city fields');
  console.log('🧹 Postprocessing - standardising region fields');
  console.log('🧹 Postprocessing - formatting flightNos field');
  console.log('🧹 Postprocessing - appending and removing fields\n');

  console.log(
    `📖 Reading from the following files:\n${redemptionsFilenamesToReadFrom.join(
      '\n',
    )}\n`,
  );

  redemptionsFilenamesToReadFrom.forEach((filename) => {
    const month = filename.split('-')[0];
    const filepath = path.join('data', filename);
    const redemptionsFileString = fs.readFileSync(filepath).toString();
    const redemptions = JSON.parse(redemptionsFileString) as RedemptionJson[];

    const redemptionsPostprocessed1 = cleanupCityFields(redemptions);
    const redemptionsPostprocessed2 = combineRedemptionsForSameRoute(
      redemptionsPostprocessed1,
    );
    const redemptionsPostprocessed3 = standardiseRegionField(
      redemptionsPostprocessed2,
    );
    const redemptionsPostprocessed4 = formatFlightNosField(
      redemptionsPostprocessed3,
    );
    const redemptionsPostprocessed5 = appendAndRemoveFields({
      redemptions: redemptionsPostprocessed4,
      month,
    });
    const redemptionsPostprocessed6 =
      removeRedemptionsMissingFromOagRoutesDataset({
        redemptions: redemptionsPostprocessed5,
        month,
      });

    const redemptionPostprocessedFilename = `data/${month}-redemptions-postprocessed.json`;
    // console.log(`📄 Writing to ${redemptionPostprocessedFilename}`);
    fs.writeFileSync(
      redemptionPostprocessedFilename,
      JSON.stringify(redemptionsPostprocessed6, null, 2),
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
