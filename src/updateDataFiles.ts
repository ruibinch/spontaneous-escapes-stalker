import { commitDataDiffs } from './lib/git/commitDataDiffs';
import { deployWebsiteProd } from './scripts/deployWebsiteProd';
import { updateWebsiteDataFiles } from './scripts/updateWebsiteDataFiles';

export async function updateDataFiles() {
  // copy data files to website folder
  await updateWebsiteDataFiles();

  // git commit and push
  await commitDataDiffs();

  // deploy website to prod
  await deployWebsiteProd();
}

// execute this manually to update files if manual intervention is required to resolve post-scraping/postprocessing/analysis errors
(async () => {
  if (require.main === module) {
    await updateDataFiles();
    console.log('Data files on website updated and deployed');
  }
})();
