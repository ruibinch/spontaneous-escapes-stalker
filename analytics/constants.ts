// For API calls to vercel API
export const ENVIRONMENT = 'production';
export const PROJECT_ID = 'kfseanalysis';
export const TEAM_ID = 'team_N37S4JyA34doKOfgi5xRGElF';
export const LIMIT = 500;

// For generation of column values
export const WEBSITE_ID = '72c90a3b-768b-4f5e-af4e-87b45cb0d3ce';
export const HOSTNAME = 'www.kfseanalysis.com';
export const PAGE_TITLE = 'KrisFlyer Spontaneous Escapes Analysis';

export const EVENT_NAME_TO_KEY_MAP: Record<string, string | null> = {
  autocompleteSearchTermFilter: 'searchTerms',
  coffee: null,
  coffeeExternal: null,
  flightClassFilter: 'selectedFlightClassOption',
  monthFilter: 'selectedMonths',
  monthOverview: 'month',
  monthRangeFilter: 'selectedMonthRange',
  'playground:detailsTable': 'route',
  regionFilter: 'selectedRegions',
  routeOverview: 'route',
  searchTermFilter: 'searchKeyword',
  sidebar: 'page',
  silkairRoutesToggle: null,
  'theme:dark': null,
  'theme:light': null,
  'toggle:average/Total': 'value',
  'toggle:count/Pct': 'value',
  'toggle:latest/Oldest': 'value',
  'toggle:separate/Combined': 'value',
  yearFilter: 'selectedYears',
};
