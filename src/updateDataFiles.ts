import { commitAndPushDataDiffs } from './lib/git/commitAndPushDataDiffs';
import { copyDataFilesToWebsiteFolder } from './scripts/copyDataFilesToWebsiteFolder';
import { deployWebsiteProd } from './scripts/deployWebsiteProd';
import { updateLatestRedemptionAtTimestamp } from './scripts/updateLatestRedemptionAtTimestamp';
import { log } from './utils/log';

export async function updateDataFiles({
  isNewRelease,
}: {
  isNewRelease: boolean;
}) {
  log('\nCopying data files to website folder...');
  await copyDataFilesToWebsiteFolder();

  if (isNewRelease) {
    log('Updating website/src/static/.latest-redemption-at');
    updateLatestRedemptionAtTimestamp();
  }

  log('Committing and pushing data diffs...');
  await commitAndPushDataDiffs({ isNewRelease });

  // deploy website to prod
  log('Deploying website to prod...');
  await deployWebsiteProd();

  log('🚀 Deployment complete!');
}

// execute this manually to update files if manual intervention is required to resolve post-scraping/postprocessing/analysis errors
(async () => {
  if (require.main === module) {
    const args = process.argv.slice(2);
    const isNewRelease = args[0] ? args[0] === 'true' : true;
    await updateDataFiles({ isNewRelease });
  }
})();
