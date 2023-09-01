<a href='#'><img align="left" width="15%" alt="SIA logo" src="./assets/sia.png" /></a>

Stalker of the latest KrisFlyer Spontaneous Escapes offers and analyser of past redemptions.

<br/>

# Components

## Scraper

The scraper lives in `src/scrape.ts` (`run:scrape`) - it handles the scraping of the SE page, parses it into the list of redemptions and uploads them to AWS DDB.

The detailed scraping logic is as follows:

- Scrapes the SE page and parses the information into an array of `Redemption` objects with the accompanying redemption period
- Checks AWS DDB if the redemption period already exists; if yes, it pulls the list of redemptions saved for that period and compares with the latest scraped data if there are any changes
- If no new additions/changes, the script terminates
- If there are additions/changes, the HTML/JSON files are saved locally and the `Redemption`/`RedemptionPeriod` objects are saved to DDB
- A Telegram notification will be sent detailing the latest changes in the SE offers

2 DDB tables are used to store the redemption information:

1. `Redemption`

   - contains the details for a single redemption (e.g. origin, destination, miles required, blackout period)

1. `RedemptionPeriod`
   - contains metadata for a redemption period, i.e. redemption end date and travel period

This file execution accepts the following optional environment variables:

| Env var             | Purpose                                                                                                              | Example                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `USE_AWS`           | Whether to connect to AWS DDB or check local /data folder (default)                                                  | `USE_AWS=1`                              |
| `RUN_POST_ANALYSIS` | Whether to run post-analysis to update the analysis CSVs if new redemptions are found                                | `RUN_POST_ANALYSIS=1`                    |
| `USE_DEBUG_CHANNEL` | Whether to send messages to the debug Telegram channel, if ID is specified                                           | `USE_DEBUG_CHANNEL=1`                    |
| `HTML_FILEPATH`     | Specify a HTML file to read from instead of scraping the live SE page; useful for scraping past versions of the page | `HTML_FILEPATH=data/202306-content.html` |
| `BASIC_RUN`         | Performs a basic scrape of the HTML page and saves the HTML/JSON files locally without interacting with AWS          | `BASIC_RUN=1`                            |

### Scraper with pre-check

The `src/scrapeWithPrecheck.ts` file (`run:scrape-with-precheck`) is an extension of the scraper file.

It performs a simple check to ensure that the redemptions for next month are not yet published (by checking the JSON files in the `/data` folder) before attempting to scrape the live SE page. This helps to avoid unnecessary calls to the SE page.

## Analyser

The analyser lives in `src/analyse.ts` (`run:analyse`) - it parses through all past redemptions (starting from May 2022) and publishes to a GSheet detailing the redemption history of a single flight route.

The detailed analysis logic is as follows:

- Reads the redemption JSON files in the `/data` folder
- An entry in a dict is added for each flight route, for each month, for each flight class
- This info is then consolidated in a CSV for each flight class, where the header row comprises of the city name and the list of months, and each row entry details a single flight route and the occurrence of SE offers in each month
- Each CSV is sorted by:
  - SG outbound flights
  - SG inbound flights
  - All other flights in alphabetical order of origin

> Analysis GSheet: <br/> https://docs.google.com/spreadsheets/d/1ljTgXf33-fO3IGfmZTkwVYpHTL7cof_Ayy6I2pME8KI/edit#gid=0

# Deployment

This is being deployed on a local Raspberry Pi, where a cronjob checks for new redemptions and then updates the analysis sheet when a new redemption period has been launched.

- A cronjob executing the `run:scrape-with-precheck` script runs **every 15 minutes** from **7am-8pm SGT** on **Mondays through Fridays** ([reference](https://crontab.guru/#*/15_7-19_*_*_1-5))
  - `*/15 7-19 * * 1-5 export PATH="$PATH:/home/pi/.nvm/versions/node/v18.17.1/bin"; cd /home/pi/self/spontaneous-escapes-stalker && RUN_POST_ANALYSIS=1 USE_DEBUG_CHANNEL=1 yarn run:scrape-with-precheck`
- When a new redemption period is launched, the scraper script handles the upload to AWS DDB; additionally, the corresponding HTML and JSON files are committed and pushed via a GL access token
- The analyser script is then triggered to update the analysis GSheet with the details of the new redemption period
