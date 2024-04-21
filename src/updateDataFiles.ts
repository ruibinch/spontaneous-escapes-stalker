import { commitDataDiffs } from './lib/git/commitDataDiffs';
import { deployWebsiteProd } from './scripts/deployWebsiteProd';
import { updateWebsiteDataFiles } from './scripts/updateWebsiteDataFiles';
import { uploadDataFilesToS3 } from './scripts/uploadDataFilesToS3';

export async function updateDataFiles() {
  // manually copy to website folder (to be removed)
  await updateWebsiteDataFiles();
  // upload files to S3
  await uploadDataFilesToS3();

  // commit to git
  await commitDataDiffs();

  // deploy website to prod (to be removed)
  await deployWebsiteProd();
}
