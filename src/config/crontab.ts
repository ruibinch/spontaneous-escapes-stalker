// just for documentation
const CRONTAB_CONFIG = [
  // every ~15mins from 7am to 12mn on weekdays
  '*/15 7-23 * * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v18.17.1/bin"; cd /home/pi/self/spontaneous-escapes-stalker && USE_DEBUG_CHANNEL=1 MAX_DELAY_SECS=300 yarn run:scrape-with-precheck > ~/self/spontaneous-escapes-stalker/debug.log',
  // release is usually out on 15th, so add an additional search every ~3mins from 15th till end of the month
  '*/3 7-23 15-31 * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v18.17.1/bin"; cd /home/pi/self/spontaneous-escapes-stalker && USE_DEBUG_CHANNEL=1 MAX_DELAY_SECS=60 yarn run:scrape-with-precheck > ~/self/spontaneous-escapes-stalker/debug.log',
];
