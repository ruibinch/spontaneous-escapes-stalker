# Debugging postprocessing issues

Occasionally, issues are encountered during the postprocessing step which requires manual remediation.

The general remediation steps are:

- Fix issue at hand
- Run/rerun `npm run run:postscrape`

## No region found for origin="..."/destination="..."

This error is thrown in the `standardiseRegionField` step, and is typically a result of either the origin or destination being an unrecognised city name.

If it is a legitimate city name,

- Add the new city-region mapping to `cityMappings` dict in `src/lib/iata/mappings.ts`.

If it is an invalid/incorrect city name,

- Add it to the `cityNameOverride` dict in `src/postprocessing/cleanupCityFields.ts` to format it to an existing city name
- Common use cases:
  - Standardising names for cities with multiple international airports
  - Standardising names for cities with different English/local names
  - Adding appropriate accents to letters to reflect it in the local language
  - Fixing typos
