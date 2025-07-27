<a href='#'><img align="left" width="15%" alt="KrisFlyer SEAT" src="./assets/logo.png" /></a>

Stalker of the latest KrisFlyer Spontaneous Escapes offers and analyser of past redemptions.

<br/><br/><br/>

This project comprises of 2 components:

1. Scraper

   - **Scrapes** the [KrisFlyer Spontaneous Escapes page](https://www.singaporeair.com/en_UK/sg/plan-travel/promotions/global/kf/kf-promo/kfescapes/), converting the list of published redemptions into a JSON structure, where each entry represents each unique origin/destination/flightclass combination for that month
   - **Postprocessing** is then performed on the parsed list for standardisation of entry fields
   - Finally, the **analysis** step runs to generate analytical insights of the dataset by month and route

1. KrisFlyer Spontaneous Escapes Analysis Tool (SEAT) website

   - The postprocessed list of redemptions, along with the analysis, is consolidated and presented in an easily accessible and searchable format with accompanying charts
   - Refer to the [website's README](./website/README.md) for more details

# Scraper

This section details the 3 sub-components under the scraper component - scraping, postprocessing, analysis.

## Scraping

The scraper lives in `src/scrape.ts` (`npm run run:scrape`) and leverages on the parsers defined under `src/parsers`.

The scraping flow runs as follows:

- Parses the list of redemption tables on the SE page into an array of `RedemptionTableInfo` objects with the accompanying redemption period (more information in the [Parsers](#parsers) section below)
- If there are new redemptions in the dataset, a check is done on whether the redemption period already exists
  - If yes, it is an update of an existing release. This occurs rarely; typically for minor use cases like fixing a typo.
  - If no, it is a new release (which is what people are looking out for). This sends a notification to the [KFSpontaneousEscapes Telegram channel](https://t.me/kfspontaneousescapes) detailing the latest redemptions.
- The scraped HTML and parsed JSON files are saved. The postprocessing and analysis steps then execute to generate a postprocessed JSON file, as well as updating the existing route/month analysis JSON files.

This file execution accepts the following optional environment variables:

| Env var                                | Purpose                                                                                                                                                         | Example                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `USE_PUPPETEER`                        | Whether to scrape the site using Puppeteer or via a basic HTTP request (see `src/loadHtml.ts`)                                                                  | `USE_PUPPETEER=1`                                     |
| `PUPPETEER_EXECUTABLE_PATH`            | If using Puppeteer, an executable path can be specified instead of relying on Puppeteer's default behaviour of downloading a Chromium executable under the hood | `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` |
| `HTML_FILEPATH`                        | Specify a HTML file to read from instead of scraping the live SE page; useful for scraping past versions of the page                                            | `HTML_FILEPATH=data/202306-content.html`              |
| `USE_AWS`                              | Checks are done against the local `/data` folder as a DB by default, but can also be integrated with AWS DynamoDB                                               | `USE_AWS=1`                                           |
| `BASIC_RUN`                            | Only saves the HTML/JSON files after scraping without any subsequent actions                                                                                    | `BASIC_RUN=1`                                         |
| `SEND_REDEMPTIONS_CHANGE_NOTIFICATION` | Updates to an existing redemption period are not notified to the Telegram channel by default to prevent false/irrelevant alerts; use this flag to override      | `SEND_REDEMPTIONS_CHANGE_NOTIFICATION=1`              |

### Scraper with pre-check

The `src/scrapeWithPrecheck.ts` file (`npm run run:scrape-with-precheck`) is an extension of the scraper file.

It performs a simple check to ensure that the redemptions for next month are not yet published (by checking the JSON files in the `/data` folder) before attempting to scrape the live SE page. This helps to avoid unnecessary calls to the SE page.

### Parsers

The parsers are utilised by the scraper to extract the following information from the page:

- List of redemptions (`src/parsers/parseRedemptionTablesV2.ts`)
  - Identifies the redemption tables via HTML tags, and goes through each table row-by-row to extract the redemptions data
  - Parsing of the redemption's blackout period is a sufficiently complex process to warrant its own file (`src/parsers/parseBlackoutPeriod.ts`)
- Valid travel period (`src/parsers/parseRedemptionTravelPeriod.ts`)
  - Published redemptions will typically be valid for only the next month, e.g. redemptions published on 15 Jun 2025 will be for flights in the month of Jul 2025
- End date of redemption period (`src/parsers/parseRedemptionEndDate.ts`)
  - Typically runs till the end of the month, e.g. redemptions published on 15 Jun 2025 will be valid till 30 Jun 2025

The other parsers in the `src/parsers` folder are either deprecated or used for specific purposes:

- `src/parsers/parseRedemptionTablesV1.ts`
  - Old method of parsing the redemption tables that was made redundant upon a layout change of the SE page in Dec 2024
- `src/parsers/parseFromTsvFile.ts`
  - Primarily used for backfilling of redemptions in historical months where no archived version of the SE page was available on Wayback Machine, thus requiring a manual population of the redemptions list in a TSV file in a specific format
  - Refer to the `.tsv` files in the `/data` folder for reference

## Postprocessing

The postprocessing step lives in `src/postprocessing.ts` (`npm run run:postprocessing`), with the individual postprocessing steps in the `src/postprocessing` folder.

There are 9 postprocessing steps in total:

1. Merging of redemptions with a base set

   - For redemptions with a travel period spanning more than 1 month, the set of redemptions in the 2nd month needs to be manually augmented to also take the redemptions published 2 months prior into account

1. Cleaning up city names

   - Fixes any typos and inconsistent namings in the city names
   - Combines cities with multiple airports together, e.g. "Tokyo (Haneda)" and "Tokyo (Narita)" are consolidated to "Tokyo"

1. Standardising `region` field

   - SIA has associated the same route to different region names over the years (e.g. "Australia"/"Southwest Pacific"), which need to be standardised to a common set

1. Formatting of `flightNos` field

   - Standardises the delimiter used in the field to `,`

1. Formatting and combining of `blackoutPeriods` field

   - More details in `src/postprocessing/formatAndCombineOverlappingBlackoutPeriods.ts`

1. Computing blackout percentage

   - Divides the total number of blackout days for all flights by the total number of days in the month for all flights

1. Appending additional fields and removing redundant fields

   - Additional fields include airport IATA code and country to facilitate searching

1. Removing redemptions missing from OAG route dataset (only applicable for months with corresponding entries from OAG)

   - For some months, we have route network data from OAG. In some of these months, there are redemptions that do not correspond to any entry in the OAG dataset, which is impossible if the OAG dataset is 100% accurate.
   - We assume the accuracy of the OAG dataset, and remove redemptions if they do not apppear in them

1. Sorting redemptions list

   - Sort by region, flight class then miles required

At the end of postprocessing, all entries across all months will be in the same standardised format. The JSONs are saved with a `-postprocessing` suffix in the filename.

## Analysis

The analysis step lives in `src/analyse.ts` (`npm run run:analyse`), with the individual analysis steps in the `src/analysis` folder.

It parses through all past redemptions and outputs 3 files:

1. `data/month-summary-analysis.json`

   - Breakdown of redemptions by each month

1. `data/route-analysis.json`

   - Breakdown of redemptions by each unique origin/destination route

1. `data/metadata.json`

   - Contains additional metadata for specific months/routes that will be displayed on the respective by-month/by-route page in the website
