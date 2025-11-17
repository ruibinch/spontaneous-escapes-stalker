import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';

const S3_BUCKET = 'kfseanalysis-assets';
const s3Client = new S3Client({
  region: 'ap-southeast-1',
});

/**
 * Copies files from the data folder to the S3 bucket, in the format of {{yyyymm}}-redemptions-postprocessed.json
 *
 * Only supports the month redemption file for now.
 */
export async function copyDataFilesToS3Bucket({
  redemptionMonth,
}: {
  redemptionMonth: string;
}) {
  const filename = `${redemptionMonth}-redemptions-postprocessed.json`;

  const fileContent = fs.readFileSync(`data/${filename}`).toString();
  const fileContentMinified = JSON.stringify(JSON.parse(fileContent));

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: filename,
    Body: fileContentMinified,
    CacheControl: 'max-age=86400,public',
    ContentType: 'application/json',
  });
  await s3Client.send(command);
}
