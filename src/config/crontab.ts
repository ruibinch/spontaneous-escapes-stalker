// just for documentation
const CRONTAB_CONFIG = [
  // every 15mins from 1st to 14th of month
  '*/15 7-22 1-14 * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v18.17.1/bin"; cd /home/pi/self/spontaneous-escapes-stalker && USE_DEBUG_CHANNEL=1 MAX_DELAY_SECS=300 yarn run:scrape-with-precheck > ~/self/spontaneous-escapes-stalker/debug.log',
  // release is usually out on 15th, so increase frequency to every 5mins from 15th to 31st of month
  '*/5 7-22 15-31 * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v18.17.1/bin"; cd /home/pi/self/spontaneous-escapes-stalker && USE_DEBUG_CHANNEL=1 MAX_DELAY_SECS=60 yarn run:scrape-with-precheck > ~/self/spontaneous-escapes-stalker/debug.log',
];
