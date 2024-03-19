import fs from 'fs';
import path from 'path';
import { appendAndRemoveFields } from './postprocessing/appendAndRemoveFields';
import { cleanupCityFields } from './postprocessing/cleanupCityFields';
import { combineRedemptionsForSameRoute } from './postprocessing/combineRedemptionsForSameRoute';
import { formatFlightNosField } from './postprocessing/formatFlightNosField';
import { mergeRedemptionsWithBaseSet } from './postprocessing/mergeRedemptionsWithBaseSet';
import { removeRedemptionsMissingFromOagRoutesDataset } from './postprocessing/removeRedemptionsMissingFromOagRoutesDataset';
import { standardiseRegionField } from './postprocessing/standardiseRegionField';
import { RedemptionJson } from './utils/types';

/**
 * Reads in the full list of redemptions.json files and generates a redemptions-postprocessed.json version.
 */
export function postprocessing() {
  const redemptionsFilenames = fs
    .readdirSync('data')
    .filter((filename) => filename.endsWith('redemptions.json'));

  console.log(
    '🧹 Postprocessing - merging redemptions with base set, if applicable',
  );
  console.log('🧹 Postprocessing - cleaning up city fields');
  console.log('🧹 Postprocessing - combining redemptions for the same route');
  console.log('🧹 Postprocessing - standardising region fields');
  console.log('🧹 Postprocessing - formatting flightNos field');
  console.log('🧹 Postprocessing - appending and removing fields');
  console.log(
    '🧹 Postprocessing - removing redemptions missing from OAG dataset\n',
  );

  redemptionsFilenames.forEach((filename) => {
    const month = filename.split('-')[0];
    const { redemptions: _redemptions, redemptionsBase } =
      getRedemptionsFilesForMonth(month);

    const redemptions = mergeRedemptionsWithBaseSet({
      month,
      redemptions: _redemptions,
      redemptionsBase,
    });
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
    fs.writeFileSync(
      redemptionPostprocessedFilename,
      JSON.stringify(redemptionsPostprocessed6, null, 2),
    );
  });
}

/**
 * There are 3 types of redemptions files:
 * 1. {{month}}-redemptions.json
 *   - output from scraping the HTML page
 *   - this would be the only file present in a happy flow
 * 2. {{month}}-redemptions-override.json
 *   - output from parsing an override TSV file
 *   - this is used when no HTML page is present, or when manual corrections need to be made for the redemptions list
 * 3. {{month}}-redemptions-base.json
 *   - a base set of redemptions existing from a previous release, that the current month's redemptions list would append to
 *   - this is used for releases where the travel period spans more than 1 month
 */
function getRedemptionsFilesForMonth(month: string) {
  const redemptionsBase = (() => {
    const baseFilepath = path.join('data', `${month}-redemptions-base.json`);
    if (!fs.existsSync(baseFilepath)) return null;
    return JSON.parse(
      fs.readFileSync(baseFilepath).toString(),
    ) as RedemptionJson[];
  })();

  const redemptionsOverride = (() => {
    const overrideFilepath = path.join(
      'data',
      `${month}-redemptions-override.json`,
    );
    if (!fs.existsSync(overrideFilepath)) return null;
    return JSON.parse(
      fs.readFileSync(overrideFilepath).toString(),
    ) as RedemptionJson[];
  })();

  const redemptionsFilepath = path.join('data', `${month}-redemptions.json`);
  const redemptions = JSON.parse(
    fs.readFileSync(redemptionsFilepath).toString(),
  ) as RedemptionJson[];

  return {
    redemptions: redemptionsOverride ?? redemptions,
    redemptionsBase,
  };
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
