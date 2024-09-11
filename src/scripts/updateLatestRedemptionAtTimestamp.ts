import fs from 'fs';
import path from 'path';

/**
 * Saves the current datetime to website/src/static/.latest-redemption-at
 */
export function updateLatestRedemptionAtTimestamp() {
  const latestRedemptionAtFilepath = path.join(
    'website',
    'src',
    'static',
    '.latest-redemption-at',
  );
  fs.writeFileSync(latestRedemptionAtFilepath, new Date().toISOString());
}

(async () => {
  if (require.main === module) {
    updateLatestRedemptionAtTimestamp();
  }
})();
