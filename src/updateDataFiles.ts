import { commitDataDiffs } from './lib/git/commitDataDiffs';
import { deployWebsiteProd } from './scripts/deployWebsiteProd';
import { updateWebsiteDataFiles } from './scripts/updateWebsiteDataFiles';
import { log } from './utils/log';

export async function updateDataFiles({
  isNewRelease,
}: {
  isNewRelease: boolean;
}) {
  log('\nCopying data files to website folder...');
  await updateWebsiteDataFiles();

  log('Committing and pushing data diffs...');
  await commitDataDiffs({ isNewRelease });

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
