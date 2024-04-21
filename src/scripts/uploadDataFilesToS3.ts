import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// uses default creds defined in ~/.aws
const client = new S3Client();
const BUCKET_NAME = 'kfseanalysis-assets';

/**
 * Uploads the relevant data files to S3 for fetching by the website:
 * - month-summary-analysis.json
 * - route-analysis.json
 * - All *-postprocessed.json for each month
 */
export async function uploadDataFilesToS3() {
  const dataFiles = fs.readdirSync('data');
  const dataFilesForUpload = dataFiles.filter(
    (filename) =>
      filename === 'month-summary-analysis.json' ||
      filename === 'route-analysis.json' ||
      filename.endsWith('postprocessed.json'),
  );

  for (const filename of dataFilesForUpload) {
    const filepath = path.join('data', filename);
    const fileContent = fs.readFileSync(filepath).toString();
    const params: PutObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileContent,
    };

    const command = new PutObjectCommand(params);
    try {
      await client.send(command);
      console.log(`🪣  Uploaded "${filename}" to ${BUCKET_NAME}`);
    } catch (error) {
      console.error(
        `🚨 Error uploading "${filename}": ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }
}

(async () => {
  if (!!process.env['UPLOAD_DATA_FILES']) {
    await uploadDataFilesToS3();
  }
})();
