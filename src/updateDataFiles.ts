import { commitAndPushDataDiffs } from './lib/git/commitAndPushDataDiffs';
import { copyDataFilesToS3Bucket } from './scripts/copyDataFilesToS3Bucket';
import { copyDataFilesToWebsiteFolder } from './scripts/copyDataFilesToWebsiteFolder';
import { deployWebsiteProd } from './scripts/deployWebsiteProd';
import { updateLatestRedemptionAtTimestamp } from './scripts/updateLatestRedemptionAtTimestamp';
import { log } from './utils/log';

/**
 * Updates the data files on the website and triggers a redeployment.
 *
 * @param redemptionMonth - YYYYMM of the redemption period
 * @param isNewRelease - If the redemption is a new release
 */
export async function updateDataFiles({
  redemptionMonth,
  isNewRelease,
}: {
  redemptionMonth: string;
  isNewRelease: boolean;
}) {
  log('\nCopying data files to website folder and S3 bucket...');
  await copyDataFilesToWebsiteFolder();
  await copyDataFilesToS3Bucket({ redemptionMonth });

  if (isNewRelease) {
    log('Updating website/src/static/.latest-redemption-at');
    updateLatestRedemptionAtTimestamp();
  }

  log('Committing and pushing data diffs...');
  const { hasDiffs } = await commitAndPushDataDiffs({ redemptionMonth, isNewRelease });
  if (!hasDiffs) {
    log('Skipping deployment')
    return;
  }

  // deploy website to prod
  log('Deploying website to prod...');
  await deployWebsiteProd();

  log('🚀 Deployment complete!');
}

// execute this manually to update files if manual intervention is required to resolve post-scraping/postprocessing/analysis errors
(async () => {
  if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      throw new Error(
        'Usage: run:update-data-files <redemptionMonth> <isNewRelease> (e.g. run:update-data-files 202506 true)',
      );
    }

    const redemptionMonth = args[0];
    const isNewRelease = args[1] === 'true';
    await updateDataFiles({ redemptionMonth, isNewRelease });
  }
})();
