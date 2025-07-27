// just for documentation
const CRONTAB_CONFIG = [
  // every ~30mins from 7am to 11pm on weekdays
  '*/30 7-22 * * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v22.15.0/bin"; cd /home/pi/self/spontaneous-escapes-stalker && MAX_DELAY_SECS=300 USE_PUPPETEER=1 npm run run:scrape-with-precheck',
  // release is usually out on 15th, so add an additional search every ~5mins from 15th till end of the month
  '*/5 7-22 15-31 * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v22.15.0/bin"; cd /home/pi/self/spontaneous-escapes-stalker && MAX_DELAY_SECS=80 USE_PUPPETEER=1 npm run run:scrape-with-precheck',
];
